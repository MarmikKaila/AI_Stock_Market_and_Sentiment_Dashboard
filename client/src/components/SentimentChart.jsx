import React from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

const defaultData = [
  { day: 'D-4', score: 0 },
  { day: 'D-3', score: 0 },
  { day: 'D-2', score: 0 },
  { day: 'D-1', score: 0 },
  { day: 'Today', score: 0 },
];

const SentimentChart = ({ data, sentimentScore }) => {
  const chartData = data?.length > 0 ? data : defaultData;

  return (
    <div className="bg-gray-900 p-6 rounded-xl h-48 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-400/20">
      <h3 className="text-lg font-bold">Sentiment Score</h3>
      <p className="text-2xl font-bold text-amber-400">
        {sentimentScore?.toFixed(2) ?? '0.00'}
      </p>
      <div className="flex-grow mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
  );
};

export default SentimentChart;
