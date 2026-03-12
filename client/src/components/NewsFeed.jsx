import React from 'react';
import SentimentBadge from './SentimentBadge';

const NewsFeed = ({ news, isMocked = false }) => {
  return (
    <div className="bg-gray-900 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
      <h3 className="text-lg font-bold mb-3">
        Latest News & Sentiment
        {isMocked && <span className="text-yellow-500 text-xs ml-2">(demo)</span>}
      </h3>
      {news && news.length > 0 ? (
        news.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between mb-2 border-b border-gray-800 pb-2 transition-all duration-200 hover:scale-[1.01]"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate pr-4 hover:underline text-blue-400"
            >
              {item.title}
            </a>
            <SentimentBadge sentiment={item.sentiment} />
          </div>
        ))
      ) : (
        <p className="text-gray-500">No news available</p>
      )}
    </div>
  );
};

export default NewsFeed;
