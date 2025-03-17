const express = require('express');
const router = express.Router();
const { createTransaction } = require('../controllers/transaction.controller');

// Define the route for listing models
router.post('/create', createTransaction);

module.exports = router;
