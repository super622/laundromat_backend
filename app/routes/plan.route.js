const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getAllPlans,
  addPlan
} = require('../controllers/plan.controller');

const router = express.Router();

// GET: List all plans
router.get('/list', getAllPlans);

// POST: Add a new plan
router.post(
  '/create',
  [
    body('name').notEmpty().withMessage('Plan name is required'),
    body('price').notEmpty().withMessage('Plan name is required')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  addPlan
);

module.exports = router;
