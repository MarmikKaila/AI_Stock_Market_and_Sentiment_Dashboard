import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getStockDetails } from '../services/stockService.js';
import Navbar from '../components/Navbar.jsx';
import StockCard from '../components/StockCard';
import SentimentBadge from '../components/SentimentBadge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Fallback data only used when API returns no data
const getDefaultPriceData = () => [
  { name: 'Mon', price: 0 },
  { name: 'Tue', price: 0 },
  { name: 'Wed', price: 0 },
  { name: 'Thu', price: 0 },
  { name: 'Fri', price: 0 },
];

const getDefaultSentimentData = () => [
  { day: 'D-4', score: 0 },
  { day: 'D-3', score: 0 },
  { day: 'D-2', score: 0 },
  { day: 'D-1', score: 0 },
  { day: 'Today', score: 0 },
];

// Static recommendation styling map (outside component for performance)
const RECOMMENDATION_CLASSES = {
  'BUY': 'text-green-400',
  'SELL': 'text-red-400',
  'HOLD': 'text-yellow-400',
};

const Dashboard = () => {
  const [stockDetails, setStockDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  
  // AbortController ref to cancel previous requests
  const abortControllerRef = useRef(null);

  // Memoized data loading with abort handling
  const loadStockData = useCallback(async (symbol) => {
    // Cancel any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getStockDetails(symbol, abortController.signal);
      
      // Only update state if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setStockDetails(data);
        setError(null);
      }
    } catch (err) {
      // Ignore abort errors - they're intentional when switching symbols
      if (err.name === 'AbortError') {
        return;
      }
      
      if (!abortController.signal.aborted) {
        setError(err.message || `Failed to fetch data for ${symbol}. Please check the symbol.`);
        console.error(err);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!currentSymbol) return;
    loadStockData(currentSymbol);
    
    // Cleanup: abort request on unmount or symbol change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentSymbol, loadStockData]);

  const handleSearch = (symbol) => {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (cleanSymbol && cleanSymbol !== currentSymbol) {
      setCurrentSymbol(cleanSymbol);
    }
  };

  const handleRetry = () => {
    loadStockData(currentSymbol);
  };

  const getRecommendationClass = (recommendation) => {
    return RECOMMENDATION_CLASSES[recommendation] || 'text-gray-300';
  };

  // Get real chart data from API response, with fallback
  const getPriceData = () => {
    if (stockDetails?.stock?.priceHistory?.length > 0) {
      return stockDetails.stock.priceHistory;
    }
    return getDefaultPriceData();
  };

  const getSentimentData = () => {
    if (stockDetails?.stock?.sentimentHistory?.length > 0) {
      return stockDetails.stock.sentimentHistory;
    }
    return getDefaultSentimentData();
  };

  // Check if data is mocked
  const isMockedData = stockDetails?.stock?.isMocked;
  const mockStatus = stockDetails?.stock?.mockStatus;

  return (
    <div className="bg-black min-h-screen animate-fadeIn">
      <Navbar onSearch={handleSearch} />

      {isLoading ? (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
          {/* Loading Skeleton */}
          <div className="col-span-1 space-y-4">
            <div className="h-12 bg-gray-800 rounded animate-pulse" />
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
      ) : error ? (
        <div className="text-center p-10">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white transition-all duration-500 ease-in-out">
          {/* Mock Data Warning Banner */}
          {isMockedData && (
            <div className="col-span-full bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 mb-2">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>
                  <strong>Demo Mode:</strong> Some data is simulated. 
                  {mockStatus?.fundamentals && ' Fundamentals'} 
                  {mockStatus?.price && ' Price'} 
                  {mockStatus?.news && ' News'} 
                  {mockStatus?.priceHistory && ' Chart'} 
                  {' '}may not reflect real market data.
                </span>
              </p>
            </div>
          )}

          {/* Cache indicator */}
          {stockDetails?.fromCache && (
            <div className="col-span-full text-gray-500 text-xs text-right -mt-4 mb-2">
              Data from cache • Updated: {new Date(stockDetails.stock.lastFetchedAt).toLocaleTimeString()}
            </div>
          )}

          {/* Left Section - Stock Info */}
          <div className="col-span-1 space-y-4">
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl font-bold">{stockDetails.stock.symbol}</h1>
              {stockDetails.stock.name && (
                <span className="text-gray-400 text-sm">{stockDetails.stock.name}</span>
              )}
            </div>

            {/* Each StockCard now interactive */}
            <div className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
              <StockCard
                title="P/E Ratio"
                value={
                  stockDetails.stock.peRatio
                    ? stockDetails.stock.peRatio.toFixed(2)
                    : 'N/A'
                }
              />
            </div>

            <div className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
              <StockCard
                title="P/B Ratio"
                value={
                  stockDetails.stock.pbRatio
                    ? stockDetails.stock.pbRatio.toFixed(2)
                    : 'N/A'
                }
              />
            </div>

            <div className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
              <StockCard
                title="Price"
                value={
                  stockDetails.stock.price
                    ? `$${stockDetails.stock.price.toFixed(2)}`
                    : 'N/A'
                }
              />
            </div>

            <div className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
              <StockCard
                title="EPS"
                value={
                  stockDetails.stock.eps
                    ? `$${stockDetails.stock.eps.toFixed(2)}`
                    : 'N/A'
                }
              />
            </div>
          </div>

          {/* Center Section - Chart + News */}
          <div className="col-span-1 space-y-4">
            {/* Price Chart with Real Data */}
            <div className="bg-gray-900 p-6 rounded-xl h-64 shadow-md transition-all duration-500 hover:shadow-emerald-400/20 hover:-translate-y-1">
              <h3 className="text-gray-300 text-sm mb-2 font-semibold">
                Price Trend (7 Days)
                {mockStatus?.priceHistory && <span className="text-yellow-500 text-xs ml-2">(simulated)</span>}
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getPriceData()}
                  margin={{ top: 15, right: 30, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="4 4" stroke="#1F2937" opacity={0.5} />

                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#374151' }}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#374151' }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tickFormatter={(val) => `$${val.toFixed(0)}`}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3', stroke: '#10B981' }}
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #10B981',
                      borderRadius: '8px',
                      color: '#E5E7EB',
                      fontSize: '13px',
                    }}
                    labelStyle={{ color: '#6EE7B7' }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
                    activeDot={{
                      r: 6,
                      fill: '#34D399',
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* News Section */}
            <div className="bg-gray-900 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
              <h3 className="text-lg font-bold mb-3">
                Latest News & Sentiment
                {mockStatus?.news && <span className="text-yellow-500 text-xs ml-2">(demo)</span>}
              </h3>
              {stockDetails.stock.news && stockDetails.stock.news.length > 0 ? (
                stockDetails.stock.news.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between mb-2 border-b border-gray-800 pb-2 transition-all duration-200 hover:scale-[1.01]"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate pr-4 hover:underline text-blue-400"
                    >
                      {item.title}
                    </a>
                    <SentimentBadge sentiment={item.sentiment} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No news available</p>
              )}
            </div>
          </div>

          {/* Right Section - Sentiment & AI Recommendation */}
          <div className="col-span-1 space-y-4">
            <div className="bg-gray-900 p-6 rounded-xl h-48 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-400/20">
              <h3 className="text-lg font-bold">Sentiment Score</h3>
              <p className="text-2xl font-bold text-amber-400">
                {stockDetails.stock.sentimentScore?.toFixed(2) ?? '0.00'}
              </p>
              <div className="flex-grow mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getSentimentData()}>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '0.5rem',
                      }}
                      formatter={(value) => [Number(value).toFixed(2), 'Score']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#FBBF24"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/20">
              <h3 className="text-lg font-bold">AI Recommendation</h3>
              <p
                className={`text-3xl font-bold mt-2 ${getRecommendationClass(
                  stockDetails.opinion.recommendation
                )} animate-pulse`}
              >
                {stockDetails.opinion.recommendation || 'N/A'}
              </p>
              <p className="text-gray-300 mt-2 text-sm">
                {stockDetails.opinion.explanation || 
                  'Analysis pending. Please wait for AI recommendation.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
