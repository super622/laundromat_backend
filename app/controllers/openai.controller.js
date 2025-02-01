const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use your .env file for security
});

const listAvailableModels = async (req, res) => {
  try {
    const response = await openai.models.list(); // Fetch all available models
    res.status(200).json({
      message: 'Available models fetched successfully',
      models: response.data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching models',
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { listAvailableModels };
