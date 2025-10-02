// src/services/stockService.js

// The base URL of your running backend server
const BACKEND_URL = 'http://localhost:5000';

/**
 * Fetches both the main stock data and the AI opinion for a given symbol.
 * @param {string} symbol - The stock symbol, e.g., 'AAPL'.
 * @returns {Promise<Object>} A combined object with stock and opinion data.
 */
export const getStockDetails = async (symbol) => {
  try {
    // We fetch both endpoints at the same time for efficiency
    const [stockResponse, opinionResponse] = await Promise.all([
      fetch(`${BACKEND_URL}/api/stocks/${symbol}`),
      fetch(`${BACKEND_URL}/api/opinion/${symbol}`),
    ]);

    // Check if either of the network responses failed
    if (!stockResponse.ok || !opinionResponse.ok) {
      throw new Error('Network response from backend was not ok.');
    }

    const stockResult = await stockResponse.json();
    const opinionResult = await opinionResponse.json();

    // Combine the results into one convenient object for our component
    return {
      stock: stockResult.data,
      opinion: opinionResult,
    };
  } catch (error) {
    console.error(`Failed to fetch details for ${symbol}:`, error);
    // Re-throw the error so the Dashboard component's catch block can handle it
    throw error;
  }
};