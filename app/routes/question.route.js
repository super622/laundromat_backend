const express = require('express');
const router = express.Router();

const {
  getQuestions,
  getQuestion,
  createNewQuestion,
  updateExistingQuestion,
  deleteExistingQuestion,
  getQuestionsWithAnswers
} = require('../controllers/question.controller');

router.get('/allquestionwithanswer', getQuestionsWithAnswers);
router.get('/', getQuestions); // GET all questions
router.get('/:id', getQuestion); // GET a specific question by ID
router.post('/createquestion', createNewQuestion); // POST a new question
router.put('/:id', updateExistingQuestion); // PUT to update a question
router.delete('/:id', deleteExistingQuestion); // DELETE a question

module.exports = router;
