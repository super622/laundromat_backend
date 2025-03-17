const db = require('../config/db');

// Find exist transaction
const getSendersAmount = async (userId) => {
    const [data] = await db.promise().query('SELECT * FROM payment WHERE user_id = ?', [userId]);
    return data.length > 0 ? data[0]['amount'] : 0;
};

// Create a new plan
const createTransactionData = async (senderId, receiverId, amount) => {
    await db.promise().query(
        `UPDATE payment SET amount = amount - ${amount} WHERE user_id = ${senderId}`,
        []
    );
    await db.promise().query(
        `UPDATE payment SET amount = amount + ${amount} WHERE user_id = ${receiverId}`,
        []
    );
    await db.promise().query('INSERT INTO transaction (sender_id, receiver_id, amount) VALUES (?, ?, ?)', [
        senderId,
        receiverId,
        amount
    ]);
    return true;
};

module.exports = { getSendersAmount, createTransactionData };
