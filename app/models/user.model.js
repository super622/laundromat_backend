const db = require('../config/db');

// Fetch all users
const getAllUsers = (callback) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, callback);
};

const fetchUserDataById = async (user_id) => {
  const query = `
    SELECT 
      id AS user_id,
      user_name,
      email,
      password,
      level,
      user_role,
      user_role_expertIn,
      user_role_businessTime,
      user_role_laundromatsCount,
      created_at,
      updated_at
    FROM 
      users
    WHERE 
      id = ?;
  `;

  const [rows] = await db.promise().query(query, [user_id]);

  // Return the first row if found
  return rows.length > 0 ? rows[0] : null;
};

const checkUserEmailExists = async (email) => {
  const query = `
    SELECT id AS user_id
    FROM users
    WHERE email = ?;
  `;

  const [rows] = await db.promise().query(query, [email]);

  return rows.length > 0 ? rows[0].user_id : null; // Return user_id if found, otherwise null
};



module.exports = { getAllUsers, fetchUserDataById, checkUserEmailExists };