import React from "react";

const StockCard = ({ title, value }) => {
  return (
    <div
      className="
        relative bg-gray-900/70 backdrop-blur-md
        p-5 rounded-2xl shadow-lg text-center
        border border-gray-800
        transition-all duration-300 ease-in-out
        hover:-translate-y-1 hover:scale-[1.03]
        hover:shadow-emerald-500/20 hover:border-emerald-500/30
        group
      "
    >
      {/* Glow effect background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-2xl blur-sm"></div>

      <h3 className="text-gray-400 text-sm uppercase tracking-wide z-10 relative">
        {title}
      </h3>

      <p
        className="
          text-3xl font-extrabold text-transparent 
          bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300
          mt-1 z-10 relative
          transition-all duration-300 ease-in-out
          group-hover:scale-110
        "
      >
        {value}
      </p>
    </div>
  );
};

export default StockCard;
