const db = require('../config/db');

const getPayment = async (userId, paymentId) => {
    const [data] = await db.promise().query('SELECT * FROM payment WHERE user_id = ? and payment_id = ?', [userId, paymentId]);
    return data.length > 0 ? data[0] : null;
};

const getUserFromDatabase = async (userId) => {
    const [data] = await db.promise().query('SELECT * FROM users WHERE id = ?', [userId]);
    return data.length > 0 ? data[0] : null;
};

const createPaymentData = async (userId, paymentId) => {
    const [rows] = await db.promise().query(
        "SELECT * FROM payment WHERE user_id = ?",
        [userId]
    );

    if (rows.length > 0) {
        await db.promise().query(
            "UPDATE payment SET payment_id = ? WHERE user_id = ?",
            [paymentId, userId]
        );
    } else {
        await db.promise().query(
            "INSERT INTO payment (user_id, payment_id, amount) VALUES (?, ?, 0)",
            [userId, paymentId]
        );
    }

    return true;
};

const updatePaymentData = async (userId, paymentId, amount) => {
    await db.promise().query(
        "UPDATE payment SET amount = ? WHERE user_id = ? AND payment_id = ?",
        [amount, userId, paymentId]
    );
    return { message: "Updated", updated: true };
};

const updatePaymentInfo = async (email, amount, customerId, paymentMethodId, bankAccountId, stripeAccountId) => {
    if (amount) {
        await db.promise().query(
            "UPDATE users SET paymentMethodId = ?, bankAccountId = ?, customerId = ?, amount = amount + ?, stripeAccountId = ? WHERE email = ?",
            [paymentMethodId, bankAccountId, customerId, amount, stripeAccountId, email]
        );
    } else {
        await db.promise().query(
            "UPDATE users SET paymentMethodId = ?, bankAccountId = ?, customerId = ?, stripeAccountId = ? WHERE email = ?",
            [paymentMethodId, bankAccountId, customerId, stripeAccountId, email]
        );
    }

    return { message: "Updated", updated: true };
};

module.exports = { getPayment, createPaymentData, updatePaymentData, updatePaymentInfo, getUserFromDatabase };
