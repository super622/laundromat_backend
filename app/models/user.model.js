const db = require('../config/db');

// Fetch all users
const getAllUsers = (callback) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, callback);
};


module.exports = { getAllUsers };