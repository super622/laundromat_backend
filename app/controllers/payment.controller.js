const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getPayment, createPaymentData, updatePaymentData, updatePaymentInfo, getUserFromDatabase } = require('../models/payment.model');

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
        const {name,  email, accountNumber, routingNumber, amount, currency, amounts, verify } = req.body;

        // ✅ Step 1: Check if the customer exists, or create a new one
        let customers = await stripe.customers.list({ email });
        let customer = customers.data.length > 0 ? customers.data[0] : await stripe.customers.create({ email });

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
                    account_holder_name: name,
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
                console.log("adsfasdf");
                // User submits micro-deposit amounts, so we verify the account
                await stripe.customers.verifySource(customer.id, bankAccount.id, { amounts });

                let paymentMethods = await stripe.paymentMethods.list({
                    customer: customer.id,
                    type: "us_bank_account",
                });

                const payeeAccount = await stripe.accounts.create({
                    type: 'custom', // You can use 'express' or 'standard' as well, depending on the use case
                    country: "US",
                    email: email,
                    business_type: 'individual',
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true }, // Needed for payouts
                    },
                });

                console.log('Payee Account ID:', payeeAccount.id); // Log the payee account ID

                // ✅ Step 6: Link the verified bank account to the payee's Stripe account
                const externalAccount = await stripe.accounts.createExternalAccount(payeeAccount.id, {
                    external_account: {
                        object: "bank_account",
                        country: "US", // Payee's bank country
                        currency: "usd", // Currency of the bank account
                        account_number: accountNumber,
                        routing_number: routingNumber,
                    },
                });


                 // Optionally, you can store the payee's Stripe account ID and bank account info in your database
                 await storePayeeInfo(email, payeeAccount.id, externalAccount.id);
        
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
                        billing_details: { name: name }, // Replace with actual name
                    });
        
                    // Attach the payment method to the customer
                    await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
                }
                await updatePaymentInfo(email, null, customer.id, paymentMethod.id, bankAccount.id, stripeAccountId);
                return res.json({
                    success: true,
                    message: "Bank account verified successfully! You can now make transactions.",
                    customerid : customer.id,
                    bankAccountId : bankAccount.id,
                    paymentMethodId : paymentMethod.id,
                    payeeAccountId: payeeAccount.id, // Payee's Stripe account ID
                });
                
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

            await updatePaymentInfo(email, amount, customer.id, paymentMethod.id, bankAccount.id, null);

            return res.json({
                success: true,
                customerId: customer.id,
                paymentMethodId: paymentMethod.id,
                bankAccountId: bankAccount.id,
                paymentStatus: paymentIntent.status,
                message: "Payment processed successfully!",
            });
        }

        await updatePaymentInfo(email, null, customer.id, paymentMethod.id, bankAccount.id, null);
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

// Example of function to store payee's Stripe account and bank account info
async function storePayeeInfo(email, payeeAccountId, externalAccountId) {
    // Replace this with your database logic
    const payee = await Payee.create({
        email: email,
        stripeAccountId: payeeAccountId,
        stripeBankAccountId: externalAccountId,
    });

    console.log('Payee info stored:', payee);
}

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

        res.json({
            success: true,
            paymentIntentId: paymentIntent.id,
            paymentStatus: paymentIntent.status,
            message: "Deposit successful!",
        });
        await updatePaymentInfo(user.email, amount, user.customerId, user.paymentMethodId, user.bankAccountId);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const withdrawFunds = async (req, res) => {
    try {
        const { userId, amount, currency } = req.body;

        // Fetch user’s Stripe account details (Connected Account or your main Stripe balance)
        const user = await getUserFromDatabase(userId);
        if (!user || !user.customerId) {
            return res.status(400).json({ error: "No Stripe account found. Please link a bank account first." });
        }

        // Convert amount to cents (Stripe uses smallest currency unit)
        // const amountInCents = Math.round(amount * 100);

        // Create a payout to the user's bank account
         // Create a payout
         const payout = await stripe.payouts.create({
            amount: amount,
            currency: currency || "usd",
            destination: user.bankAccountId, // Bank account linked to Stripe
            method: "standard",
        }, {
            stripeAccount: user.customerId, // Required for Connect accounts
        });

        res.json({
            success: true,
            payoutId: payout.id,
            status: payout.status,
            message: "Withdrawal request successful!",
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const sendMoney = async (req, res) => {
    try {
        const {
            payerCustomerId,          // Customer ID of the payer (payer's bank account)
            payerPaymentMethodId,     // Payment method ID (payer's bank account)
            amount,                   // Amount to transfer in cents (e.g., 5000 = $50.00)
            currency,                 // Currency (e.g., "usd")
            payeeCustomerId,          // Customer ID of the payee (payee's Stripe account)
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
                destination: payeeCustomerId, // Payee's Stripe account ID (destination)
            },
            return_url: "https://your-website.com/payment-success", // URL after successful payment
        });

        // Step 2: If the payment is successful, return the payment intent and transfer details
        return res.json({
            success: true,
            message: "Payment processed successfully!",
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            payeeCustomerId: payeeCustomerId,
            amountTransferred: amount,
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(400).json({
            error: error.message,
        });
    }
  };


module.exports = { createPayment, updatePayment, payOut, processBankTransactionwithDeposit, reDeposit, withdrawFunds, sendMoney};
