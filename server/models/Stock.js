// server/models/Stock.js
const mongoose = require("mongoose");

const NewsItemSchema = new mongoose.Schema({
  title: String,
  url: String,
  publishedAt: Date,
  sentiment: String,
});

const StockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  name: String,
  price: Number,
  peRatio: Number,
  pbRatio: Number,
  eps: Number,
  marketCap: Number,
  lastFetchedAt: Date,
  news: [NewsItemSchema],
  sentimentScore: Number, // -1 to +1
  recommendation: String, // BUY / HOLD / SELL (cached)
}, { timestamps: true });

module.exports = mongoose.model("Stock", StockSchema);
