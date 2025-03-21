const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getPayment, createPaymentData, updatePaymentData, updatePaymentInfo, getUserFromDatabase, updateAmountData } = require('../models/payment.model');

const checkBalance = async () => {
    const balance = await stripe.balance.retrieve();
    return balance.available[0].amount || 0;
};

// Get all tags
const createPayment = async (req, res) => {
    const { userId, paymentId} = req.body;
    try {
        if (!userId || !paymentId) {
            return res.status(400).json({ message: 'User Id and Payment Id are required.' });
        }

        await createPaymentData(userId, paymentId);
        return res.status(201).json({ message: "Payment added successfully"});
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new tag
const updatePayment = async (req, res) => {
    const { userId, paymentId, amount } = req.body;

    try {
        if (!userId || !paymentId || !amount) {
            return res.status(400).json({ message: 'User Id and Payment Id, Amount are required.' });
        }

        const isExit = await getPayment(userId, paymentId);

        if (isExit) {
            await updatePaymentData(userId, paymentId, amount);
        } else {
            return res.status(400).json({ message: 'Not exist' });
        }
        return res.status(201).json({ message: "Payment updated successfully"});
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const payOut = async (req, res) => {
    return res.status(400).json({ error: "Working" });
    const { paymentId, amount } = req.body;
    try {
        const curBalance = await checkBalance();

        const payout = await stripe.payouts.create({
            amount: amount,
            currency: "usd",
            method: "standard",
        });
        console.log(payout);

        const payoutStatus = await stripe.payouts.retrieve(payout.payoutId);
        res.json(payoutStatus);

        res.json({ status: payoutStatus });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const processBankTransactionwithDeposit = async (req, res) => {
    try {
        const {
            accountNumber,
            routingNumber,
            amount,
            currency,
            amounts,
            verify,
            kycData // ✅ All personal info comes from kycData
        } = req.body;

        const fullName = `${kycData.first_name} ${kycData.last_name}`;

        // ✅ Step 1: Check if the customer exists, or create a new one
        let customers = await stripe.customers.list({ email: kycData.email });
        let customer = customers.data.length > 0 ? customers.data[0] : await stripe.customers.create({ email: kycData.email });

        // ✅ Step 2: Find an existing bank account for the customer
        const bankAccounts = await stripe.customers.listSources(customer.id, { object: "bank_account" });

        let bankAccount = bankAccounts.data.find(
            (ba) => ba.routing_number === routingNumber && ba.last4 === accountNumber.slice(-4)
        );

        // ✅ Step 3: If no bank account exists, create one (Initiates Micro-Deposits)
        if (!bankAccount) {
            bankAccount = await stripe.customers.createSource(customer.id, {
                source: {
                    object: "bank_account",
                    country: "US",
                    currency: "usd",
                    account_number: accountNumber,
                    routing_number: routingNumber,
                    account_holder_name: fullName,
                    account_holder_type: "individual",
                },
            });

            return res.json({
                success: true,
                customerId: customer.id,
                bankAccountId: bankAccount.id,
                message: "Micro-deposits sent. Check your bank account in 1-2 days and verify the amounts.",
            });
        }

        // ✅ Step 4: If account is NOT verified, require micro-deposit verification
        if (bankAccount.status !== "verified") {
            if (verify && amounts) {
                console.log("✅ Inside MICRO-DEPOSIT VERIFICATION flow, creating payeeAccount");
                // User submits micro-deposit amounts, so we verify the account
                await stripe.customers.verifySource(customer.id, bankAccount.id, { amounts });

                let paymentMethods = await stripe.paymentMethods.list({
                    customer: customer.id,
                    type: "us_bank_account",
                });

                 // Create the Payee account (handle errors here)
                 const payeeAccount = await stripe.accounts.create({
                    type: 'custom', 
                    country: "US",
                    email: kycData.email,
                    business_type: 'individual',
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true },
                    },
                    individual: {
                        first_name: kycData.first_name,
                        last_name: kycData.last_name,
                        id_number: kycData.full_ssn,
                        email: kycData.email,
                        phone: kycData.phone,
                        dob: kycData.dob,
                        address: kycData.address
                    },
                    business_profile: {
                        mcc: "7216", // Laundromat MCC
                        url: kycData.website,
                    },
                    tos_acceptance: {
                        date: Math.floor(Date.now() / 1000),
                        ip: req.ip || "127.0.0.1"
                    }
                });

                console.log('Payee Account ID:', payeeAccount.id); // Log the payee account ID
                const account = await stripe.accounts.retrieve(payeeAccount.id);
                console.log(account.capabilities);

                 // Ensure payeeAccount is valid
                if (!payeeAccount || !payeeAccount.id) {
                    return res.status(500).json({ error: "Failed to retrieve payee account ID." });
                }

                // ✅ Step 6: Link the verified bank account to the payee's Stripe account
                const externalBank = await stripe.accounts.createExternalAccount(payeeAccount.id, {
                    external_account: {
                        object: 'bank_account',
                        country: 'US',
                        currency: 'usd',
                        account_number: accountNumber,  // test value
                        routing_number: routingNumber,  // test value
                        account_holder_name: `${kycData.first_name} ${kycData.last_name}`,
                        account_holder_type: 'individual',
                    }
                });
                
                console.log("✅ External Bank Linked:", externalBank.id);  
                 // Optionally, you can store the payee's Stripe account ID and bank account info in your database
                //  await storePayeeInfo(email, payeeAccount.id, externalAccount.id);
        
                let paymentMethod = paymentMethods.data.find((pm) => pm.us_bank_account);
                // Step 2: If no payment method exists, create one
                if (!paymentMethod) {
                    paymentMethod = await stripe.paymentMethods.create({
                        type: "us_bank_account",
                        us_bank_account: {
                            account_number: updatedBankAccount.last4, // Using last4 digits to reference the bank account
                            routing_number: updatedBankAccount.routing_number,
                            account_holder_type: updatedBankAccount.account_holder_type,
                        },
                        billing_details: { name: fullName }, // Replace with actual name
                    });
        
                    // Attach the payment method to the customer
                    await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
                }
                await updatePaymentInfo(kycData.email, null, customer.id, paymentMethod.id, bankAccount.id, payeeAccount.id, externalBank.id);

                return res.json({
                    success: true,
                    message: "Bank account verified successfully! You can now make transactions.",
                    customerid : customer.id,
                    bankAccountId : bankAccount.id,
                    stripeAccountId: payeeAccount ? payeeAccount.id : null,
                    externalBankAccountId: externalBank.id,
                    bankstate : account.capabilities
                });
                
            }else{
                console.log("✅ Bank Account already verified — skipping payee creation");
            }

            return res.status(400).json({
                error: "Bank account is not verified. Enter micro-deposit amounts to verify.",
            });
        }

        // ✅ Step 5: If already verified, create & attach PaymentMethod
        let paymentMethods = await stripe.paymentMethods.list({
            customer: customer.id,
            type: "us_bank_account",
        });

        let paymentMethod = paymentMethods.data.find((pm) => pm.us_bank_account);

        if (!paymentMethod) {
            paymentMethod = await stripe.paymentMethods.create({
                type: "us_bank_account",
                us_bank_account: {
                    account_number: accountNumber,
                    routing_number: routingNumber,
                    account_holder_type: "individual",
                },
                billing_details: { name: name },
            });

            await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
        }

        // ✅ Step 6: If a payment amount is provided, process the transaction
        if (amount) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: currency || "usd",
                customer: customer.id,
                payment_method: paymentMethod.id,
                payment_method_types: ["us_bank_account"],
                confirm: true,
                mandate_data: {
                    customer_acceptance: {
                        type: "online",
                        online: {
                            ip_address: req.ip, // Captures the user's IP for compliance
                            user_agent: req.headers["user-agent"], // Captures user agent
                        },
                    },
                },
                return_url: "https://your-website.com/payment-success",
            });

            // await updatePaymentInfo(email, amount, customer.id, paymentMethod.id, bankAccount.id, null);

            return res.json({
                success: true,
                customerId: customer.id,
                paymentMethodId: paymentMethod.id,
                bankAccountId: bankAccount.id,
                paymentStatus: paymentIntent.status,
                message: "Payment processed successfully!",
            });
        }

        // await updatePaymentInfo(email, null, customer.id, paymentMethod.id, bankAccount.id, null);
        return res.json({
            success: true,
            customerId: customer.id,
            bankAccountId: bankAccount.id,
            paymentMethodId: paymentMethod.id,
            message: "Bank account verified and PaymentMethod attached successfully! You can now make transactions.",
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const checkStripeAccountStatus = async (req, res) => {
    try {
      const { payeeAccountId } = req.body;
  
      const account = await stripe.accounts.retrieve(payeeAccountId);
  
      return res.json({
        success: true,
        capabilities: account.capabilities,
        payouts_enabled: account.payouts_enabled,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
        status: (account.payouts_enabled && account.charges_enabled) ? "Complete" : "Pending"
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
}

// Example of function to store payee's Stripe account and bank account info
// async function storePayeeInfo(email, payeeAccountId, externalAccountId) {
//     // Replace this with your database logic
//     const payee = await Payee.create({
//         email: email,
//         stripeAccountId: payeeAccountId,
//         stripeBankAccountId: externalAccountId,
//     });

//     console.log('Payee info stored:', payee);
// }

const reDeposit = async (req, res) => {
    try {
        const { userId, amount, currency } = req.body;

        // Stripe's minimum amount per currency (modify as needed)
        const minAmount = currency === "usd" ? 50 : 50; // Adjust based on currency rules

        // Validate amount
        if (amount < minAmount) {
            return res.status(400).json({ error: `Amount must be at least $${(minAmount / 100).toFixed(2)} ${currency}` });
        }

        // 1️⃣ Fetch user’s saved payment method & customer ID from DB
        const user = await getUserFromDatabase(userId);
        if (!user || !user.paymentMethodId || !user.customerId) {
            return res.status(400).json({ error: "No payment method found. Please add a bank account first." });
        }

        // 2️⃣ Create a new payment using the saved payment method
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency || "usd",
            customer: user.customerId,
            payment_method: user.paymentMethodId,
            payment_method_types: ["us_bank_account"],
            confirm: true,
            return_url: "https://your-website.com/payment-success",
            mandate_data: {
                customer_acceptance: {
                    type: "online",
                    online: {
                        ip_address: req.ip,
                        user_agent: req.headers["user-agent"],
                    },
                },
            },
        });
        await updateAmountData(userId, amount);
        res.json({
            success: true,
            paymentIntentId: paymentIntent.id,
            paymentStatus: paymentIntent.status,
            message: "Deposit successful!",
        });
       


    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteConnectedAccount = async (req, res) => {
    try {
        const { stripeAccountId } = req.body;

        if (!stripeAccountId) {
            return res.status(400).json({ success: false, message: "stripeAccountId is required." });
        }

        // Delete the connected custom account
        const deletedAccount = await stripe.accounts.del(stripeAccountId);

        return res.json({
            success: true,
            message: "Connected Stripe account deleted successfully.",
            deletedAccount,
        });
    } catch (error) {
        console.error('Error deleting Stripe account:', error);
        return res.status(500).json({
            success: false,
            error: error.message || "An error occurred while deleting the account.",
        });
    }
};



// const withdrawFunds = async (req, res) => {
//     try {
//         const { userId, amount, currency } = req.body;

//         // Fetch user’s Stripe account details (Connected Account or your main Stripe balance)
//         const user = await getUserFromDatabase(userId);
//         if (!user || !user.customerId) {
//             return res.status(400).json({ error: "No Stripe account found. Please link a bank account first." });
//         }
//         console.log("user.stripeAccountId : ", user.stripeAccountId);
//         // Retrieve the bank accounts linked to the user's Stripe account
//         const bankAccounts = await stripe.accounts.listExternalAccounts(user.stripeAccountId, { object: "bank_account" });
        
//         // Find the bank account to use for the payout
//         const bankAccount = bankAccounts.data.find(account => account.id === user.bankAccountId);
        
//         if (!bankAccount) {
//             return res.status(400).json({ error: "No valid external bank account found for payouts." });
//         }

//         // Convert amount to cents (Stripe uses smallest currency unit)
//         // const amountInCents = Math.round(amount * 100);

//         // Create a payout to the user's bank account
//          // Create a payout
//          const payout = await stripe.payouts.create({
//             amount: amount,
//             currency: currency || "usd",
//             destination: user.bankAccountId, // Bank account linked to Stripe
//             method: "standard",
//         }, {
//             stripeAccount: user.stripeAccountId, // Required for Connect accounts
//         });

//         res.json({
//             success: true,
//             payoutId: payout.id,
//             status: payout.status,
//             message: "Withdrawal request successful!",
//         });

//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

const withdrawFunds = async (req, res) => {
    try {
        const { userId, amount, currency } = req.body;

        const user = await getUserFromDatabase(userId);
        if (!user || !user.stripeAccountId) {
            return res.status(400).json({ error: "No Stripe account found. Please link a bank account first." });
        }

        // Amount must be in cents
        // const amountInCents = Math.round(amount * 100);

        // ✅ No 'destination' needed for connected custom account payouts
        const payout = await stripe.payouts.create({
            amount: amount,
            currency: currency || "usd",
        }, {
            stripeAccount: user.stripeAccountId,
        });

        res.json({
            success: true,
            payoutId: payout.id,
            status: payout.status,
            message: "Withdrawal (Payout) successful!",
        });

    } catch (error) {
        console.error("Withdrawal Error:", error);
        res.status(400).json({ error: error.message });
    }
};


const sendMoney = async (req, res) => {
    try {
        const {
            payerCustomerId,      
            payerPaymentMethodId, 
            amount,               
            currency,             
            payeestripeAccountId, 
        } = req.body;

        // Step 1: Create the PaymentIntent for the payer (charge their bank account)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency || "usd",
            customer: payerCustomerId,
            payment_method: payerPaymentMethodId, // The payer's bank account payment method
            payment_method_types: ["us_bank_account"], // ACH payment method
            confirm: true, // Confirm the payment immediately
            transfer_data: {
                destination: payeestripeAccountId, // Payee's Stripe account ID (destination)
            },
            mandate_data: {
                customer_acceptance: {
                    type: "online",
                    online: {
                        ip_address: req.ip || "127.0.0.1",
                        user_agent: req.headers["user-agent"] || "Unknown",
                    },
                },
            },
            return_url: "https://your-website.com/payment-success", // URL after successful payment
        });

        // Step 2: If the payment is successful, return the payment intent and transfer details
        return res.json({
            success: true,
            message: "Payment processed successfully!",
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            payeeStripeAccountId: payeestripeAccountId,
            amountTransferred: amount,
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(400).json({
            error: error.message,
        });
    }
};


module.exports = { createPayment, updatePayment, payOut, processBankTransactionwithDeposit, reDeposit, withdrawFunds, sendMoney, deleteConnectedAccount, checkStripeAccountStatus};
