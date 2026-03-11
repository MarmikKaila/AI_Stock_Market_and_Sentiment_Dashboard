// Backend service tests
const axios = require('axios');

// Mock axios before requiring the service
jest.mock('axios');

const { fetchFundamentalsAlpha, fetchLatestPrice, fetchPriceHistory } = require('../services/stockService');

describe('stockService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchFundamentalsAlpha', () => {
    it('should return fundamentals data with isMocked=false when API succeeds', async () => {
      const mockApiResponse = {
        data: {
          Symbol: 'AAPL',
          Name: 'Apple Inc.',
          PERatio: '28.5',
          PriceToBookRatio: '45.2',
          EPS: '6.05',
          MarketCapitalization: '2500000000000',
        }
      };

      axios.get.mockResolvedValueOnce(mockApiResponse);

      const result = await fetchFundamentalsAlpha('AAPL');

      expect(result.name).toBe('Apple Inc.');
      expect(result.peRatio).toBe(28.5);
      expect(result.pbRatio).toBe(45.2);
      expect(result.eps).toBe(6.05);
      expect(result.marketCap).toBe(2500000000000);
      expect(result.isMocked).toBe(false);
    });

    it('should return mocked data when API returns rate limit error', async () => {
      axios.get.mockResolvedValueOnce({
        data: { Note: 'API rate limit reached' }
      });

      const result = await fetchFundamentalsAlpha('AAPL');

      expect(result.isMocked).toBe(true);
      expect(result.mockReason).toContain('API limit');
    });

    it('should return mocked data with symbol name when API fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchFundamentalsAlpha('TSLA');

      expect(result.isMocked).toBe(true);
      expect(result.name).toBe('TSLA Corp');
      expect(result.peRatio).toBeDefined();
      expect(result.mockReason).toBe('Network error');
    });

    it('should return mocked data when no API key is configured', async () => {
      const originalKey = process.env.ALPHA_VANTAGE_API_KEY;
      delete process.env.ALPHA_VANTAGE_API_KEY;

      const result = await fetchFundamentalsAlpha('AAPL');

      expect(result.isMocked).toBe(true);
      
      // Restore
      process.env.ALPHA_VANTAGE_API_KEY = originalKey;
    });
  });

  describe('fetchLatestPrice', () => {
    it('should return price with isMocked=false when API succeeds', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          'Global Quote': {
            '05. price': '175.50'
          }
        }
      });

      const result = await fetchLatestPrice('AAPL');

      expect(result.price).toBe(175.50);
      expect(result.isMocked).toBe(false);
    });

    it('should return mocked price when API fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await fetchLatestPrice('AAPL');

      expect(result.isMocked).toBe(true);
      expect(result.price).toBeGreaterThan(0);
    });

    it('should return mocked price when no data returned', async () => {
      axios.get.mockResolvedValueOnce({
        data: {}
      });

      const result = await fetchLatestPrice('INVALID');

      expect(result.isMocked).toBe(true);
    });
  });

  describe('fetchPriceHistory', () => {
    it('should return price history with isMocked=false when API succeeds', async () => {
      const mockTimeSeries = {
        '2024-01-05': { '4. close': '180.00' },
        '2024-01-04': { '4. close': '178.50' },
        '2024-01-03': { '4. close': '177.25' },
      };

      axios.get.mockResolvedValueOnce({
        data: { 'Time Series (Daily)': mockTimeSeries }
      });

      const result = await fetchPriceHistory('AAPL', 3);

      expect(result.isMocked).toBe(false);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].price).toBeDefined();
    });

    it('should return mocked data when API fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await fetchPriceHistory('AAPL', 5);

      expect(result.isMocked).toBe(true);
      expect(result.data).toHaveLength(5);
    });

    it('should return mocked data when no time series returned', async () => {
      axios.get.mockResolvedValueOnce({
        data: {}
      });

      const result = await fetchPriceHistory('AAPL', 7);

      expect(result.isMocked).toBe(true);
      expect(result.data.length).toBe(7);
    });
  });
});
