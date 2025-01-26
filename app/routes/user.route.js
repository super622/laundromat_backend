const express = require('express');
const { fetchUsers } = require('../controllers/user.controller');
const router = express.Router();

// Define routes
router.get('/', fetchUsers);       // GET /users      // POST /users

module.exports = router;
