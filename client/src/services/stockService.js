// src/services/stockService.js

// The base URL of your running backend server - use environment variable for production
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Fetches both the main stock data and the AI opinion for a given symbol.
 * @param {string} symbol - The stock symbol, e.g., 'AAPL'.
 * @param {AbortSignal} signal - Optional AbortController signal for cancellation.
 * @returns {Promise<Object>} A combined object with stock and opinion data.
 */
export const getStockDetails = async (symbol, signal) => {
  // Validate symbol format
  const cleanSymbol = symbol.trim().toUpperCase();
  if (!/^[A-Z]{1,5}$/.test(cleanSymbol)) {
    throw new Error('Invalid stock symbol. Use 1-5 letters (e.g., AAPL, TSLA).');
  }

  try {
    // We fetch both endpoints at the same time for efficiency
    const [stockResponse, opinionResponse] = await Promise.all([
      fetch(`${BACKEND_URL}/api/stocks/${cleanSymbol}`, { 
        signal,
        headers: { 'Content-Type': 'application/json' },
      }),
      fetch(`${BACKEND_URL}/api/opinion/${cleanSymbol}`, { 
        signal,
        headers: { 'Content-Type': 'application/json' },
      }),
    ]);

    // Check if either of the network responses failed
    if (!stockResponse.ok) {
      const errorData = await stockResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch stock data (${stockResponse.status})`);
    }
    if (!opinionResponse.ok) {
      const errorData = await opinionResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch AI opinion (${opinionResponse.status})`);
    }

    const stockResult = await stockResponse.json();
    const opinionResult = await opinionResponse.json();

    // Combine the results into one convenient object for our component
    return {
      stock: stockResult.data,
      opinion: opinionResult,
      fromCache: stockResult.fromCache,
    };
  } catch (error) {
    // Don't log abort errors - they're intentional
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error(`Failed to fetch details for ${symbol}:`, error);
    // Re-throw the error so the Dashboard component's catch block can handle it
    throw error;
  }
};