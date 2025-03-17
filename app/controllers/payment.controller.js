const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getPayment, createPaymentData, updatePaymentData } = require('../models/payment.model');

const checkBalance = async () => {
    const balance = await stripe.balance.retrieve();
    return balance.available[0].amount || 0;
};

const createCustomer = async (email, name) => {
    const customer = await stripe.customers.create({
        email,
        name
    });
    return customer.id
}

const createPaymentMethod = async (accountNumber, routingNumber, email, name) => {
    try {
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'us_bank_account',
            us_bank_account: {
                account_number: accountNumber,
                routing_number: routingNumber,
                account_holder_type: 'individual'
            },
            billing_details: {
                name: name,
                email: email,
            },
        });

        console.log('PaymentMethod Created:', paymentMethod.id);
        return paymentMethod.id;
    } catch (error) {
        console.error('Error creating payment method:', error);
    }
};

const verifyBankAccount = async (paymentMethodId) => {
    try {
        const verification = await stripe.paymentMethods.verify(paymentMethodId);
        console.log('Verification initiated:', verification);
    } catch (error) {
        console.error('Error verifying payment method:', error);
    }
};

const confirmVerification = async (paymentMethodId, amount1, amount2) => {
    try {
        const verification = await stripe.paymentMethods.verify(paymentMethodId, {
            amounts: [amount1, amount2]
        });
        console.log('Verification confirmed:', verification);
    } catch (error) {
        console.error('Error confirming verification:', error);
    }
};

const getCustomerByPaymentMethod = async (email) => {
    try {
        const customers = await stripe.customers.list({
            limit: 1,
            email
        });
        return customers.data.length > 0 ? customers.data[0].id : null;
    } catch (error) {
        console.error("Error retrieving customer by email:", error.message);
        return null;
    }
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

const depositFund = async (req, res) => {
    return res.status(400).json({ error: "Working" });
    const { paymentId, amount, email, name, accountNumber = '000123456789', routingNumber = '110000000' } = req.body;
    try {
        if (!paymentId || !amount || amount <= 0 || !email) {
            return res.status(400).json({ error: "Invalid request parameters" });
        }

        const paymentMethod = await createPaymentMethod(accountNumber, routingNumber, email, name);
        // await verifyBankAccount(paymentMethod);
        // await confirmVerification(paymentMethod, 20, 30);

        let customer = await getCustomerByPaymentMethod(email);

        if (!customer) {
            if (!email || !name) {
                return res.status(400).json({ error: "Invalid request parameters" });
            }
            customer = await createCustomer(email, name);
        }

        // const retrievePaymentMethod = await stripe.paymentMethods.retrieve(paymentId);

        // let bankAccountToken = "";

        // if (retrievePaymentMethod.type === "us_bank_account") {
        //     bankAccountToken = await stripe.tokens.create({
        //         bank_account: {
        //             country: 'US',
        //             currency: 'usd',
        //             account_holder_name: name,
        //             account_holder_type: 'individual',
        //             routing_number: '110000000',
        //             account_number: '000123456789'
        //         }
        //     });

        //     // const paymentMethod = await stripe.paymentMethods.create({
        //     //     type: 'us_bank_account',
        //     //     us_bank_account: {
        //     //         account_holder_type: 'individual',
        //     //         account_number: '000123456789',
        //     //         routing_number: '110000000',
        //     //     },
        //     //     billing_details: {
        //     //         name: name,
        //     //     },
        //     // });
        //     // console.log(paymentMethod);
        // }


        // await stripe.paymentMethods.attach(paymentMethod, { customer });

        const paymentIntent = await stripe.paymentIntents.create({
            // amount: amount * 100,
            // currency: "usd",
            // payment_method: paymentMethod,
            // customer,
            // confirm: true,
            // automatic_payment_methods: {
            //     enabled: true,
            //     allow_redirects: "never"
            // },
            amount: amount * 100,
            currency: 'usd',
            payment_method: paymentMethod,
            customer,
            // confirmation_method: 'manual',
            payment_method_types: ["us_bank_account"],
            confirm: true,
            return_url: "https://google.com"
        });
        console.log(paymentIntent);

        res.json({ status: customer });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createPayment, updatePayment, payOut, depositFund };
