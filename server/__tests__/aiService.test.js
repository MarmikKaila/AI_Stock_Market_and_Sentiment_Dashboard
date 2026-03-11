// Tests for AI service
const axios = require('axios');

jest.mock('axios');

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.GEMINI_API_KEY = 'test_gemini_key';
  });

  describe('getRecommendation', () => {
    it('should return BUY recommendation with explanation', async () => {
      // Mock model check
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [{
            content: { parts: [{ text: 'ok' }] }
          }]
        }
      });

      // Mock recommendation response
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [{
            content: {
              parts: [{
                text: 'RECOMMENDATION: BUY\nEXPLANATION: Strong earnings and positive sentiment indicate growth potential.'
              }]
            }
          }]
        }
      });

      jest.resetModules();
      const { getRecommendation } = require('../services/aiService');
      
      const result = await getRecommendation({
        fundamentals: { peRatio: 15, pbRatio: 2, eps: 5, price: 150, marketCap: 2000000000 },
        sentimentScore: 0.5,
        newsSummary: 'Positive news about earnings'
      });

      expect(result.recommendation).toBe('BUY');
      expect(result.explanation).toBeDefined();
    });

    it('should return SELL recommendation when parsed correctly', async () => {
      // Mock model check
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [{
            content: { parts: [{ text: 'ok' }] }
          }]
        }
      });

      // Mock recommendation response
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [{
            content: {
              parts: [{
                text: 'RECOMMENDATION: SELL\nEXPLANATION: High valuation and negative sentiment suggest caution.'
              }]
            }
          }]
        }
      });

      jest.resetModules();
      const { getRecommendation } = require('../services/aiService');
      
      const result = await getRecommendation({
        fundamentals: { peRatio: 50, pbRatio: 10, eps: 1, price: 500, marketCap: 500000000 },
        sentimentScore: -0.5,
        newsSummary: 'Negative news about declining sales'
      });

      expect(result.recommendation).toBe('SELL');
    });

    it('should use fallback when API fails', async () => {
      axios.post.mockRejectedValue(new Error('API Error'));

      jest.resetModules();
      const { getRecommendation } = require('../services/aiService');
      
      const result = await getRecommendation({
        fundamentals: { peRatio: 20, pbRatio: 3, eps: 4, price: 100, marketCap: 1000000000 },
        sentimentScore: 0,
        newsSummary: 'Mixed news'
      });

      expect(['BUY', 'SELL', 'HOLD']).toContain(result.recommendation);
      expect(result.explanation).toBeDefined();
    });

    it('should fallback when no API key is configured', async () => {
      delete process.env.GEMINI_API_KEY;

      jest.resetModules();
      const { getRecommendation } = require('../services/aiService');
      
      const result = await getRecommendation({
        fundamentals: { peRatio: 10, pbRatio: 1, eps: 8, price: 50, marketCap: 800000000 },
        sentimentScore: 0.8,
        newsSummary: 'Great news'
      });

      // With good fundamentals and positive sentiment, should be BUY
      expect(result.recommendation).toBe('BUY');
      expect(result.explanation).toBeDefined();
    });
  });

  describe('simple recommendation logic', () => {
    beforeEach(() => {
      // Force fallback by not having API key
      delete process.env.GEMINI_API_KEY;
      jest.resetModules();
    });

    it('should recommend BUY for low PE ratio and high positive sentiment', async () => {
      const { getRecommendation } = require('../services/aiService');
      
      const result = await getRecommendation({
        fundamentals: { peRatio: 10, pbRatio: 1, eps: 10, price: 50, marketCap: 1000000000 },
        sentimentScore: 0.8,
        newsSummary: 'Great earnings'
      });

      expect(result.recommendation).toBe('BUY');
    });

    it('should recommend SELL for high PE ratio and negative sentiment', async () => {
      const { getRecommendation } = require('../services/aiService');
      
      const result = await getRecommendation({
        fundamentals: { peRatio: 50, pbRatio: 8, eps: -2, price: 300, marketCap: 500000000 },
        sentimentScore: -0.8,
        newsSummary: 'Bad news'
      });

      expect(result.recommendation).toBe('SELL');
    });

    it('should recommend HOLD for neutral metrics', async () => {
      const { getRecommendation } = require('../services/aiService');
      
      // Use truly neutral metrics: PE 30 = 0 pts, PB 4 = 0 pts, EPS 1 = 0 pts, sentiment 0 = 0 pts
      // Total score = 0, which results in HOLD (not >=3 for BUY, not <=-2 for SELL)
      const result = await getRecommendation({
        fundamentals: { peRatio: 30, pbRatio: 4, eps: 1, price: 100, marketCap: 1000000000 },
        sentimentScore: 0,
        newsSummary: 'Normal news'
      });

      expect(result.recommendation).toBe('HOLD');
    });
  });
});
