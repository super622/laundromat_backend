const express = require('express');
const router = express.Router();
const { createPayment, updatePayment, payOut, processBankTransactionwithDeposit, reDeposit, withdrawFunds, sendMoney, deleteConnectedAccount, checkStripeAccountStatus} = require('../controllers/payment.controller');

// Define the route for listing models
router.post('/create', createPayment);
router.post('/update', updatePayment);
router.post('/payout', payOut);
router.post('/bankdeposit', processBankTransactionwithDeposit);
router.post('/redeposit', reDeposit);
router.post('/withdraw', withdrawFunds);
router.post('/sendmoney', sendMoney);
router.post('/deleteConnectedAccount', deleteConnectedAccount);
router.post('/checkaccountstatus', checkStripeAccountStatus);

module.exports = router;
