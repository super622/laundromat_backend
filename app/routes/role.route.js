const express = require('express');
const { body, validationResult } = require('express-validator');
const { getAllRoles, addRole } = require('../controllers/role.controller');
const router = express.Router();

router.get('/list', getAllRoles);

// POST: Add New Role
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

module.exports = router;
