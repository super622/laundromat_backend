const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getAllRoles,
  addRole,
  getQuestionByRoldId,
  addRoleQuestion,
} = require('../controllers/role.controller');

const router = express.Router();

// GET: List all roles
router.get('/list', getAllRoles);

// POST: Add a new role
router.post(
  '/create',
  [
    body('name').notEmpty().withMessage('Role name is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  addRole
);

// GET: Fetch questions by role ID
router.get(
  '/questions/:id',
  (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Role ID is required' });
    }
    next();
  },
  getQuestionByRoldId
);

// POST: Add a new question to a role
router.post(
  '/questions/create',
  [
    body('id').notEmpty().withMessage('Role ID is required'),
    body('question').notEmpty().withMessage('Question text is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  addRoleQuestion
);

module.exports = router;
