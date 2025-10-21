import React, { useState, useEffect } from 'react';
import { getStockDetails } from '../services/stockService.js';
import Navbar from '../components/Navbar.jsx'; 
import StockCard from '../components/StockCard';
import SentimentBadge from '../components/SentimentBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts
const samplePriceData = [
  { name: 'Mon', price: 148.50 }, { name: 'Tue', price: 150.23 }, { name: 'Wed', price: 149.80 },
  { name: 'Thu', price: 151.10 }, { name: 'Fri', price: 150.95 }, { name: 'Sat', price: 152.30 },
  { name: 'Sun', price: 151.75 },
];
const sampleSentimentData = [
  { day: 'D-4', score: 0.2 }, { day: 'D-3', score: -0.1 }, { day: 'D-2', score: 0.5 },
  { day: 'D-1', score: 0.3 }, { day: 'Today', score: 0.0 },
];

const Dashboard = () => {
  const [stockDetails, setStockDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Add state to hold the current stock symbol
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');

  // 2. This hook now re-runs whenever `currentSymbol` changes
  useEffect(() => {
    const loadStockData = async () => {
      if (!currentSymbol) return; 
      
      try {
        setIsLoading(true);
        // 3. Fetch data for the `currentSymbol`
        const data = await getStockDetails(currentSymbol);
        setStockDetails(data);
        setError(null);
      } catch (err) {
        // This is the error message you saw
        setError(`Failed to fetch data for ${currentSymbol}. Please check the symbol.`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStockData();
  }, [currentSymbol]); // 4. The hook now depends on `currentSymbol`

  // 5. This function gets passed to the Navbar
  const handleSearch = (symbol) => {
    setCurrentSymbol(symbol.toUpperCase());
  };
  
  const getRecommendationClass = (recommendation) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      case 'HOLD': return 'text-yellow-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="bg-black min-h-screen">
      {/* 6. We pass the `handleSearch` function to the Navbar */}
      <Navbar onSearch={handleSearch} />

      {isLoading ? (
        <div className="text-center text-white p-10">Loading data for {currentSymbol}...</div>
      ) : error ? (
        <div className="text-center text-red-500 p-10">{error}</div>
      ) : (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
          {/* Left section with stock info */}
          <div className="col-span-1 space-y-4">
            <h1 className="text-4xl font-bold">{stockDetails.stock.symbol}</h1>
            <StockCard title="P/E Ratio" value={stockDetails.stock.peRatio ? stockDetails.stock.peRatio.toFixed(2) : 'N/A'} />
            <StockCard title="P/B Ratio" value={stockDetails.stock.pbRatio ? stockDetails.stock.pbRatio.toFixed(2) : 'N/A'} />
            <StockCard title="Price" value={stockDetails.stock.price ? `$${stockDetails.stock.price.toFixed(2)}` : 'N/A'} />
          </div>

          {/* Center section with chart + news */}
          <div className="col-span-1 space-y-4">
            <div className="bg-gray-900 p-6 rounded-xl h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={samplePriceData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }} />
                  <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-3">Latest News & Sentiment</h3>
              {stockDetails.stock.news.map((item, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate pr-4 hover:underline text-blue-400">
                    {item.title}
                  </a>
                  <SentimentBadge sentiment={item.sentiment} />
                </div>
              ))}
            </div>
          </div>

          {/* Right section with AI recommendation */}
          <div className="col-span-1 space-y-4">
            <div className="bg-gray-900 p-6 rounded-xl h-48 flex flex-col">
              <h3 className="text-lg font-bold">Sentiment Score</h3>
              <p className="text-2xl font-bold">{stockDetails.stock.sentimentScore.toFixed(2)}</p>
              <div className="flex-grow mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleSentimentData}>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }} />
                    <Line type="monotone" dataKey="score" stroke="#FBBF24" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-lg font-bold">AI Recommendation</h3>
              <p className={`text-3xl font-bold mt-2 ${getRecommendationClass(stockDetails.opinion.recommendation)}`}>
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