const express = require('express');
const { fetchUsers, getUserDataById, checkGoogleUser, deleteUserAccount} = require('../controllers/user.controller');
const router = express.Router();

// Define routes
router.get('/', fetchUsers);       // GET /users      // POST /users
router.get('/userdata/:user_id', getUserDataById);
router.post('/googlecheck', checkGoogleUser);
router.post('/deleteuser', deleteUserAccount);
module.exports = router;
