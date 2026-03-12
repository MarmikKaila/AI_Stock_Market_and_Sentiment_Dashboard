const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');
const { isDbConnected } = require('../config/db');

async function getWatchlist(req, res) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { sessionId } = req.params;
    const watchlist = await Watchlist.findOne({ sessionId });

    if (!watchlist || watchlist.symbols.length === 0) {
      return res.json({ symbols: [], stocks: [] });
    }

    // Fetch cached stock data for each symbol
    const stocks = await Stock.find({ symbol: { $in: watchlist.symbols } }).lean();

    return res.json({
      symbols: watchlist.symbols,
      stocks,
    });
  } catch (err) {
    console.error('Get watchlist error:', err.message);
    res.status(500).json({ error: 'Failed to load watchlist' });
  }
}

async function addToWatchlist(req, res) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { sessionId } = req.params;
    const { symbol } = req.body;
    const cleanSymbol = symbol.trim().toUpperCase();

    let watchlist = await Watchlist.findOne({ sessionId });

    if (!watchlist) {
      watchlist = new Watchlist({ sessionId, symbols: [cleanSymbol] });
    } else {
      if (watchlist.symbols.includes(cleanSymbol)) {
        return res.json({ symbols: watchlist.symbols, message: 'Already in watchlist' });
      }
      if (watchlist.symbols.length >= 20) {
        return res.status(400).json({ error: 'Watchlist limit reached (max 20)' });
      }
      watchlist.symbols.push(cleanSymbol);
    }

    await watchlist.save();
    return res.json({ symbols: watchlist.symbols });
  } catch (err) {
    console.error('Add to watchlist error:', err.message);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
}

async function removeFromWatchlist(req, res) {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { sessionId, symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase();

    const watchlist = await Watchlist.findOne({ sessionId });
    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    watchlist.symbols = watchlist.symbols.filter(s => s !== cleanSymbol);
    await watchlist.save();

    return res.json({ symbols: watchlist.symbols });
  } catch (err) {
    console.error('Remove from watchlist error:', err.message);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
}

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
