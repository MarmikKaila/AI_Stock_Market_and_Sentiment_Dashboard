const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getStockRecommendation, summarizeNews } = require('../services/aiService');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.post('/recommend', [
  body('summary')
    .exists().withMessage('summary is required')
    .isString().withMessage('summary must be a string')
    .isLength({ max: 5000 }).withMessage('summary too long'),
], handleValidationErrors, async (req, res) => {
  try {
    const { summary } = req.body;
    const result = await getStockRecommendation(summary);
    res.json({ recommendation: result });
  } catch (error) {
    console.error('AI Recommendation error:', error);
    res.status(500).json({ error: 'AI recommendation failed' });
  }
});

router.post('/summarize', [
  body('article')
    .exists().withMessage('article is required')
    .isString().withMessage('article must be a string')
    .isLength({ max: 10000 }).withMessage('article too long'),
], handleValidationErrors, async (req, res) => {
  try {
    const { article } = req.body;
    const result = await summarizeNews(article);
    res.json({ summary: result });
  } catch (error) {
    console.error('AI Summarize error:', error);
    res.status(500).json({ error: 'AI summarization failed' });
  }
});

module.exports = router;