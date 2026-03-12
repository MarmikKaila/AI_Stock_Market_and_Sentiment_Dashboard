const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const { getOpinion } = require('../controllers/opinionController');

const symbolValidation = [
  param('symbol')
    .trim()
    .isAlpha()
    .withMessage('Symbol must contain only letters')
    .isLength({ min: 1, max: 5 })
    .withMessage('Symbol must be 1-5 characters')
    .toUpperCase(),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// GET /api/opinion/:symbol
router.get('/:symbol', symbolValidation, handleValidationErrors, getOpinion);

module.exports = router;