// server/controllers/opinionController.js
const Stock = require("../models/Stock");
const { isDbConnected } = require("../config/db");
const { getRecommendation } = require("../services/aiService");

async function getOpinion(req, res) {
  try {
    const symbol = req.params.symbol.toUpperCase();

    if (!isDbConnected()) {
      return res.status(503).json({ error: "Database not available. Please try again later." });
    }

    // Ensure we have stock data in DB (fetch if missing)
    let stock;
    try {
      stock = await Stock.findOne({ symbol });
    } catch (dbErr) {
      console.error("DB query failed:", dbErr.message);
      return res.status(503).json({ error: "Database query failed." });
    }
    if (!stock) {
      // If not found, call the stock endpoint logic (reuse controller)
      // simple approach: return 404 and user should first call /api/stocks/:symbol
      return res.status(404).json({ error: "Stock not found in DB. Call /api/stocks/:symbol first." });
    }

    const fundamentals = {
      peRatio: stock.peRatio,
      pbRatio: stock.pbRatio,
      eps: stock.eps,
      price: stock.price,
      marketCap: stock.marketCap,
    };

    // Sanitize news summary to prevent prompt injection
    const newsSummary = (stock.news || [])
      .slice(0, 3)
      .map(n => n.title.substring(0, 100).replace(/[{}<>]/g, ''))
      .join(" | ");
    const sentimentScore = stock.sentimentScore;

    const aiResult = await getRecommendation({ fundamentals, sentimentScore, newsSummary });

    // Store recommendation and explanation in DB
    stock.recommendation = aiResult.recommendation;
    stock.recommendationExplanation = aiResult.explanation;
    await stock.save();

    res.json({ 
      symbol, 
      recommendation: aiResult.recommendation,
      explanation: aiResult.explanation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

module.exports = { getOpinion };
