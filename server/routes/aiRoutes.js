const express = require('express');
const router = express.Router();
const { getStockRecommendation, summarizeNews } = require('../services/aiService');

router.post('/recommend', async (req, res) => {
  try {
    const { summary } = req.body;
    const result = await getStockRecommendation(summary);
    res.json({ recommendation: result });
  } catch (error) {
    console.error('AI Recommendation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/summarize', async (req, res) => {
  try {
    const { article } = req.body;
    const result = await summarizeNews(article);
    res.json({ summary: result });
  } catch (error) {
    console.error('AI Summarize error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;