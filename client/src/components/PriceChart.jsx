import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const defaultData = [
  { name: 'Mon', price: 0 },
  { name: 'Tue', price: 0 },
  { name: 'Wed', price: 0 },
  { name: 'Thu', price: 0 },
  { name: 'Fri', price: 0 },
];

const PriceChart = ({ data, isMocked = false, height = 'h-64' }) => {
  const chartData = data?.length > 0 ? data : defaultData;

  return (
    <div className={`bg-gray-900 p-6 rounded-xl ${height} shadow-md transition-all duration-500 hover:shadow-emerald-400/20 hover:-translate-y-1`}>
      <h3 className="text-gray-300 text-sm mb-2 font-semibold">
        Price Trend (7 Days)
        {isMocked && <span className="text-yellow-500 text-xs ml-2">(simulated)</span>}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
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
            activeDot={{ r: 6, fill: '#34D399', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
