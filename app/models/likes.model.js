const db = require('../config/db'); // Updated to use `promiseDb`

// Create or update a like or dislike
const createOrUpdateLikeOrDislike = async (user_id, question_id, type) => {
  try {
    // Check if a record exists for the given user_id and question_id
    const [existingRecord] = await db.promise().query(
      'SELECT id FROM likes_and_dislikes WHERE user_id = ? AND question_id = ?',
      [user_id, question_id]
    );

    if (existingRecord.length > 0) {
      // Update the existing record
      const [updateResult] = await db.promise().query(
        'UPDATE likes_and_dislikes SET type = ? WHERE user_id = ? AND question_id = ?',
        [type, user_id, question_id]
      );
      return { message: 'Record updated successfully', updated: true };
    } else {
      // Create a new record
      const [insertResult] = await db.promise().query(
        'INSERT INTO likes_and_dislikes (user_id, question_id, type) VALUES (?, ?, ?)',
        [user_id, question_id, type]
      );
      return { message: 'Record created successfully', created: true };
    }
  } catch (error) {
    throw new Error(`Error creating or updating like/dislike: ${error.message}`);
  }
};


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

module.exports = { createOrUpdateLikeOrDislike, getLikesAndDislikesByUser, getLikesAndDislikesByQuestion };
