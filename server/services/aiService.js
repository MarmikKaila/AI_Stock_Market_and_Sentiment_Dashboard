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
                console.log(`✅ Using Gemini model: ${model}`);
                return model;
            }
        } catch (error) {
            // Try next model
            continue;
        }
    }

    console.warn('⚠️ No working Gemini model found, using fallback methods');
    return null;
}

async function callGeminiAPI(messages, options = {}) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
    }

    const model = await findWorkingModel();
    if (!model) {
        throw new Error('No working Gemini model available');
    }

    const combinedPrompt = messages.map(m => m.content).join('\n\n');

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        
        const response = await axios.post(
            url,
            {
                contents: [{
                    parts: [{
                        text: combinedPrompt
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: options.max_tokens || 100,
                    temperature: options.temperature || 0.5,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            }
        );

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return response.data.candidates[0].content.parts[0].text.trim();
        }
        
        throw new Error('Invalid response from Gemini API');
    } catch (error) {
        if (error.response) {
            console.error('Gemini API Error:', error.response.status, error.response.data?.error?.message || error.response.data);
        } else {
            console.error('Gemini API Error:', error.message);
        }
        throw error;
    }
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

Sentiment Score: ${sentimentScore} (range: -1 to 1, where -1 is very negative and 1 is very positive)
Recent News Summary: ${newsSummary}

Based on this data, provide ONLY ONE WORD as your recommendation: BUY, HOLD, or SELL.
        `.trim();

        const messages = [
            { 
                role: 'user', 
                content: 'You are a stock market analyst. Analyze the data and respond with exactly one word: BUY, HOLD, or SELL.\n\n' + prompt 
            },
        ];

        const recommendation = await callGeminiAPI(messages, { max_tokens: 10, temperature: 0.3 });
        const upperRec = recommendation.toUpperCase().trim();

        if (upperRec.includes('BUY')) return 'BUY';
        if (upperRec.includes('HOLD')) return 'HOLD';
        if (upperRec.includes('SELL')) return 'SELL';

        return getSimpleRecommendation(fundamentals, sentimentScore);
    } catch (error) {
        console.error('AI Service error:', error.message);
        return getSimpleRecommendation(fundamentals, sentimentScore);
    }
}

async function summarizeNews(article) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || !article) {
        return article ? article.substring(0, 150) + '...' : '';
    }

    try {
        const messages = [
            { 
                role: 'user', 
                content: `Summarize this news article in 2-3 sentences:\n\n${article}` 
            },
        ];
        return await callGeminiAPI(messages, { max_tokens: 100, temperature: 0.5 });
    } catch (error) {
        console.error('News summarization error:', error.message);
        return article.substring(0, 150) + '...';
    }
}

function getSimpleRecommendation(fundamentals, sentimentScore) {
    let score = 0;
    
    // PE Ratio scoring
    if (fundamentals.peRatio) {
        if (fundamentals.peRatio < 15) score += 2;
        else if (fundamentals.peRatio < 25) score += 1;
        else if (fundamentals.peRatio > 35) score -= 1;
    }
    
    // PB Ratio scoring
    if (fundamentals.pbRatio) {
        if (fundamentals.pbRatio < 1) score += 2;
        else if (fundamentals.pbRatio < 3) score += 1;
        else if (fundamentals.pbRatio > 5) score -= 1;
    }
    
    // Sentiment scoring
    if (sentimentScore > 0.5) score += 2;
    else if (sentimentScore > 0) score += 1;
    else if (sentimentScore < -0.5) score -= 2;
    else if (sentimentScore < 0) score -= 1;

    if (score >= 3) return 'BUY';
    if (score <= -2) return 'SELL';
    return 'HOLD';
}

async function analyzeSentiment(newsArticles) {
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey || !newsArticles || newsArticles.length === 0) {
        console.log('No Gemini API key or no news articles, returning neutral sentiment');
        return 0;
    }

    try {
        const text = newsArticles
            .filter(n => n.title || n.description)
            .map(n => `${n.title || ''}. ${n.description || ''}`)
            .join('\n')
            .substring(0, 2000);

        if (!text.trim()) {
            return 0;
        }

        const messages = [
            {
                role: 'user',
                content: `
Analyze the sentiment of the following stock news headlines and descriptions.
Give a single number between -1 (very negative) and +1 (very positive) representing the overall average sentiment.
Respond with ONLY the number, nothing else.

News:
${text}

Sentiment score:`.trim()
            }
        ];

        const scoreText = await callGeminiAPI(messages, { max_tokens: 10, temperature: 0.2 });
        
        const match = scoreText.match(/-?\d+\.?\d*/);
        if (match) {
            const score = parseFloat(match[0]);
            if (!isNaN(score)) {
                return Math.min(1, Math.max(-1, score));
            }
        }
        
        console.log('Could not parse sentiment score, using fallback');
        return 0;
    } catch (error) {
        console.error("Sentiment analysis failed:", error.message);
        return 0;
    }
}

module.exports = {
    getRecommendation: generateDetailedRecommendation,
    summarizeNews,
    analyzeSentiment,
};