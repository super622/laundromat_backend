const { getLikesAndDislikesByUser, getLikesAndDislikesByQuestion, createOrUpdateLikeOrDislike  } = require('../models/likes.model');


// Create or update like or dislike
const handleLikeOrDislike = async (req, res) => {
    const { user_id, question_id, type } = req.body;
  
    // Ensure type is either 1 (like) or 0 (dislike)
    if (![0, 1].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be 0 (dislike) or 1 (like).' });
    }
  
    try {
      const result = await createOrUpdateLikeOrDislike(user_id, question_id, type);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error handling like or dislike:', error.message);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch likes and dislikes count by user_id
const getLikesDislikesByUser = async (req, res) => {
    const { user_id } = req.params; // Extracting `user_id` from params

    try {
        const counts = await getLikesAndDislikesByUser(user_id);
        return res.status(200).json(counts);
    } catch (error) {
        console.error('Error fetching likes and dislikes counts by user:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch likes and dislikes count by question_id
const getLikesDislikesByQuestion = async (req, res) => {
    const { question_id } = req.params; // Extracting `question_id` from params

    try {
        const counts = await getLikesAndDislikesByQuestion(question_id);
        return res.status(200).json(counts);
    } catch (error) {
        console.error('Error fetching likes and dislikes counts by question:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getLikesDislikesByUser, getLikesDislikesByQuestion, handleLikeOrDislike };
