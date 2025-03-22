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

const updatePaymentInfo = async (email, amount, customerId, paymentMethodId, bankAccountId, stripeAccountId, externalAccountID) => {
    if (amount) {
        await db.promise().query(
            "UPDATE users SET paymentMethodId = ?, bankAccountId = ?, customerId = ?, amount = amount + ?, stripeAccountId = ?, externalAccountId = ? WHERE email = ?",
            [paymentMethodId, bankAccountId, customerId, amount, stripeAccountId, externalAccountID, email]
        );
    } else {
        await db.promise().query(
            "UPDATE users SET paymentMethodId = ?, bankAccountId = ?, customerId = ?, stripeAccountId = ?, externalAccountId = ? WHERE email = ?",
            [paymentMethodId, bankAccountId, customerId, stripeAccountId,  externalAccountID, email]
        );
    }

    return { message: "Updated", updated: true };
};

const updateAmountData = async (userid, amount) => {
    const updateAmount = amount ?? 0;
    await db.promise().query(
        "UPDATE users SET amount = COALESCE(amount, 0) + ? WHERE id = ?",
        [updateAmount, userid]
    );

    return { message: "Updated", updated: true };
}

const transferAmount = async (senderId, receiverId, amount) => {
    const updateAmount = amount ?? 0;
    const sender = await getUserFromDatabase(senderId);
    const receiver = await getUserFromDatabase(receiverId);

    if (!sender) {
        return { status: false, msg: 'Sender not exist' };
    }

    if (!receiver) {
        return { status: false, msg: 'Receiver not exist' };
    }

    if (sender && sender.amount < updateAmount) {
        return { status: false, msg: 'Not enough' };
    }

    await db.promise().query(
        `UPDATE users SET amount = COALESCE(amount, 0) - ${updateAmount} WHERE id = ${senderId}`,
        []
    );
    await db.promise().query(
        `UPDATE users SET amount = COALESCE(amount, 0) + ${updateAmount} WHERE id = ${receiverId}`,
        []
    );

    return { status: true, msg: 'Success' };
};

module.exports = { getPayment, transferAmount, createPaymentData, updatePaymentData, updatePaymentInfo, getUserFromDatabase, updateAmountData };
