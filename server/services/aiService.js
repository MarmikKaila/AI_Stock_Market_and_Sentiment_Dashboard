const axios = require('axios');

// Try multiple Gemini models in order of preference
const GEMINI_MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-pro'
];

let workingModel = null;
let modelCheckCompleted = false;
let modelCheckFailed = false;

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
                modelCheckCompleted = true;
                console.log(`✅ Using Gemini model: ${model}`);
                return model;
            }
        } catch (error) {
            // Try next model
            continue;
        }
    }

    console.warn('⚠️ No working Gemini model found. Using fallback analysis methods.');
    console.warn('   → Check GEMINI_API_KEY in your .env file');
    console.warn('   → Get a key from: https://makersuite.google.com/app/apikey');
    
    modelCheckFailed = true;
    modelCheckCompleted = true;
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
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`;

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
        console.error('AI Service error, using fallback recommendation:', error.message);
        return getSimpleRecommendation(fundamentals, sentimentScore);
    }
}

async function summarizeNews(article) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || !article) {
        return article ? article.substring(0, 150) + '...' : '';
    }

    try {
        const model = await findWorkingModel();
        if (!model) {
            // Fallback: return first 150 characters
            return article.substring(0, 150) + '...';
        }

        const messages = [
            { 
                role: 'user', 
                content: `Summarize this news article in 2-3 sentences:\n\n${article}` 
            },
        ];
        return await callGeminiAPI(messages, { max_tokens: 100, temperature: 0.5 });
    } catch (error) {
        console.error('News summarization error, using truncated text:', error.message);
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
    
    // EPS scoring
    if (fundamentals.eps) {
        if (fundamentals.eps > 5) score += 2;
        else if (fundamentals.eps > 2) score += 1;
        else if (fundamentals.eps < 0) score -= 2;
    }
    
    // Sentiment scoring (now more weighted)
    if (sentimentScore > 0.5) score += 2;
    else if (sentimentScore > 0.2) score += 1;
    else if (sentimentScore < -0.5) score -= 2;
    else if (sentimentScore < -0.2) score -= 1;

    if (score >= 3) return 'BUY';
    if (score <= -2) return 'SELL';
    return 'HOLD';
}

async function analyzeSentiment(newsArticles) {
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey || !newsArticles || newsArticles.length === 0) {
        console.log('No Gemini API key or no news articles, using fallback sentiment analysis');
        return analyzeSentimentFallback(newsArticles);
    }

    try {
        const model = await findWorkingModel();
        if (!model) {
            return analyzeSentimentFallback(newsArticles);
        }

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
        
        console.log('Could not parse sentiment score, using fallback analysis');
        return analyzeSentimentFallback(newsArticles);
    } catch (error) {
        console.error("Sentiment analysis failed, using fallback:", error.message);
        return analyzeSentimentFallback(newsArticles);
    }
}

/**
 * Fallback sentiment analysis using keyword matching and article sentiment labels
 */
function analyzeSentimentFallback(newsArticles) {
    if (!newsArticles || newsArticles.length === 0) {
        return 0;
    }

    const sentimentMap = {
        'Positive': 0.7,
        'Negative': -0.7,
        'Neutral': 0
    };

    // If articles have sentiment labels, use those
    if (newsArticles[0]?.sentiment) {
        const scores = newsArticles.map(article => sentimentMap[article.sentiment] || 0);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return Math.round(avgScore * 100) / 100; // Round to 2 decimal places
    }

    // Otherwise, use keyword analysis
    const positiveWords = ['strong', 'growth', 'profit', 'success', 'innovation', 'boost', 'gain', 'rise', 'record', 'exceed', 'positive', 'up'];
    const negativeWords = ['loss', 'decline', 'fall', 'challenge', 'concern', 'drop', 'fail', 'weak', 'regulatory', 'lawsuit', 'negative', 'down'];
    
    let positiveCount = 0;
    let negativeCount = 0;

    newsArticles.forEach(article => {
        const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
        positiveCount += positiveWords.filter(word => text.includes(word)).length;
        negativeCount += negativeWords.filter(word => text.includes(word)).length;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) return 0;

    const score = (positiveCount - negativeCount) / total;
    return Math.round(score * 100) / 100; // Round to 2 decimal places
}

module.exports = {
    getRecommendation: generateDetailedRecommendation,
    summarizeNews,
    analyzeSentiment,
};