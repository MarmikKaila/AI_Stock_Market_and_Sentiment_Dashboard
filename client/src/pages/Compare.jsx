import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStockDetails } from '../services/stockService';
import StockCard from '../components/StockCard';
import PriceChart from '../components/PriceChart';
import SentimentChart from '../components/SentimentChart';
import AIRecommendation from '../components/AIRecommendation';

const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [symbolA, setSymbolA] = useState(searchParams.get('symbols')?.split(',')[0] || '');
  const [symbolB, setSymbolB] = useState(searchParams.get('symbols')?.split(',')[1] || '');
  const [stockA, setStockA] = useState(null);
  const [stockB, setStockB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadComparison = useCallback(async () => {
    if (!symbolA || !symbolB) return;
    setLoading(true);
    setError(null);

    try {
      const [dataA, dataB] = await Promise.all([
        getStockDetails(symbolA),
        getStockDetails(symbolB),
      ]);
      setStockA(dataA);
      setStockB(dataB);
      setSearchParams({ symbols: `${symbolA},${symbolB}` });
    } catch (err) {
      setError(err.message || 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  }, [symbolA, symbolB, setSearchParams]);

  useEffect(() => {
    const syms = searchParams.get('symbols')?.split(',');
    if (syms?.length === 2 && syms[0] && syms[1]) {
      setSymbolA(syms[0].toUpperCase());
      setSymbolB(syms[1].toUpperCase());
    }
  }, []);

  const handleCompare = (e) => {
    e.preventDefault();
    const a = symbolA.trim().toUpperCase();
    const b = symbolB.trim().toUpperCase();
    if (a && b && a !== b) {
      setSymbolA(a);
      setSymbolB(b);
      loadComparison();
    }
  };

  const metrics = stockA && stockB ? [
    { label: 'Price', a: stockA.stock.price, b: stockB.stock.price, format: (v) => v ? `$${v.toFixed(2)}` : 'N/A', higher: 'neutral' },
    { label: 'P/E Ratio', a: stockA.stock.peRatio, b: stockB.stock.peRatio, format: (v) => v ? v.toFixed(2) : 'N/A', higher: 'lower' },
    { label: 'P/B Ratio', a: stockA.stock.pbRatio, b: stockB.stock.pbRatio, format: (v) => v ? v.toFixed(2) : 'N/A', higher: 'lower' },
    { label: 'EPS', a: stockA.stock.eps, b: stockB.stock.eps, format: (v) => v ? `$${v.toFixed(2)}` : 'N/A', higher: 'higher' },
    { label: 'Sentiment', a: stockA.stock.sentimentScore, b: stockB.stock.sentimentScore, format: (v) => v?.toFixed(2) ?? 'N/A', higher: 'higher' },
    { label: 'AI Rating', a: stockA.opinion.recommendation, b: stockB.opinion.recommendation, format: (v) => v || 'N/A', higher: 'buy' },
  ] : [];

  const getMetricColor = (metric, value, otherValue) => {
    if (!value || !otherValue || value === 'N/A' || otherValue === 'N/A') return 'text-gray-300';
    if (metric.higher === 'neutral') return 'text-white';
    if (metric.higher === 'buy') {
      const rank = { BUY: 3, HOLD: 2, SELL: 1 };
      return (rank[value] || 0) >= (rank[otherValue] || 0) ? 'text-green-400' : 'text-red-400';
    }
    if (metric.higher === 'higher') return value > otherValue ? 'text-green-400' : value < otherValue ? 'text-red-400' : 'text-gray-300';
    if (metric.higher === 'lower') return value < otherValue ? 'text-green-400' : value > otherValue ? 'text-red-400' : 'text-gray-300';
    return 'text-gray-300';
  };

  return (
    <div className="p-6 animate-fadeIn text-white">
      <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
        Stock Comparison
      </h1>

      {/* Symbol Input */}
      <form onSubmit={handleCompare} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
        <input
          type="text"
          value={symbolA}
          onChange={(e) => setSymbolA(e.target.value.toUpperCase())}
          placeholder="Stock A (e.g., AAPL)"
          maxLength={5}
          className="bg-gray-800/70 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 w-48 text-center text-lg"
        />
        <span className="text-gray-400 text-2xl font-bold">VS</span>
        <input
          type="text"
          value={symbolB}
          onChange={(e) => setSymbolB(e.target.value.toUpperCase())}
          placeholder="Stock B (e.g., GOOGL)"
          maxLength={5}
          className="bg-gray-800/70 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 w-48 text-center text-lg"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors font-semibold"
        >
          Compare
        </button>
      </form>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-12 bg-gray-800 rounded animate-pulse" />
              <div className="h-48 bg-gray-800 rounded animate-pulse" />
              <div className="h-32 bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center p-6">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      )}

      {!loading && stockA && stockB && (
        <>
          {/* Comparison Table */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Metric</th>
                  <th className="text-center py-3 px-4 text-emerald-400 text-lg">{stockA.stock.symbol}</th>
                  <th className="text-center py-3 px-4 text-blue-400 text-lg">{stockB.stock.symbol}</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.label} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300 font-medium">{m.label}</td>
                    <td className={`py-3 px-4 text-center font-bold ${getMetricColor(m, m.a, m.b)}`}>
                      {m.format(m.a)}
                    </td>
                    <td className={`py-3 px-4 text-center font-bold ${getMetricColor(m, m.b, m.a)}`}>
                      {m.format(m.b)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Side-by-side Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-emerald-400 font-bold text-lg mb-3">{stockA.stock.symbol} - Price</h3>
              <PriceChart data={stockA.stock.priceHistory} isMocked={stockA.stock.mockStatus?.priceHistory} />
            </div>
            <div>
              <h3 className="text-blue-400 font-bold text-lg mb-3">{stockB.stock.symbol} - Price</h3>
              <PriceChart data={stockB.stock.priceHistory} isMocked={stockB.stock.mockStatus?.priceHistory} />
            </div>
          </div>

          {/* Side-by-side AI Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-emerald-400 font-bold text-lg mb-3">{stockA.stock.symbol} - AI Analysis</h3>
              <AIRecommendation recommendation={stockA.opinion.recommendation} explanation={stockA.opinion.explanation} />
            </div>
            <div>
              <h3 className="text-blue-400 font-bold text-lg mb-3">{stockB.stock.symbol} - AI Analysis</h3>
              <AIRecommendation recommendation={stockB.opinion.recommendation} explanation={stockB.opinion.explanation} />
            </div>
          </div>
        </>
      )}

      {!loading && !stockA && !stockB && !error && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">Enter two stock symbols to compare</p>
          <p className="text-gray-500">See side-by-side fundamentals, charts, and AI recommendations</p>
        </div>
      )}
    </div>
  );
};

export default Compare;
