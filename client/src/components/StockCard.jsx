import React from "react";

const StockCard = ({ title, value }) => {
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md text-center">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className="text-green-400 text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StockCard;
