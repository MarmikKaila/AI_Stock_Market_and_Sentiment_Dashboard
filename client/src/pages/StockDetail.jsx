import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStockDetails } from '../services/stockService.js';
import { useWatchlist } from '../context/WatchlistContext';
import StockCard from '../components/StockCard';
import EnhancedPriceChart from '../components/EnhancedPriceChart';
import SentimentGauge from '../components/SentimentGauge';
import SentimentChart from '../components/SentimentChart';
import AIRecommendation from '../components/AIRecommendation';
import NewsFeed from '../components/NewsFeed';
import MockDataBanner from '../components/MockDataBanner';

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stockDetails, setStockDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const loadStockData = useCallback(async (sym) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getStockDetails(sym, abortController.signal);
      if (!abortController.signal.aborted) {
        setStockDetails(data);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (!abortController.signal.aborted) {
        setError(err.message || `Failed to fetch data for ${sym}.`);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (symbol) {
      loadStockData(symbol.toUpperCase());
    }
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [symbol, loadStockData]);

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white animate-fadeIn">
        <div className="col-span-1 space-y-4">
          <div className="h-12 bg-gray-800 rounded animate-pulse" />
          <div className="h-24 bg-gray-800 rounded animate-pulse" />
          <div className="h-24 bg-gray-800 rounded animate-pulse" />
          <div className="h-24 bg-gray-800 rounded animate-pulse" />
          <div className="h-24 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="col-span-1 space-y-4">
          <div className="h-64 bg-gray-800 rounded animate-pulse" />
          <div className="h-48 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="col-span-1 space-y-4">
          <div className="h-48 bg-gray-800 rounded animate-pulse" />
          <div className="h-32 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 animate-fadeIn">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => loadStockData(symbol.toUpperCase())}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!stockDetails) return null;

  const { stock, opinion, fromCache } = stockDetails;
  const { addStock, removeStock, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(stock.symbol);

  return (
    <div className="p-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white transition-all duration-500 ease-in-out">
        <MockDataBanner isMocked={stock.isMocked} mockStatus={stock.mockStatus} />

        {fromCache && (
          <div className="col-span-full text-gray-500 text-xs text-right -mt-4 mb-2">
            Data from cache • Updated: {new Date(stock.lastFetchedAt).toLocaleTimeString()}
          </div>
        )}

        {/* Left Section - Stock Info */}
        <div className="col-span-1 space-y-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl font-bold">{stock.symbol}</h1>
            {stock.name && (
              <span className="text-gray-400 text-sm">{stock.name}</span>
            )}
            <button
              onClick={() => inWatchlist ? removeStock(stock.symbol) : addStock(stock.symbol)}
              className={`text-xl ml-auto transition-transform hover:scale-125 ${inWatchlist ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
              title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {inWatchlist ? '★' : '☆'}
            </button>
          </div>

          <div className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
            <StockCard title="P/E Ratio" value={stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A'} />
          </div>
          <div className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
            <StockCard title="P/B Ratio" value={stock.pbRatio ? stock.pbRatio.toFixed(2) : 'N/A'} />
          </div>
          <div className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
            <StockCard title="Price" value={stock.price ? `$${stock.price.toFixed(2)}` : 'N/A'} />
          </div>
          <div className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
            <StockCard title="EPS" value={stock.eps ? `$${stock.eps.toFixed(2)}` : 'N/A'} />
          </div>
          {stock.marketCap && (
            <div className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
              <StockCard title="Market Cap" value={`$${(stock.marketCap / 1e9).toFixed(1)}B`} />
            </div>
          )}
        </div>

        {/* Center Section - Chart + News */}
        <div className="col-span-1 space-y-4">
          <EnhancedPriceChart
            symbol={stock.symbol}
            initialData={stock.priceHistory}
            isMocked={stock.mockStatus?.priceHistory}
          />
          <NewsFeed news={stock.news} isMocked={stock.mockStatus?.news} />
        </div>

        {/* Right Section - Sentiment & AI Recommendation */}
        <div className="col-span-1 space-y-4">
          <SentimentGauge score={stock.sentimentScore} />
          <SentimentChart data={stock.sentimentHistory} sentimentScore={stock.sentimentScore} />
          <AIRecommendation recommendation={opinion.recommendation} explanation={opinion.explanation} />
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
