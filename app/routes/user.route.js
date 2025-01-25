const express = require('express');
const { fetchUsers, createUser } = require('../controllers/user.controller');
const router = express.Router();

// Define routes
router.get('/', fetchUsers);       // GET /users
router.post('/', createUser);      // POST /users

module.exports = router;
