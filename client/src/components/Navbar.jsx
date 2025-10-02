import React from 'react';

// This is a simple, non-functional Navbar
const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-700">
      <h1 className="text-2xl font-bold text-white">StockSent AI</h1>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Search stock (e.g., AAPL)"
          className="bg-gray-800 text-white p-2 rounded-l-md focus:outline-none"
        />
        <button
          className="bg-green-600 p-2 rounded-r-md hover:bg-green-700"
        >
          🔍
        </button>
      </div>
    </div>
  );
};

export default Navbar;