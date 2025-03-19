const express = require('express');
const router = express.Router();
const { createPayment, updatePayment, payOut, processBankTransactionwithDeposit, reDeposit, withdrawFunds, sendMoney} = require('../controllers/payment.controller');

// Define the route for listing models
router.post('/create', createPayment);
router.post('/update', updatePayment);
router.post('/payout', payOut);
router.post('/bankdeposit', processBankTransactionwithDeposit);
router.post('/redeposit', reDeposit);
router.post('/withdraw', withdrawFunds);
router.post('/sendmoney', sendMoney);

module.exports = router;
