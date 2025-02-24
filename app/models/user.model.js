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
      user_image,
      created_at,
      updated_at,
      user_address,
      user_phonenumber,
      user_verifyTime,
      user_verifycode
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

// Delete user by ID
const deleteUserById = async (user_id) => {
  const query = `DELETE FROM users WHERE id = ?`;

  try {
    const [result] = await db.promise().query(query, [user_id]);
    return result.affectedRows > 0; // Returns true if a row was deleted, false otherwise
  } catch (error) {
    throw error;
  }
};

const updateUserToken = async (id, token) => {
  const [result] = await db.promise().query(
    'UPDATE users SET fcm_token = ? WHERE id = ?',
    [token, id]
  );
};

const getAllMemberFCMTokens = async (user_id) => {
  const query = `
    SELECT fcm_token 
    FROM users 
    WHERE fcm_token IS NOT NULL;
  `;

  // const query = `
  //   SELECT fcm_token 
  //   FROM users 
  //   WHERE fcm_token IS NOT NULL AND id != ?;
  // `;

  try {
    const [rows] = await db.promise().query(query);
    // const [rows] = await db.promise().query(query, [user_id]);
    const fcmTokens = rows.map(row => row.fcm_token);
    
    return fcmTokens;
  } catch (error) {
    console.error("Error fetching FCM tokens:", error);
    return [];
  }
};

const getFCMToken = async (user_id) => {
  const query = `
    SELECT 
      fcm_token
    FROM 
      users
    WHERE 
      id = ?;
  `;

  const [rows] = await db.promise().query(query, [user_id]);
  return rows.length > 0 ? rows[0].fcm_token : null;
};

const fetchUserDataByQuestionId = async (question_id) => {
  const questionQuery = `
    SELECT
      user_id
    FROM
      questions
    WHERE
      id = ?;
  `;
  const userQuery = `
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
      user_image,
      created_at,
      updated_at,
      user_address,
      user_phonenumber
    FROM 
      users
    WHERE 
      id = ?;
  `;

  const [question] = await db.promise().query(questionQuery, [question_id]);
  const [user] = await db.promise().query(userQuery, [question[0].user_id]);
  return user.length > 0 ? user[0] : null;
};

module.exports = { getAllUsers, fetchUserDataById, checkUserEmailExists, deleteUserById, updateUserToken, getAllMemberFCMTokens, getFCMToken, fetchUserDataByQuestionId };