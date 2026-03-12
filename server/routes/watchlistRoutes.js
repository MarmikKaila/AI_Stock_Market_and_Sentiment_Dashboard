const express = require('express');
const router = express.Router();
const { param, body, validationResult } = require('express-validator');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const sessionIdValidation = [
  param('sessionId')
    .trim()
    .isLength({ min: 8, max: 64 })
    .withMessage('Invalid session ID')
    .isAlphanumeric()
    .withMessage('Session ID must be alphanumeric'),
];

const symbolParamValidation = [
  param('symbol')
    .trim()
    .isAlpha()
    .withMessage('Symbol must contain only letters')
    .isLength({ min: 1, max: 5 })
    .withMessage('Symbol must be 1-5 characters'),
];

const symbolBodyValidation = [
  body('symbol')
    .trim()
    .isAlpha()
    .withMessage('Symbol must contain only letters')
    .isLength({ min: 1, max: 5 })
    .withMessage('Symbol must be 1-5 characters'),
];

// GET /api/watchlist/:sessionId
router.get('/:sessionId', sessionIdValidation, handleValidationErrors, getWatchlist);

// POST /api/watchlist/:sessionId/add
router.post('/:sessionId/add', [...sessionIdValidation, ...symbolBodyValidation], handleValidationErrors, addToWatchlist);

// DELETE /api/watchlist/:sessionId/:symbol
router.delete('/:sessionId/:symbol', [...sessionIdValidation, ...symbolParamValidation], handleValidationErrors, removeFromWatchlist);

module.exports = router;
