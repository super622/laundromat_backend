const express = require('express');
const router = express.Router();

const {
  createNewQuestion,
  updateExistingQuestion,
  deleteExistingQuestion,
  getQuestionsWithAnswers,
  createOrUpdateAnswerController,
  getQuestionsWithAnswersById,
  getQuestionsWithSearchByID
} = require('../controllers/question.controller');

router.get('/allquestionwithanswer', getQuestionsWithAnswers);
router.post('/createquestion', createNewQuestion); // POST a new question
router.post('/createanswer', createOrUpdateAnswerController); // POST a new question
router.put('/:id', updateExistingQuestion); // PUT to update a question
router.delete('/:id', deleteExistingQuestion); // DELETE a question
router.get('/allquestionwithanswerbyid/:user_id', getQuestionsWithAnswersById);
router.post('/searchmyquestion', getQuestionsWithSearchByID);

module.exports = router;
