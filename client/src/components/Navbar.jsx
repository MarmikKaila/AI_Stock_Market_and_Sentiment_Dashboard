import React from "react";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between bg-gray-900 px-6 py-4 shadow-md">
      <h1 className="text-xl font-bold text-white">StockSent AI</h1>
      <input
        type="text"
        placeholder="🔍 Search stock (e.g. AAPL)"
        className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 w-72"
      />
    </nav>
  );
};

export default Navbar;
