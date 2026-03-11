// server/models/Stock.js
const mongoose = require("mongoose");

const NewsItemSchema = new mongoose.Schema({
  title: String,
  url: String,
  publishedAt: Date,
  sentiment: String,
});

const PriceHistoryItemSchema = new mongoose.Schema({
  name: String,
  date: String,
  price: Number,
});

const SentimentHistoryItemSchema = new mongoose.Schema({
  day: String,
  score: Number,
});

const MockStatusSchema = new mongoose.Schema({
  fundamentals: Boolean,
  price: Boolean,
  priceHistory: Boolean,
  news: Boolean,
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
  sentimentHistory: [SentimentHistoryItemSchema],
  priceHistory: [PriceHistoryItemSchema],
  recommendation: String, // BUY / HOLD / SELL (cached)
  recommendationExplanation: String, // AI-generated explanation
  isMocked: Boolean,
  mockStatus: MockStatusSchema,
}, { timestamps: true });

// Index for efficient cache queries
StockSchema.index({ symbol: 1, lastFetchedAt: -1 });

module.exports = mongoose.model("Stock", StockSchema);
