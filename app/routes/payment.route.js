const express = require('express');
const router = express.Router();
const { createPayment, updatePayment, payOut, depositFund } = require('../controllers/payment.controller');

// Define the route for listing models
router.post('/create', createPayment);
router.post('/update', updatePayment);
router.post('/payout', payOut);
router.post('/deposit', depositFund);

module.exports = router;
