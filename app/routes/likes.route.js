const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
    getLikesDislikesByUser,
    getLikesDislikesByQuestion,
    handleLikeOrDislike 
} = require('../controllers/likes.controller.js');

const router = express.Router();

router.post('/likeordislike', handleLikeOrDislike);

// GET: Fetch likes and dislikes count by user_id
router.get(
    '/user/:user_id',
    [
        param('user_id').notEmpty().isInt().withMessage('User ID must be a valid integer'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    getLikesDislikesByUser
);

// GET: Fetch likes and dislikes count by question_id
router.get(
    '/question/:question_id',
    [
        param('question_id').notEmpty().isInt().withMessage('Question ID must be a valid integer'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    getLikesDislikesByQuestion
);

module.exports = router;
