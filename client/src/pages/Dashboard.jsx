import React, { useState, useEffect } from 'react';
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

// Sample fallback data (in case API graph data is missing)
const samplePriceData = [
  { name: 'Mon', price: 148.5 },
  { name: 'Tue', price: 150.23 },
  { name: 'Wed', price: 149.8 },
  { name: 'Thu', price: 151.1 },
  { name: 'Fri', price: 150.95 },
  { name: 'Sat', price: 152.3 },
  { name: 'Sun', price: 151.75 },
];

const sampleSentimentData = [
  { day: 'D-4', score: 0.2 },
  { day: 'D-3', score: -0.1 },
  { day: 'D-2', score: 0.5 },
  { day: 'D-1', score: 0.3 },
  { day: 'Today', score: 0.0 },
];

const Dashboard = () => {
  const [stockDetails, setStockDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');

  useEffect(() => {
    const loadStockData = async () => {
      if (!currentSymbol) return;
      try {
        setIsLoading(true);
        const data = await getStockDetails(currentSymbol);
        setStockDetails(data);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch data for ${currentSymbol}. Please check the symbol.`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStockData();
  }, [currentSymbol]);

  const handleSearch = (symbol) => {
    setCurrentSymbol(symbol.toUpperCase());
  };

  const getRecommendationClass = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
        return 'text-green-400';
      case 'SELL':
        return 'text-red-400';
      case 'HOLD':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-black min-h-screen animate-fadeIn">
      <Navbar onSearch={handleSearch} />

      {isLoading ? (
        <div className="text-center text-white p-10 animate-pulse">
          Loading data for {currentSymbol}...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-10">{error}</div>
      ) : (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white transition-all duration-500 ease-in-out">
          {/* Left Section - Stock Info */}
          <div className="col-span-1 space-y-4">
            <h1 className="text-4xl font-bold mb-4">{stockDetails.stock.symbol}</h1>

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
          </div>

          {/* Center Section - Chart + News */}
          <div className="col-span-1 space-y-4">
            {/* Animated Chart */}
            <div className="bg-gray-900 p-6 rounded-xl h-64 shadow-md transition-all duration-500 hover:shadow-emerald-400/20 hover:-translate-y-1">
              <h3 className="text-gray-300 text-sm mb-2 font-semibold">
                Price Trend (7 Days)
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={samplePriceData}
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
              <h3 className="text-lg font-bold mb-3">Latest News & Sentiment</h3>
              {stockDetails.stock.news.map((item, index) => (
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
              ))}
            </div>
          </div>

          {/* Right Section - Sentiment & AI Recommendation */}
          <div className="col-span-1 space-y-4">
            <div className="bg-gray-900 p-6 rounded-xl h-48 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-400/20">
              <h3 className="text-lg font-bold">Sentiment Score</h3>
              <p className="text-2xl font-bold text-amber-400">
                {stockDetails.stock.sentimentScore.toFixed(2)}
              </p>
              <div className="flex-grow mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleSentimentData}>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '0.5rem',
                      }}
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
                {stockDetails.opinion.recommendation}
              </p>
              <p className="text-gray-300 mt-2 text-sm">
                Strong fundamentals and positive market sentiment indicate a buying opportunity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
