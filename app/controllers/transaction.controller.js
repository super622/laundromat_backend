const { createTransactionData, getSendersAmount } = require('../models/transaction.model');

// Get all tags
const createTransaction = async (req, res) => {
    const { senderId, receiverId, amount } = req.body;
    try {
        if (!senderId || !receiverId || !amount) {
            return res.status(400).json({ message: 'Sender Id and Receiver Id, Amount are required.' });
        }

        const senderAmount = await getSendersAmount(senderId);

        if (senderAmount < amount) {
            return res.status(400).json({ message: 'Not enough funds.' });
        } else {
            await createTransactionData(senderId, receiverId, amount);
            return res.status(201).json({ message: "Transaction completed"});
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createTransaction };
