const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  symbols: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 20;
      },
      message: 'Watchlist cannot exceed 20 stocks',
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
