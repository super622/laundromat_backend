const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  uploadImage
} = require('../controllers/image.controller');

const router = express.Router();

// POST: Add a new role
router.post(
  '/upload',
  [
    body('file').notEmpty().withMessage('File is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  uploadImage
);

module.exports = router;
