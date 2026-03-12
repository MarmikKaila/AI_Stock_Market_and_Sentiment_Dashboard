import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-20 animate-fadeIn">
      <h1 className="text-6xl font-extrabold text-gray-700 mb-4">404</h1>
      <p className="text-gray-400 text-xl mb-6">Page not found</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;
