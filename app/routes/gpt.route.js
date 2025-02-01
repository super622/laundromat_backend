const express = require('express');
const router = express.Router();
const { listAvailableModels } = require('../controllers/openai.controller');

// Define the route for listing models
router.get('/list', listAvailableModels);

module.exports = router;
