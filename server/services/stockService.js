const axios = require('axios');

async function fetchFundamentalsAlpha(symbol) {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
    const response = await axios.get(overviewUrl);
    
    if (response.data['Note'] || response.data['Information']) {
      throw new Error('API limit reached or invalid request');
    }

    const data = response.data;
    
    return {
      name: data.Name || symbol,
      peRatio: parseFloat(data.PERatio) || null,
      pbRatio: parseFloat(data.PriceToBookRatio) || null,
      eps: parseFloat(data.EPS) || null,
      marketCap: parseInt(data.MarketCapitalization) || null,
    };
  } catch (error) {
    console.error('Error fetching fundamentals:', error);
    // Return mock data for development
    return {
      name: symbol + ' Corp',
      peRatio: 25.5,
      pbRatio: 3.2,
      eps: 5.45,
      marketCap: 1000000000,
    };
  }
}

async function fetchLatestPrice(symbol) {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return 100 + Math.random() * 200; // Mock price
    }

    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const response = await axios.get(quoteUrl);
    
    if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
      return parseFloat(response.data['Global Quote']['05. price']);
    }
    
    // Return mock price if API fails
    return 100 + Math.random() * 200;
  } catch (error) {
    console.error('Error fetching price:', error);
    return 100 + Math.random() * 200; // Mock price
  }
}

module.exports = {
  fetchFundamentalsAlpha,
  fetchLatestPrice,
};