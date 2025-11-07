import React from "react";

const SentimentBadge = ({ sentiment }) => {
  const styles = {
    Positive:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-400/40",
    Neutral:
      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-yellow-400/40",
    Negative:
      "bg-red-500/20 text-red-400 border border-red-500/40 shadow-red-400/40",
  };

  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-semibold tracking-wide
        transition-all duration-300 ease-in-out
        hover:scale-110 hover:shadow-lg hover:brightness-125
        ${styles[sentiment] || "bg-gray-700 text-gray-300"}
        ${sentiment === "Positive" ? "animate-pulse-slow" : ""}
      `}
    >
      {sentiment}
    </span>
  );
};

export default SentimentBadge;
