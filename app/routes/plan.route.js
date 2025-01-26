const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getAllPlans,
  addPlan,
  getFeaturesById,
  addFeature
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

// GET: Fetch feature by plan ID
router.get(
    '/feature/:id',
    (req, res, next) => {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Plan ID is required' });
      }
      next();
    },
    getFeaturesById
);

// POST: Add a new feature to a payment plan
router.post(
    '/feature/create',
    [
      body('id').notEmpty().withMessage('Plan ID is required'),
      body('feature').notEmpty().withMessage('Feature text is required'),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    addFeature
);

module.exports = router;
