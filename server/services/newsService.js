const axios = require('axios');

// Try multiple Gemini models in order of preference (2025 working list)
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-pro'
];

let workingModel = null;
let modelCheckCompleted = false;
let modelCheckFailed = false;

// --- Detect a working Gemini model (ONLY ONCE) ---
async function findWorkingModel() {
  // Return cached result if already checked
  if (modelCheckCompleted) {
    return workingModel;
  }

  // Prevent duplicate checks
  if (modelCheckFailed) {
    return null;
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.warn('⚠️ GEMINI_API_KEY not configured in environment variables.');
    modelCheckFailed = true;
    modelCheckCompleted = true;
    return null;
  }

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: 'test' }] }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        workingModel = model;
        modelCheckCompleted = true;
        console.log(`✅ Using Gemini model: ${model}`);
        return model;
      }
    } catch (error) {
      // Try next model
      continue;
    }
  }

  // All models failed
  console.warn('⚠️ No working Gemini model found. Please check:');
  console.warn('   1. GEMINI_API_KEY is set correctly');
  console.warn('   2. API key has proper permissions');
  console.warn('   3. Gemini API is accessible from your region');
  console.warn('   → Using fallback sentiment analysis (simple keyword-based)');
  
  modelCheckFailed = true;
  modelCheckCompleted = true;
  return null;
}

/**
 * Fallback sentiment analysis using keyword matching
 */
function analyzeSentimentFallback(text) {
  const positiveWords = ['strong', 'growth', 'profit', 'success', 'innovation', 'boost', 'gain', 'rise', 'record', 'exceed'];
  const negativeWords = ['loss', 'decline', 'fall', 'challenge', 'concern', 'drop', 'fail', 'weak', 'regulatory', 'lawsuit'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'Positive';
  if (negativeCount > positiveCount) return 'Negative';
  return 'Neutral';
}

/**
 * Analyzes the sentiment of a news headline using the Google Gemini API.
 */
async function analyzeSentiment(text) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return analyzeSentimentFallback(text);
  }

  try {
    const model = await findWorkingModel();
    if (!model) {
      return analyzeSentimentFallback(text);
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`;
    const prompt = `Analyze the sentiment of this news headline. Respond with only one word: Positive, Negative, or Neutral.\n\nHeadline: "${text}"`;

    const response = await axios.post(
      url,
      { contents: [{ parts: [{ text: prompt }] }] },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000
      }
    );

    const sentiment =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Neutral';

    const upper = sentiment.toUpperCase();
    if (upper.includes('POSITIVE')) return 'Positive';
    if (upper.includes('NEGATIVE')) return 'Negative';
    if (upper.includes('NEUTRAL')) return 'Neutral';

    return 'Neutral';
  } catch (error) {
    console.error('❌ Gemini sentiment analysis failed:', error.message);
    return analyzeSentimentFallback(text);
  }
}

/**
 * Fetches news articles for a given stock symbol or company name,
 * and runs sentiment analysis for each headline.
 */
async function fetchNews(symbol, companyName) {
  try {
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) {
      console.log('⚠️ NEWSAPI_KEY not configured, using mock data.');
      return getMockNews();
    }

    const query = companyName || symbol;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.articles?.length > 0) {
      console.log(`✅ Fetched ${response.data.articles.length} news articles for ${query}`);

      // Process sentiment for all articles
      const processedArticles = await Promise.all(
        response.data.articles.map(async (article) => {
          const sentiment = await analyzeSentiment(article.title);
          return {
            title: article.title,
            description: article.description || '',
            url: article.url,
            publishedAt: new Date(article.publishedAt),
            sentiment
          };
        })
      );
      return processedArticles;
    }

    console.log('⚠️ No articles found, using mock data.');
    return getMockNews();
  } catch (error) {
    console.error('❌ Error fetching news:', error.response?.data || error.message);
    return getMockNews();
  }
}

// --- Fallback mock news ---
function getMockNews() {
  return [
    {
      title: 'Stock Shows Strong Performance in Q4',
      description: 'Company reports record earnings and positive outlook.',
      url: '#',
      publishedAt: new Date(),
      sentiment: 'Positive'
    },
    {
      title: 'Market Analysis: Mixed Signals for Tech Sector',
      description: 'Analysts remain cautious amid economic uncertainty.',
      url: '#',
      publishedAt: new Date(),
      sentiment: 'Neutral'
    },
    {
      title: 'Company Faces Regulatory Challenges',
      description: 'New regulations may impact future growth prospects.',
      url: '#',
      publishedAt: new Date(),
      sentiment: 'Negative'
    },
    {
      title: 'Innovation Drive Boosts Market Confidence',
      description: 'New product launches exceed market expectations.',
      url: '#',
      publishedAt: new Date(),
      sentiment: 'Positive'
    },
    {
      title: 'Quarterly Results Meet Expectations',
      description: 'Financial performance aligns with analyst predictions.',
      url: '#',
      publishedAt: new Date(),
      sentiment: 'Neutral'
    }
  ];
}

module.exports = { fetchNews };