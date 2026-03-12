const express = require('express');
const router = express.Router();
const { param, query, validationResult } = require('express-validator');
const { getStock, getMarketOverview, getPriceHistory } = require('../controllers/stockController');

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

// GET /api/stocks/market/overview - must be BEFORE /:symbol
router.get('/market/overview', getMarketOverview);

// GET /api/stocks/:symbol/history?range=7d|30d|90d
router.get('/:symbol/history', [
  ...symbolValidation,
  query('range')
    .optional()
    .isIn(['7d', '30d', '90d'])
    .withMessage('Range must be 7d, 30d, or 90d'),
], handleValidationErrors, getPriceHistory);

// GET /api/stocks/:symbol
router.get('/:symbol', symbolValidation, handleValidationErrors, getStock);

module.exports = router;