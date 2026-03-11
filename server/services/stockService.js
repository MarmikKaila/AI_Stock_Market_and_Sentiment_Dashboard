const axios = require('axios');

async function fetchFundamentalsAlpha(symbol) {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
    const response = await axios.get(overviewUrl, { timeout: 10000 });
    
    if (response.data['Note'] || response.data['Information']) {
      throw new Error('API limit reached or invalid request');
    }

    const data = response.data;
    
    // Check if we got actual data (empty response means invalid symbol)
    if (!data.Name && !data.Symbol) {
      throw new Error('No data returned for symbol');
    }
    
    return {
      name: data.Name || symbol,
      peRatio: parseFloat(data.PERatio) || null,
      pbRatio: parseFloat(data.PriceToBookRatio) || null,
      eps: parseFloat(data.EPS) || null,
      marketCap: parseInt(data.MarketCapitalization) || null,
      isMocked: false,
    };
  } catch (error) {
    console.error('Error fetching fundamentals:', error.message);
    // Return mock data for development with isMocked flag
    return {
      name: symbol + ' Corp',
      peRatio: 25.5,
      pbRatio: 3.2,
      eps: 5.45,
      marketCap: 1000000000,
      isMocked: true,
      mockReason: error.message || 'API unavailable',
    };
  }
}

async function fetchLatestPrice(symbol) {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return { price: 100 + Math.random() * 200, isMocked: true, mockReason: 'No API key' };
    }

    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const response = await axios.get(quoteUrl, { timeout: 10000 });

    // Check for rate limit messages
    if (response.data['Note'] || response.data['Information']) {
      return { price: null, isMocked: true, mockReason: 'API rate limit reached' };
    }
    
    if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
      return {
        price: parseFloat(response.data['Global Quote']['05. price']),
        isMocked: false,
      };
    }
    
    // No data returned
    return { price: null, isMocked: true, mockReason: 'No price data returned' };
  } catch (error) {
    console.error('Error fetching price:', error.message);
    return { price: null, isMocked: true, mockReason: error.message };
  }
}

/**
 * Fetch historical daily prices for chart display
 */
async function fetchPriceHistory(symbol, days = 7) {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return { data: generateMockPriceHistory(days), isMocked: true };
    }

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    const response = await axios.get(url, { timeout: 15000 });
    
    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) {
      return { data: generateMockPriceHistory(days), isMocked: true, mockReason: 'No time series data' };
    }

    const dates = Object.keys(timeSeries).slice(0, days).reverse();
    const priceHistory = dates.map(date => ({
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      date: date,
      price: parseFloat(timeSeries[date]['4. close']),
    }));

    return { data: priceHistory, isMocked: false };
  } catch (error) {
    console.error('Error fetching price history:', error.message);
    return { data: generateMockPriceHistory(days), isMocked: true, mockReason: error.message };
  }
}

function generateMockPriceHistory(days) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const basePrice = 100 + Math.random() * 100;
  const history = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      name: dayNames[date.getDay()],
      date: date.toISOString().split('T')[0],
      price: basePrice + (Math.random() - 0.5) * 20,
    });
  }
  
  return history;
}

module.exports = {
  fetchFundamentalsAlpha,
  fetchLatestPrice,
  fetchPriceHistory,
};