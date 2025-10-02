const axios = require('axios');

/**
 * Analyzes the sentiment of a news headline using the Google Gemini API.
 * @param {string} text - The headline to analyze.
 * @returns {Promise<string>} 'Positive', 'Negative', or 'Neutral'.
 */
async function analyzeSentiment(text) {
  const geminiKey = process.env.GEMINI_API_KEY;
  // If no Gemini key is provided, fall back to 'Neutral'
  if (!geminiKey) {
    console.warn('GEMINI_API_KEY not found. Falling back to neutral sentiment.');
    return 'Neutral';
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`;
    const prompt = `Analyze the sentiment of this news headline. Respond with only one word: Positive, Negative, or Neutral. Headline: "${text}"`;

    const response = await axios.post(
      url,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const sentiment = response.data.candidates[0].content.parts[0].text.trim();

    // Validate the response to ensure it's one of the expected values
    if (['Positive', 'Negative', 'Neutral'].includes(sentiment)) {
      return sentiment;
    }
    // If the AI gives an unexpected response, default to Neutral
    return 'Neutral';

  } catch (error) {
    console.error('Gemini API sentiment analysis failed:', error.message);
    // If the API call fails for any reason, default to Neutral
    return 'Neutral';
  }
}


async function fetchNews(symbol, companyName) {
  try {
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) {
      console.log('NewsAPI key not configured, returning mock data');
      return getMockNews();
    }

    const query = companyName || symbol;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (response.data.articles && response.data.articles.length > 0) {
      // Since analyzeSentiment is now async, we must use Promise.all
      // to wait for all the sentiment analyses to complete.
      const processedArticles = await Promise.all(
        response.data.articles.map(async (article) => {
          // Call our new AI-powered sentiment function for each article title
          const sentiment = await analyzeSentiment(article.title);
          return {
            title: article.title,
            url: article.url,
            publishedAt: new Date(article.publishedAt),
            sentiment: sentiment,
          };
        })
      );
      return processedArticles;
    }
    
    return getMockNews();
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return getMockNews();
  }
}

// Mock news remains as a fallback
function getMockNews() {
  return [
    { title: 'Stock Shows Strong Performance in Q4', url: '#', publishedAt: new Date(), sentiment: 'Positive' },
    { title: 'Market Analysis: Mixed Signals for Tech Sector', url: '#', publishedAt: new Date(), sentiment: 'Neutral' },
    { title: 'Company Faces Regulatory Challenges', url: '#', publishedAt: new Date(), sentiment: 'Negative' },
  ];
}

module.exports = {
  fetchNews,
};