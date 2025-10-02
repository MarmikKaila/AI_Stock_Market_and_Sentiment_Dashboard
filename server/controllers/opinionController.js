// server/controllers/opinionController.js
const Stock = require("../models/Stock");
const { getRecommendation } = require("../services/aiService");

async function getOpinion(req, res) {
  try {
    const symbol = req.params.symbol.toUpperCase();

    // Ensure we have stock data in DB (fetch if missing)
    let stock = await Stock.findOne({ symbol });
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

    const newsSummary = (stock.news || []).slice(0, 3).map(n => n.title).join(" | ");
    const sentimentScore = stock.sentimentScore;

    const aiResult = await getRecommendation({ fundamentals, sentimentScore, newsSummary });

    // Store recommendation in DB
    stock.recommendation = aiResult;
    await stock.save();

    res.json({ symbol, recommendation: aiResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

module.exports = { getOpinion };
