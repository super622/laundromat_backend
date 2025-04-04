const db = require('../config/db');

// Fetch all users
const getAllUsers = (callback) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, callback);
};

const fetchUserDataById = async (user_id) => {
  const query = `
    SELECT 
      u.id AS user_id,
      u.user_name,
      u.email,
      u.password,
      u.level,
      u.user_role,
      u.user_role_expertIn,
      u.user_role_businessTime,
      u.user_role_laundromatsCount,
      u.user_image,
      u.created_at,
      u.updated_at,
      u.user_address,
      u.user_phonenumber,
      u.user_verifyTime,
      u.user_verifycode,
      u.amount,
      u.stripeAccountId,
      u.subscriptionType,
      u.subscriptionDate,
      COALESCE(ulh.count, 0) AS login_count,
      COALESCE(q.question_count, 0) AS question_count,
      COALESCE(a.answer_count, 0) AS answer_count,
      COALESCE(qs.solved_count, 0) AS solved_count,
      COALESCE(li.like_count, 0) AS like_count,
      COALESCE(dli.dislike_count, 0) AS dislike_count
    FROM 
      users u
    LEFT JOIN 
      user_login_history ulh ON u.id = ulh.userid
    LEFT JOIN 
      (SELECT user_id, COUNT(*) AS solved_count FROM questions WHERE solved_state = 'Solved' GROUP BY user_id) qs 
      ON u.id = qs.user_id
    LEFT JOIN 
      (SELECT user_id, COUNT(*) AS like_count FROM likes_and_dislikes WHERE type = 1 GROUP BY user_id) li
      ON u.id = li.user_id
    LEFT JOIN 
      (SELECT user_id, COUNT(*) AS dislike_count FROM likes_and_dislikes WHERE type = 2 GROUP BY user_id) dli
      ON u.id = dli.user_id
    LEFT JOIN 
      (SELECT user_id, COUNT(*) AS question_count FROM questions GROUP BY user_id) q 
      ON u.id = q.user_id
    LEFT JOIN 
      (SELECT user_id, COUNT(DISTINCT question_id) AS answer_count FROM answers WHERE isWho != 'AI' GROUP BY user_id) a 
      ON u.id = a.user_id
    WHERE 
      u.id = ?;
  `;

  const [rows] = await db.promise().query(query, [user_id]);

  return rows.length > 0 ? rows[0] : null;
};

const updateQuestionCount = async (user_id) => {
  const updateQuery = `
    UPDATE users 
    SET question_cnt = COALESCE(question_cnt, 0) + 1 
    WHERE id = ?;
  `;
  await db.promise().query(updateQuery, [user_id]);
};

const trackUserLogin = async (user_id) => {
  const query = `
    SELECT *
    FROM user_login_history
    WHERE userid = ?
    ORDER BY updated_at DESC
    LIMIT 1;
  `;
  const [rows] = await db.promise().query(query, [user_id]);
  
  if (rows.length > 0) {
    const today = new Date();
    const lastUpdatedDate = new Date(rows[0].updated_at);

    const diffInTime = today.setHours(0, 0, 0, 0) - lastUpdatedDate.setHours(0, 0, 0, 0);
    const diffInDays = diffInTime / (1000 * 60 * 60 * 24);

    if (diffInDays === 1) {
      const updateQuery = `
        UPDATE user_login_history 
        SET count = count + 1, updated_at = NOW() 
        WHERE userid = ?;
      `;
      await db.promise().query(updateQuery, [user_id]);
    } else if (diffInDays > 1 || isNaN(lastUpdatedDate.getTime())) {
      const updateQuery = `
        UPDATE user_login_history 
        SET count = 1, updated_at = NOW() 
        WHERE userid = ?;
      `;
      await db.promise().query(updateQuery, [user_id]);
    }
  } else {
    const insertQuery = `
      INSERT INTO user_login_history (userid, count, created_at, updated_at)
      VALUES (
        ?,
        1,
        NOW(),
        NOW()
      );
    `;
    await db.promise().query(insertQuery, [user_id]);
  }
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

module.exports = { 
  getAllUsers, 
  fetchUserDataById, 
  checkUserEmailExists, 
  deleteUserById, 
  updateUserToken, 
  getAllMemberFCMTokens, 
  getFCMToken, 
  fetchUserDataByQuestionId,
  trackUserLogin,
  updateQuestionCount
};