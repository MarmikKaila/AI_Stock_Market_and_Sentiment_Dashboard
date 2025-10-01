import React from "react";

const SentimentBadge = ({ sentiment }) => {
  const colors = {
    Positive: "bg-green-600",
    Neutral: "bg-yellow-600",
    Negative: "bg-red-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-white text-xs font-medium ${colors[sentiment]}`}
    >
      {sentiment}
    </span>
  );
};

export default SentimentBadge;
