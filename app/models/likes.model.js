const db = require('../config/db'); // Updated to use `promiseDb`

// Fetch likes and dislikes counts by user_id
const getLikesAndDislikesByUser = async (user_id) => {
  try {
    const [likesResult] = await db.promise().query(
      'SELECT COUNT(*) AS count FROM likes_and_dislikes WHERE user_id = ? AND type = 1',
      [user_id]
    );
    const [dislikesResult] = await db.promise().query(
      'SELECT COUNT(*) AS count FROM likes_and_dislikes WHERE user_id = ? AND type = 0',
      [user_id]
    );

    return {
      likes: likesResult[0].count || 0,
      dislikes: dislikesResult[0].count || 0,
    };
  } catch (error) {
    throw new Error(`Error fetching likes and dislikes by user: ${error.message}`);
  }
};

// Fetch likes and dislikes counts by question_id
const getLikesAndDislikesByQuestion = async (question_id) => {
  try {
    const [likesResult] = await db.promise().query(
      'SELECT COUNT(*) AS count FROM likes_and_dislikes WHERE question_id = ? AND type = 1',
      [question_id]
    );
    const [dislikesResult] = await db.promise().query(
      'SELECT COUNT(*) AS count FROM likes_and_dislikes WHERE question_id = ? AND type = 0',
      [question_id]
    );

    return {
      likes: likesResult[0].count || 0,
      dislikes: dislikesResult[0].count || 0,
    };
  } catch (error) {
    throw new Error(`Error fetching likes and dislikes by question: ${error.message}`);
  }
};

module.exports = { getLikesAndDislikesByUser, getLikesAndDislikesByQuestion };
