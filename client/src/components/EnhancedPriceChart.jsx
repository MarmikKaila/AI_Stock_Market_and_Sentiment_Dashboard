import React, { useState, useCallback } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const RANGES = [
  { label: '1W', value: '7d' },
  { label: '1M', value: '30d' },
  { label: '3M', value: '90d' },
];

const EnhancedPriceChart = ({ symbol, initialData = [], isMocked = false }) => {
  const [data, setData] = useState(initialData);
  const [activeRange, setActiveRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [mocked, setMocked] = useState(isMocked);
  const [showVolume, setShowVolume] = useState(true);

  const loadRange = useCallback(async (range) => {
    if (range === activeRange && data.length > 0) return;
    setActiveRange(range);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/stocks/${symbol}/history?range=${range}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json.data || []);
      setMocked(json.isMocked || false);
    } catch {
      // Keep existing data on failure
    } finally {
      setLoading(false);
    }
  }, [symbol, activeRange, data.length]);

  const chartData = data.length > 0 ? data : initialData;
  const prices = chartData.map(d => d.price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const minIdx = chartData.findIndex(d => d.price === minPrice);
  const maxIdx = chartData.findIndex(d => d.price === maxPrice);

  const formatVolume = (v) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return v;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="bg-gray-900 border border-emerald-500/50 rounded-lg p-3 text-sm shadow-xl">
        <p className="text-emerald-400 font-semibold mb-1">{label}</p>
        <p className="text-white">Close: <span className="font-bold">${d.price?.toFixed(2)}</span></p>
        {d.open && <p className="text-gray-400">Open: ${d.open?.toFixed(2)}</p>}
        {d.high && <p className="text-green-400">High: ${d.high?.toFixed(2)}</p>}
        {d.low && <p className="text-red-400">Low: ${d.low?.toFixed(2)}</p>}
        {d.volume > 0 && <p className="text-blue-400">Vol: {formatVolume(d.volume)}</p>}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-md transition-all duration-500 hover:shadow-emerald-400/20">
      {/* Header with range selector */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-gray-300 text-sm font-semibold">
            Price Chart
            {mocked && <span className="text-yellow-500 text-xs ml-2">(simulated)</span>}
          </h3>
          {prices.length > 0 && (
            <div className="flex gap-3 mt-1 text-xs">
              <span className="text-green-400">H: ${maxPrice.toFixed(2)}</span>
              <span className="text-red-400">L: ${minPrice.toFixed(2)}</span>
              <span className="text-gray-400">Δ: {((maxPrice - minPrice) / minPrice * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-1 rounded text-xs mr-2 transition-colors ${showVolume ? 'bg-blue-600/30 text-blue-400' : 'bg-gray-800 text-gray-500'}`}
          >
            Vol
          </button>
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => loadRange(r.value)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeRange === r.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className={`relative ${loading ? 'opacity-50' : ''}`} style={{ height: 280 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" opacity={0.5} />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
              interval={chartData.length > 20 ? Math.floor(chartData.length / 6) : 0}
            />
            <YAxis
              yAxisId="price"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={55}
            />
            {showVolume && (
              <YAxis
                yAxisId="volume"
                orientation="right"
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatVolume}
                width={45}
              />
            )}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10B981', strokeDasharray: '3 3' }} />
            {showVolume && (
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="#3B82F6"
                opacity={0.2}
                isAnimationActive={false}
              />
            )}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#areaGradient)"
              dot={chartData.length <= 14 ? { r: 3, fill: '#10B981', strokeWidth: 0 } : false}
              activeDot={{ r: 5, fill: '#34D399', stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={800}
            />
            {minIdx >= 0 && chartData.length <= 30 && (
              <ReferenceLine
                yAxisId="price"
                y={minPrice}
                stroke="#EF4444"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
            )}
            {maxIdx >= 0 && chartData.length <= 30 && (
              <ReferenceLine
                yAxisId="price"
                y={maxPrice}
                stroke="#10B981"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnhancedPriceChart;
