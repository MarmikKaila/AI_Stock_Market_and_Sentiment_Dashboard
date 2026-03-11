const { isDbConnected } = require("../config/db");
const Stock = require("../models/Stock");
const { fetchFundamentalsAlpha, fetchLatestPrice, fetchPriceHistory } = require("../services/stockService");
const { fetchNews } = require("../services/newsService");

async function getStock(req, res) {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const dbConnected = isDbConnected();

    // If cached in DB and recent (e.g., last 30 min) return it
    // Skip cache if data was mocked — always try to fetch real data
    let cache = null;
    if (dbConnected) {
      try {
        cache = await Stock.findOne({ symbol });
        const THIRTY_MIN = 1000 * 60 * 30;
        const lastFetched = cache?.lastFetchedAt ? new Date(cache.lastFetchedAt).getTime() : 0;
        const isFresh = (Date.now() - lastFetched) < THIRTY_MIN;
        
        if (cache && isFresh && !cache.isMocked) {
          return res.json({ fromCache: true, data: cache });
        }
      } catch (dbErr) {
        console.warn('DB query failed, proceeding without cache:', dbErr.message);
      }
    }

    // Fetch fundamentals & price history (2 calls instead of 3 to avoid rate limits)
    const fundamentals = await fetchFundamentalsAlpha(symbol);
    // Small delay to avoid Alpha Vantage rate limit (5 calls/min on free tier)
    await new Promise(r => setTimeout(r, 1500));
    const priceHistoryResult = await fetchPriceHistory(symbol, 7);

    // Extract latest price from price history (avoids separate GLOBAL_QUOTE call)
    let finalPrice = null;
    let priceIsMocked = true;
    if (priceHistoryResult.data?.length > 0 && !priceHistoryResult.isMocked) {
      const latestDay = priceHistoryResult.data[priceHistoryResult.data.length - 1];
      finalPrice = latestDay.price;
      priceIsMocked = false;
    } else {
      // Fallback: try GLOBAL_QUOTE only if price history failed
      const priceResult = await fetchLatestPrice(symbol);
      finalPrice = priceResult.price || (100 + Math.random() * 200);
      priceIsMocked = priceResult.isMocked;
    }
    
    // Fetch news and simple sentiment
    const newsResult = await fetchNews(symbol, fundamentals.name);
    const news = newsResult.articles;
    const sentimentScore = computeSentimentScore(news);
    
    // Generate sentiment history from news items
    const sentimentHistory = generateSentimentHistory(news);
    
    // Track what data is mocked
    const mockStatus = {
      fundamentals: fundamentals.isMocked || false,
      price: priceIsMocked || false,
      priceHistory: priceHistoryResult.isMocked || false,
      news: newsResult.isMocked || false,
    };
    const hasMockedData = Object.values(mockStatus).some(v => v);

    const stockData = {
      symbol,
      name: fundamentals.name,
      price: finalPrice,
      peRatio: fundamentals.peRatio,
      pbRatio: fundamentals.pbRatio,
      eps: fundamentals.eps,
      marketCap: fundamentals.marketCap,
      news,
      sentimentScore,
      sentimentHistory,
      priceHistory: priceHistoryResult.data,
      lastFetchedAt: new Date(),
      isMocked: hasMockedData,
      mockStatus,
    };

    // Save/update DB only if connected
    if (dbConnected) {
      try {
        const doc = await Stock.findOneAndUpdate(
          { symbol },
          stockData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return res.json({ fromCache: false, data: doc });
      } catch (dbErr) {
        console.warn('DB save failed, returning data without caching:', dbErr.message);
      }
    }

    // No DB - return data directly (without caching)
    return res.json({ fromCache: false, data: stockData, dbSkipped: true });
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

// Helper: generate sentiment history data for charts
function generateSentimentHistory(newsItems) {
  if (!newsItems || newsItems.length === 0) {
    return [
      { day: 'D-4', score: 0 },
      { day: 'D-3', score: 0 },
      { day: 'D-2', score: 0 },
      { day: 'D-1', score: 0 },
      { day: 'Today', score: 0 },
    ];
  }
  
  // Map news sentiments to numeric scores and create a timeline
  const scores = newsItems.map(n => {
    if (n.sentiment === 'Positive') return 1;
    if (n.sentiment === 'Negative') return -1;
    return 0;
  });
  
  // Pad or slice to get exactly 5 data points
  const paddedScores = [...scores];
  while (paddedScores.length < 5) {
    paddedScores.unshift(0);
  }
  
  const last5 = paddedScores.slice(-5);
  const labels = ['D-4', 'D-3', 'D-2', 'D-1', 'Today'];
  
  return labels.map((day, i) => ({
    day,
    score: last5[i],
  }));
}

module.exports = { getStock };