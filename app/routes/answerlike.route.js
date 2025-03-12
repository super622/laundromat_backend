const express = require("express");
const router = express.Router();
const {
    likeOrDislikeAnswer,
    getAnswerLikes
} = require('../controllers/answerLike.controller');

router.post("/", likeOrDislikeAnswer);
router.get("/:answer_id", getAnswerLikes);

module.exports = router;
