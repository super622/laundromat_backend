const { getAllUsers, addUser } = require('../models/user.model');

// Get all users
const fetchUsers = (req, res) => {
  getAllUsers((err, results) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      return res.status(500).send('Database query error');
    }
    res.json(results);
  });
};

// Add a new user
const createUser = (req, res) => {
  const userData = req.body;
  addUser(userData, (err, results) => {
    if (err) {
      console.error('Error adding user:', err.message);
      return res.status(500).send('Database insertion error');
    }
    res.status(201).json({ message: 'User added successfully', userId: results.insertId });
  });
};

module.exports = { fetchUsers, createUser };
