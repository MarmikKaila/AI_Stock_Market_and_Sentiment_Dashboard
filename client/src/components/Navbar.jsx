import React, { useState } from 'react';

// 1. The Navbar now accepts the `onSearch` function as a prop
const Navbar = ({ onSearch }) => {
  // 2. State to hold the text the user is typing
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Update the state as the user types
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // 4. When the user clicks the search button or presses Enter
  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      // 5. Call the onSearch function, passing the symbol up
      onSearch(searchTerm);
    }
  };

  // 6. Handle the "Enter" key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-700">
      <h1 className="text-2xl font-bold text-white">StockSent AI</h1>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Search stock (e.g., TSLA)"
          className="bg-gray-800 text-white p-2 rounded-l-md focus:outline-none"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button
          className="bg-green-600 p-2 rounded-r-md hover:bg-green-700"
          onClick={handleSearch}
        >
          🔍
        </button>
      </div>
    </div>
  );
};

export default Navbar;