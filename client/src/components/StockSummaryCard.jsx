import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const StockSummaryCard = ({ stock, onAddWatchlist, onRemoveWatchlist, isInWatchlist = false }) => {
  const navigate = useNavigate();

  const priceData = stock.priceHistory?.length > 0
    ? stock.priceHistory
    : [{ price: stock.price || 0 }, { price: stock.price || 0 }];

  const priceChange = priceData.length >= 2
    ? priceData[priceData.length - 1].price - priceData[0].price
    : 0;
  const priceChangePercent = priceData[0]?.price
    ? ((priceChange / priceData[0].price) * 100).toFixed(2)
    : '0.00';
  const isPositive = priceChange >= 0;

  return (
    <div
      onClick={() => navigate(`/stock/${stock.symbol}`)}
      className="bg-gray-900/70 backdrop-blur-md p-5 rounded-2xl border border-gray-800 cursor-pointer
        transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/30 group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
            {stock.symbol}
          </h3>
          <p className="text-gray-400 text-xs truncate max-w-[120px]">{stock.name || 'Unknown'}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            isInWatchlist ? onRemoveWatchlist?.(stock.symbol) : onAddWatchlist?.(stock.symbol);
          }}
          className={`text-lg transition-transform hover:scale-125 ${isInWatchlist ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
          title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {isInWatchlist ? '★' : '☆'}
        </button>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-2xl font-bold text-white">
            {stock.price ? `$${stock.price.toFixed(2)}` : 'N/A'}
          </p>
          <p className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent}%)
          </p>
        </div>
        <div className="w-20 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stock.sentimentScore !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-gray-400 text-xs">Sentiment:</span>
          <span className={`text-xs font-semibold ${stock.sentimentScore > 0.2 ? 'text-green-400' : stock.sentimentScore < -0.2 ? 'text-red-400' : 'text-yellow-400'}`}>
            {stock.sentimentScore.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default StockSummaryCard;
