const axios = require('axios');

// Try multiple Gemini models in order of preference
const GEMINI_MODELS = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro'
];

let workingModel = null;

async function findWorkingModel() {
    if (workingModel) return workingModel;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return null;

    for (const model of GEMINI_MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
            const response = await axios.post(
                url,
                {
                    contents: [{
                        parts: [{ text: 'Hi' }]
                    }]
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                }
            );

            if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                workingModel = model;
                console.log(`✅ Using Gemini model for news: ${model}`);
                return model;
            }
        } catch (error) {
            continue;
        }
    }

    return null;
}

/**
 * Analyzes the sentiment of a news headline using the Google Gemini API.
 * @param {string} text - The headline to analyze.
 * @returns {Promise<string>} 'Positive', 'Negative', or 'Neutral'.
 */
async function analyzeSentiment(text) {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
        return 'Neutral';
    }

    try {
        const model = await findWorkingModel();
        if (!model) {
            return 'Neutral';
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

        const prompt = `Analyze the sentiment of this news headline. Respond with only one word: Positive, Negative, or Neutral. Headline: "${text}"`;

        const response = await axios.post(
            url,
            { contents: [{ parts: [{ text: prompt }] }] },
            { 
                headers: { 'Content-Type': 'application/json' },
                timeout: 8000
            }
        );

        const sentiment =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            'Neutral';

        const upperSentiment = sentiment.toUpperCase();
        if (upperSentiment.includes('POSITIVE')) return 'Positive';
        if (upperSentiment.includes('NEGATIVE')) return 'Negative';
        if (upperSentiment.includes('NEUTRAL')) return 'Neutral';

        return 'Neutral';

    } catch (error) {
        return 'Neutral';
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
            
            const processedArticles = await Promise.all(
                response.data.articles.map(async (article) => {
                    const sentiment = await analyzeSentiment(article.title);
                    return {
                        title: article.title,
                        description: article.description || '',
                        url: article.url,
                        publishedAt: new Date(article.publishedAt),
                        sentiment,
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

// 📰 Mock fallback news
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
        },
    ];
}

module.exports = { fetchNews };