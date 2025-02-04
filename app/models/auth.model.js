const db = require('../config/db');

// Find user by email
const findUserByEmail = async (email) => {
  const [user] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
  return user.length > 0 ? user[0] : null;
};

// Find last user's user_number
// const getLatestUserNumber = async () => {
//   try {
//     const [rows] = await db.promise().query('SELECT user_number FROM users ORDER BY user_number DESC LIMIT 1');
//     return rows.length > 0 ? rows[0]?.user_number + 1 : 1; // Return the latest user or null if no users exist
//   } catch (error) {
//     throw new Error(`Error fetching the latest user: ${error.message}`);
//   }
// };

// Create a new user
// Create a new user and return the inserted user ID
const createUser = async (name, email, password, role, level, role_expertIn, role_businessTime, role_laundromatsCount) => {
  const [result] = await db.promise().query(
    'INSERT INTO users (user_name, email, password, user_role, level, user_role_expertIn, user_role_businessTime, user_role_laundromatsCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, email, password, role, level, role_expertIn, role_businessTime, role_laundromatsCount]
  );
  return result.insertId; // Return the ID of the newly inserted user
};

module.exports = { createUser, findUserByEmail };
