const db = require('../config/db');

// Find user by email
const findUserByEmail = async (email) => {
  const [user] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
  return user.length > 0 ? user[0] : null;
};

// Create a new user
const createUser = async (name, email, hashedPassword, role, level, user_number) => {
  await db.promise().query('INSERT INTO users (user_name, email, password, user_role, level, user_number) VALUES (?, ?, ?, ?, ?, ?)', [
    name,
    email,
    hashedPassword,
    role,
    level,
    user_number
  ]);
};

module.exports = { findUserByEmail, createUser };
