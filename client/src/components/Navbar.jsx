import React, { useState } from 'react';

const Navbar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      onSearch(searchTerm);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-gray-900/40 backdrop-blur-md shadow-md transition-all duration-500 sticky top-0 z-50">
      {/* Logo */}
      <h1 className="text-2xl font-extrabold text-emerald-400 tracking-wide hover:text-emerald-300 transition-colors duration-300">
        StockSent <span className="text-white">AI</span>
      </h1>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search stock (e.g., TSLA)"
            className="bg-gray-800/70 text-gray-200 placeholder-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 w-56 sm:w-64 group-hover:w-72"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />

          {/* Floating green glow when focused */}
          <span className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 group-focus-within:opacity-20 rounded-lg blur transition duration-300"></span>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-3 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-emerald-500/30 focus:ring-2 focus:ring-emerald-400"
        >
          🔍
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
