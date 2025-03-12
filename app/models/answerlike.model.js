const db = require("../config/db");

// Add or update a like/dislike
const likeOrDislike = async (user_id, answer_id, type) => {
  try {
    if (![1, 0, -1].includes(type)) {
      throw new Error("Invalid type. Must be 1 (like), 0 (dislike), or -1 (neutral)");
    }

    // Check if a record exists for the given user_id and answer_id
    const [existingRecord] = await db.promise().query(
      "SELECT id FROM answer_likes WHERE user_id = ? AND answer_id = ?",
      [user_id, answer_id]
    );

    if (existingRecord.length > 0) {
      if (type === -1) {
        // Remove reaction if type is -1 (neutral)
        await db.promise().query(
          "DELETE FROM answer_likes WHERE user_id = ? AND answer_id = ?",
          [user_id, answer_id]
        );
        return { message: "Reaction removed (neutral)", removed: true };
      } else {
        // Update existing reaction
        await db.promise().query(
          "UPDATE answer_likes SET type = ? WHERE user_id = ? AND answer_id = ?",
          [type, user_id, answer_id]
        );
        return { message: "Reaction updated", updated: true };
      }
    } else {
      if (type !== -1) {
        // Insert new reaction if type is not neutral
        await db.promise().query(
          "INSERT INTO answer_likes (user_id, answer_id, type) VALUES (?, ?, ?)",
          [user_id, answer_id, type]
        );
        return { message: "Reaction added", created: true };
      } else {
        return { message: "No reaction to add", neutral: true };
      }
    }
  } catch (error) {
    throw new Error(`Error creating or updating like/dislike: ${error.message}`);
  }
};

// Get total likes and dislikes for an answer
const getLikes = async (answer_id) => {
  try {
    const [result] = await db.promise().query(
      `SELECT 
        SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) AS likes, 
        SUM(CASE WHEN type = 0 THEN 1 ELSE 0 END) AS dislikes 
      FROM answer_likes 
      WHERE answer_id = ?`,
      [answer_id]
    );
    return result[0];
  } catch (error) {
    throw new Error(`Error fetching likes/dislikes: ${error.message}`);
  }
};

module.exports = {
  likeOrDislike,
  getLikes
};
