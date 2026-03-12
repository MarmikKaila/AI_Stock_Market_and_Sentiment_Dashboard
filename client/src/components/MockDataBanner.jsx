import React from 'react';

const MockDataBanner = ({ isMocked, mockStatus }) => {
  if (!isMocked) return null;

  return (
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
  );
};

export default MockDataBanner;
