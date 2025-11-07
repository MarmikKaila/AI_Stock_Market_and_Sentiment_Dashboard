import React, { useState } from 'react';

const Navbar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      onSearch(searchTerm.trim());
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
      {/* Brand Title */}
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent tracking-wide">
        StockSent AI
      </h1>

      {/* Search Input and Button */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search stock (e.g., TSLA)"
          className="
            bg-gray-800/70 text-white px-4 py-2 rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-emerald-400 
            transition-all duration-200 placeholder-gray-400 
            w-64 hover:ring-1 hover:ring-emerald-400
          "
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          style={{ position: 'relative', zIndex: 50 }}
        />
        <button
          className="
            bg-emerald-500 hover:bg-emerald-600 
            text-white px-3 py-2 rounded-xl 
            transition-transform duration-200 hover:scale-105
          "
          onClick={handleSearch}
        >
          🔍
        </button>
      </div>
    </div>
  );
};

export default Navbar;
