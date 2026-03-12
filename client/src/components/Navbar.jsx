import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { symbols } = useWatchlist();

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    const clean = searchTerm.trim().toUpperCase();
    if (clean && /^[A-Z]{1,5}$/.test(clean)) {
      navigate(`/stock/${clean}`);
      setSearchTerm('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') handleSearch();
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) =>
    `px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-emerald-600 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`;

  return (
    <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
      {/* Brand Title */}
      <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent tracking-wide hover:opacity-80 transition-opacity">
        StockSent AI
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-2">
        <Link to="/" className={linkClass('/')}>Home</Link>
        <Link to="/watchlist" className={linkClass('/watchlist')}>
          Watchlist{symbols.length > 0 && <span className="ml-1 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">{symbols.length}</span>}
        </Link>
        <Link to="/compare" className={linkClass('/compare')}>Compare</Link>
      </nav>

      {/* Search Input and Button */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search stock (e.g., TSLA)"
          className="
            bg-gray-800/70 text-white px-4 py-2 rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-emerald-400 
            transition-all duration-200 placeholder-gray-400 
            w-48 lg:w-64 hover:ring-1 hover:ring-emerald-400
          "
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
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
