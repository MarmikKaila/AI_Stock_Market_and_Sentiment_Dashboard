import React from 'react';

const RECOMMENDATION_CLASSES = {
  'BUY': 'text-green-400',
  'SELL': 'text-red-400',
  'HOLD': 'text-yellow-400',
};

const AIRecommendation = ({ recommendation, explanation }) => {
  const colorClass = RECOMMENDATION_CLASSES[recommendation] || 'text-gray-300';

  return (
    <div className="bg-gray-900 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/20">
      <h3 className="text-lg font-bold">AI Recommendation</h3>
      <p className={`text-3xl font-bold mt-2 ${colorClass} animate-pulse`}>
        {recommendation || 'N/A'}
      </p>
      <p className="text-gray-300 mt-2 text-sm">
        {explanation || 'Analysis pending. Please wait for AI recommendation.'}
      </p>
    </div>
  );
};

export default AIRecommendation;
