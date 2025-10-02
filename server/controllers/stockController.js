// server/controllers/stockController.js
const Stock = require("../models/Stock");
const { fetchFundamentalsAlpha, fetchLatestPrice } = require("../services/stockService");
const { fetchNews } = require("../services/newsService");

async function getStock(req, res) {
  try {
    const symbol = req.params.symbol.toUpperCase();

    // If cached in DB and recent (e.g., last 30 min) return it
    const cache = await Stock.findOne({ symbol });
    const THIRTY_MIN = 1000 * 60 * 30;
    if (cache && (Date.now() - new Date(cache.lastFetchedAt || 0).getTime()) < THIRTY_MIN) {
      return res.json({ fromCache: true, data: cache });
    }

    // Fetch fundamentals & latest price
    const fundamentals = await fetchFundamentalsAlpha(symbol);
    const price = await fetchLatestPrice(symbol);
    fundamentals.price = price;

    // Fetch news and simple sentiment
    const news = await fetchNews(symbol, fundamentals.name);
    const sentimentScore = computeSentimentScore(news);

    // Save/update DB
    const doc = await Stock.findOneAndUpdate(
      { symbol },
      {
        symbol,
        name: fundamentals.name,
        price: fundamentals.price,
        peRatio: fundamentals.peRatio,
        pbRatio: fundamentals.pbRatio,
        eps: fundamentals.eps,
        marketCap: fundamentals.marketCap,
        news,
        sentimentScore,
        lastFetchedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ fromCache: false, data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

// Helper: compute numeric sentiment score from news items
function computeSentimentScore(newsItems) {
  if (!newsItems || newsItems.length === 0) return 0;
  let score = 0;
  newsItems.forEach(n => {
    if (n.sentiment === "Positive") score += 1;
    else if (n.sentiment === "Negative") score -= 1;
  });
  return score / newsItems.length; // normalize between -1 and +1 (rough)
}

module.exports = { getStock };
