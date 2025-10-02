const axios = require('axios');

// Constant for the Google Gemini API - UPDATED to use gemini-pro
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function callGeminiAPI(messages, options = {}) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
    }

    const combinedPrompt = messages.map(m => m.content).join('\n\n');

    const response = await axios.post(
        `${GEMINI_API_URL}?key=${geminiKey}`,
        {
            contents: [{ parts: [{ text: combinedPrompt }] }],
            generationConfig: {
                maxOutputTokens: options.max_tokens,
                temperature: options.temperature,
            },
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data.candidates[0].content.parts[0].text.trim();
}

async function generateDetailedRecommendation({ fundamentals, sentimentScore, newsSummary }) {
    try {
        const prompt = `
            Analyze the following stock data and provide a recommendation (BUY, HOLD, or SELL):
            
            Fundamentals:
            - PE Ratio: ${fundamentals.peRatio || 'N/A'}
            - PB Ratio: ${fundamentals.pbRatio || 'N/A'}
            - EPS: ${fundamentals.eps || 'N/A'}
            - Price: $${fundamentals.price || 'N/A'}
            - Market Cap: $${fundamentals.marketCap || 'N/A'}
            
            Sentiment Score: ${sentimentScore} (range: -1 to 1)
            Recent News: ${newsSummary}
            
            Provide only one word: BUY, HOLD, or SELL.
        `;

        const messages = [
            { role: 'system', content: 'You are a stock market analyst. Provide only one-word recommendations: BUY, HOLD, or SELL.' },
            { role: 'user', content: prompt },
        ];

        const recommendation = await callGeminiAPI(messages, { max_tokens: 10, temperature: 0.3 });
        const upperRec = recommendation.toUpperCase();

        if (['BUY', 'HOLD', 'SELL'].includes(upperRec)) {
            return upperRec;
        }
        return getSimpleRecommendation(fundamentals, sentimentScore);
    } catch (error) {
        console.error('AI Service error:', error.message);
        return getSimpleRecommendation(fundamentals, sentimentScore);
    }
}

// ... (summarizeNews and getSimpleRecommendation functions remain the same) ...

async function summarizeNews(article) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        return article.substring(0, 150) + '...';
    }

    try {
        const messages = [
            { role: 'system', content: 'Summarize this news article in 2-3 sentences.' },
            { role: 'user', content: article },
        ];
        return await callGeminiAPI(messages, { max_tokens: 100, temperature: 0.5 });
    } catch (error) {
        console.error('News summarization error:', error.message);
        return article.substring(0, 150) + '...';
    }
}

function getSimpleRecommendation(fundamentals, sentimentScore) {
    let score = 0;
    if (fundamentals.peRatio) {
        if (fundamentals.peRatio < 15) score += 2;
        else if (fundamentals.peRatio < 25) score += 1;
        else if (fundamentals.peRatio > 35) score -= 1;
    }
    if (fundamentals.pbRatio) {
        if (fundamentals.pbRatio < 1) score += 2;
        else if (fundamentals.pbRatio < 3) score += 1;
        else if (fundamentals.pbRatio > 5) score -= 1;
    }
    if (sentimentScore > 0.5) score += 2;
    else if (sentimentScore > 0) score += 1;
    else if (sentimentScore < -0.5) score -= 2;
    else if (sentimentScore < 0) score -= 1;

    if (score >= 3) return 'BUY';
    if (score <= -2) return 'SELL';
    return 'HOLD';
}

module.exports = {
    getRecommendation: generateDetailedRecommendation,
    summarizeNews,
};