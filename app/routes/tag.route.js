const express = require('express');
const { body, validationResult } = require('express-validator');
const { getAllTags, addTag } = require('../controllers/tag.controller');

const router = express.Router();

// GET: List all tags
router.get('/list', getAllTags);

// POST: Add a new tag
router.post(
    '/create',
    [
        body('name').notEmpty().withMessage('Tag name is required'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    addTag
);

module.exports = router;
