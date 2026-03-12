import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import StockSummaryCard from '../components/StockSummaryCard';

const Watchlist = () => {
  const navigate = useNavigate();
  const { symbols, stocks, loading, removeStock, refreshWatchlist } = useWatchlist();

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-4xl font-bold mb-6">Your Watchlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900/70 rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (symbols.length === 0) {
    return (
      <div className="p-6 animate-fadeIn text-white">
        <h1 className="text-4xl font-bold mb-6">Your Watchlist</h1>
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-2">Your watchlist is empty</p>
          <p className="text-gray-500 mb-6">Add stocks from the market overview to track them here</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Explore Stocks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fadeIn text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Your Watchlist</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{symbols.length}/20 stocks</span>
          <button
            onClick={refreshWatchlist}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stocks.length > 0
          ? stocks.map(stock => (
              <StockSummaryCard
                key={stock.symbol}
                stock={stock}
                isInWatchlist={true}
                onRemoveWatchlist={removeStock}
              />
            ))
          : symbols.map(sym => (
              <div
                key={sym}
                onClick={() => navigate(`/stock/${sym}`)}
                className="bg-gray-900/70 p-5 rounded-2xl border border-gray-800 cursor-pointer hover:border-emerald-500/30 transition-all"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">{sym}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeStock(sym); }}
                    className="text-yellow-400 text-lg hover:scale-125 transition-transform"
                  >
                    ★
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2">Click to view details</p>
              </div>
            ))
        }
      </div>
    </div>
  );
};

export default Watchlist;
