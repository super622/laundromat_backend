const { getAllUsers } = require('../models/user.model');

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

module.exports = { fetchUsers };
