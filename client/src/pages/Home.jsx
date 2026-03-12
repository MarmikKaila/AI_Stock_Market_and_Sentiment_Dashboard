import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import StockSummaryCard from '../components/StockSummaryCard';

const POPULAR_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = () => {
  const navigate = useNavigate();
  const { addStock, removeStock, isInWatchlist } = useWatchlist();
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchMarketOverview = async () => {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);

      try {
        const response = await fetch(`${BACKEND_URL}/api/stocks/market/overview`);
        if (!response.ok) throw new Error('Failed to load market data');
        const data = await response.json();
        if (!cancelled) {
          setStocks(data.stocks || []);
          setLoadingProgress(data.stocks?.length || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMarketOverview();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent mb-3">
          Market Overview
        </h1>
        <p className="text-gray-400 text-lg">
          AI-powered sentiment analysis for top stocks
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {POPULAR_SYMBOLS.map((sym) => (
            <div key={sym} className="bg-gray-900/70 p-5 rounded-2xl border border-gray-800 animate-pulse">
              <div className="h-6 bg-gray-800 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-800 rounded w-20 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="text-center p-10">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stocks Grid */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {stocks.map((stock) => (
              <StockSummaryCard
                key={stock.symbol}
                stock={stock}
                isInWatchlist={isInWatchlist(stock.symbol)}
                onAddWatchlist={addStock}
                onRemoveWatchlist={removeStock}
              />
            ))}
          </div>

          {stocks.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              <p>No market data available. Try again later.</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Search for any stock symbol to get detailed analysis</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {['NVDA', 'META', 'NFLX', 'JPM', 'V'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => navigate(`/stock/${sym}`)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-200"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
