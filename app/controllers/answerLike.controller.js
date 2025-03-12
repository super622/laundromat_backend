const { likeOrDislike, getLikes } = require("../models/answerlike.model");

const likeOrDislikeAnswer = async (req, res) => {
  const { answer_id, user_id, type } = req.body;

  if (![1, 0, -1].includes(type)) {
    return res.status(400).json({ message: "Invalid type. Must be 1 (like), 0 (dislike), or -1 (neutral)." });
  }

  try {
    const result = await likeOrDislike(user_id, answer_id, type);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error handling like or dislike for answer:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAnswerLikes = async (req, res) => {
  const { answer_id } = req.params;

  try {
    const result = await getLikes(answer_id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching answer likes:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { likeOrDislikeAnswer, getAnswerLikes };
