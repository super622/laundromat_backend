const {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    insertAnswer,
    getAllQuestionsWithAnswers,
    createOrUpdateAnswer,
    getAllQuestionsWithAnswersByID,
    getAllQuestionsWithAnswersBySearch,
    getAllQuestionsWithAnswersBySearchByUserId  
  } = require('../models/question.model');

  const OpenAI = require('openai'); // Correct import for OpenAI 4.x+

  // Initialize OpenAI (No `Configuration` class needed)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const getQuestionsWithAnswers = async (req, res) => {
    try {
      const questions = await getAllQuestionsWithAnswers();
      res.status(200).json({
        message: 'Questions with answers fetched successfully',
        questions,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  };

  // Create a new question
  const createNewQuestion = async (req, res) => {
    const {
      userID,
      question,
      brand,
      serial_number,
      pounds,
      year,
      category,
      tags,
      file,
      image,
    } = req.body;
  
    // Validate required fields
    const missingFields = [];
    if (!userID) missingFields.push('userID');
    if (!question) missingFields.push('question');
    if (!brand) missingFields.push('brand');
    if (!serial_number) missingFields.push('serial_number');
    if (!pounds) missingFields.push('pounds');
    if (!year) missingFields.push('year');
    if (!category) missingFields.push('category');
    if (!tags) missingFields.push('tags');
  
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Validation error',
        missingFields,
      });
    }
  
    try {
      // Create the question and get the new question ID
      const questionId = await createQuestion({
        userID,
        question,
        brand,
        serial_number,
        pounds,
        year,
        category,
        tags,
        file,
        image,
      });
  
      // Generate an answer using GPT
      const gptResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Use the appropriate model
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert in the laundry business, including operations, equipment, customer service, and best practices. Your responses should be tailored to the laundry industry and limited to 5 concise sentences.'
          },
          { 
            role: 'user', 
            content: `Provide a detailed answer for the following question related to the laundry business: "${question}"`
          },
        ],
        max_tokens: 200, // Adjust token limit to control response length (e.g., ~50 tokens per sentence)
      });

      const answer = gptResponse.choices[0].message.content.trim();

  
      // Insert the GPT-generated answer into the answers table
      await insertAnswer({
        question_id: questionId,
        answer,
        user_id: userID,
        is_who : "AI"
      });
  
      res.status(201).json({
        message: 'Question and answer created successfully',
        questionId,
        answer,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  };
  
  // Update a question by ID
  const updateExistingQuestion = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      const question = await getQuestionById(id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      await updateQuestion(id, updates);
      res.status(200).json({ message: 'Question updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Delete a question by ID
  const deleteExistingQuestion = async (req, res) => {
    const { id } = req.params;
  
    try {
      const question = await getQuestionById(id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      await deleteQuestion(id);
      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  const createOrUpdateAnswerController = async (req, res) => {
    const { question_id, user_id, answer, isWho } = req.body;
  
    if (!question_id || !user_id || !answer) {
      return res.status(400).json({ message: "Missing required fields." });
    }
  
    try {
      const result = await createOrUpdateAnswer({ question_id, user_id, answer, isWho });
      if (result) {
        return res.status(200).json({
          message: result === "insert"
            ? "Answer created successfully."
            : "Answer updated successfully.",
          created: !!result,
          updated: !result,
        });
      } else {
        return res.status(500).json({ message: "Failed to create or update the answer." });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  const getQuestionsWithAnswersById = async (req, res) => {
    try {
      const { user_id } = req.params; // Get user_id from request parameters
  
      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      const questions = await getAllQuestionsWithAnswersByID(user_id);
      res.status(200).json({
        message: 'Questions with answers fetched successfully,' + user_id,
        questions,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  };

  const getQuestionsWithSearchByID = async (req, res) => {
    try {
      const { user_id, search, categories } = req.body; // Retrieve user_id, search, and categories from request body
  
      if (!user_id || !categories) {
        return res.status(400).json({ message: 'User ID and categories are required' });
      }
  
      const parsedCategories = Array.isArray(categories) ? categories : []; // Ensure categories is an array
  
      const questions = await getAllQuestionsWithAnswersBySearchByUserId(user_id, search || '', parsedCategories);
  
      res.status(200).json({
        message: 'Questions with answers fetched successfully',
        questions,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  };
  
  const getQuestionsWithSearch = async (req, res) => {
    try {
      const { search, categories } = req.body;
  
      if (!search || !categories) {
        return res.status(400).json({ message: 'Search and categories are required' });
      }
  
      const parsedCategories = Array.isArray(categories) ? categories : [];
  
      const questions = await getAllQuestionsWithAnswersBySearch(search || '', parsedCategories);
  
      res.status(200).json({
        message: 'Questions with answers fetched successfully',
        questions,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  };
  
  
  module.exports = {
    getQuestionsWithAnswers,
    createNewQuestion,
    updateExistingQuestion,
    deleteExistingQuestion,
    createOrUpdateAnswerController,
    getQuestionsWithAnswersById,
    getQuestionsWithSearchByID,
    getQuestionsWithSearch
  };
  