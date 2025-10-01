import React from "react";
import StockCard from "../components/StockCard";
import SentimentBadge from "../components/SentimentBadge";

const Dashboard = () => {
  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
      {/* Left section with stock info */}
      <div className="col-span-1 space-y-4">
        <h1 className="text-4xl font-bold">AAPL</h1>
        <StockCard title="P/E Ratio" value="28.4" />
        <StockCard title="P/B Ratio" value="47.1" />
        <StockCard title="Price" value="$150.23" />
      </div>

      {/* Center section with chart + news */}
      <div className="col-span-1 space-y-4">
        <div className="bg-gray-900 p-6 rounded-xl h-48 flex items-center justify-center">
          📈 Chart Placeholder
        </div>
        <div className="bg-gray-900 p-6 rounded-xl">
          <h3 className="text-lg font-bold mb-3">Latest News & Sentiment</h3>
          <div className="flex items-center justify-between mb-2">
            <p>Apple beats earnings with strong iPhone sales</p>
            <SentimentBadge sentiment="Positive" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <p>Apple faces regulatory challenges in Europe</p>
            <SentimentBadge sentiment="Neutral" />
          </div>
          <div className="flex items-center justify-between">
            <p>Decreased demand for tablets hits Apple's revenue</p>
            <SentimentBadge sentiment="Negative" />
          </div>
        </div>
      </div>

      {/* Right section with AI recommendation */}
      <div className="col-span-1 space-y-4">
        <div className="bg-gray-900 p-6 rounded-xl h-48">
          <h3 className="text-lg font-bold">Sentiment Score</h3>
          <div className="mt-4 text-gray-400">📊 Graph Placeholder</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl">
          <h3 className="text-lg font-bold">AI Recommendation</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">BUY</p>
          <p className="text-gray-300 mt-2 text-sm">
            Strong fundamentals and positive market sentiment indicate a buying
            opportunity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
