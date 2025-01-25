const db = require('../config/db');

// Fetch all users
const getAllUsers = (callback) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, callback);
};

// Add a new user
const addUser = (userData, callback) => {
  const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
  const values = [userData.name, userData.email];
  db.query(sql, values, callback);
};

module.exports = { getAllUsers, addUser };