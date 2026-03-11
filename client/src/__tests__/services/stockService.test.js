import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStockDetails } from '../../services/stockService';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('stockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStockDetails', () => {
    it('should fetch stock details and opinion successfully', async () => {
      const mockStockData = {
        data: {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 175.5,
          peRatio: 28.5,
          sentimentScore: 0.5,
        }
      };

      const mockOpinionData = {
        symbol: 'AAPL',
        recommendation: 'BUY',
        explanation: 'Strong fundamentals'
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStockData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockOpinionData)
        });

      const result = await getStockDetails('AAPL');

      expect(result.stock.symbol).toBe('AAPL');
      expect(result.opinion.recommendation).toBe('BUY');
    });

    it('should throw error for invalid stock symbol format', async () => {
      await expect(getStockDetails('INVALID123')).rejects.toThrow('Invalid stock symbol');
    });

    it('should throw error for empty symbol', async () => {
      await expect(getStockDetails('')).rejects.toThrow('Invalid stock symbol');
    });

    it('should throw error for symbol with numbers', async () => {
      await expect(getStockDetails('AAP1')).rejects.toThrow('Invalid stock symbol');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getStockDetails('AAPL')).rejects.toThrow('Network error');
    });

    it('should handle non-ok response from stock endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      await expect(getStockDetails('AAPL')).rejects.toThrow('Server error');
    });

    it('should pass AbortSignal to fetch calls', async () => {
      const mockStockData = { data: { symbol: 'AAPL' } };
      const mockOpinionData = { recommendation: 'HOLD' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStockData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockOpinionData)
        });

      const abortController = new AbortController();
      await getStockDetails('AAPL', abortController.signal);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[0][1].signal).toBe(abortController.signal);
    });

    it('should convert symbol to uppercase', async () => {
      const mockStockData = { data: { symbol: 'AAPL' } };
      const mockOpinionData = { recommendation: 'BUY' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStockData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockOpinionData)
        });

      await getStockDetails('aapl');

      expect(mockFetch.mock.calls[0][0]).toContain('AAPL');
    });

    it('should not log abort errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(getStockDetails('AAPL')).rejects.toThrow('Aborted');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
