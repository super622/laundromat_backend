const db = require('../config/db');

const getPayment = async (userId, paymentId) => {
    const [data] = await db.promise().query('SELECT * FROM payment WHERE user_id = ? and payment_id = ?', [userId, paymentId]);
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

module.exports = { getPayment, createPaymentData, updatePaymentData };
