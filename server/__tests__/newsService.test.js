// Tests for news service
jest.mock('axios');

const axios = require('axios');

describe('newsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEWSAPI_KEY = 'test_news_key';
    process.env.GEMINI_API_KEY = 'test_gemini_key';
  });

  it('should return articles with isMocked=false when API succeeds', async () => {
    // Reset modules to get fresh state with env vars set
    jest.resetModules();
    jest.mock('axios');
    const axios = require('axios');
    
    // Mock NewsAPI response
    axios.get.mockResolvedValue({
      data: {
        articles: [
          {
            title: 'Apple Reports Strong Earnings',
            description: 'Apple beat expectations...',
            url: 'https://example.com/article1',
            publishedAt: '2024-01-05T10:00:00Z'
          },
          {
            title: 'Tech Stocks Rise',
            description: 'Market optimism grows...',
            url: 'https://example.com/article2',
            publishedAt: '2024-01-05T11:00:00Z'
          }
        ]
      }
    });

    // Mock Gemini API for model check and sentiment analysis
    axios.post.mockResolvedValue({
      data: { candidates: [{ content: { parts: [{ text: 'Positive' }] } }] }
    });

    // Import fresh module
    const { fetchNews } = require('../services/newsService');
    const result = await fetchNews('AAPL', 'Apple Inc.');

    expect(result.isMocked).toBe(false);
    expect(result.articles).toHaveLength(2);
    expect(result.articles[0].title).toBe('Apple Reports Strong Earnings');
  });

  it('should return mock news when NEWSAPI_KEY is not configured', async () => {
    delete process.env.NEWSAPI_KEY;
    
    // Import fresh module
    jest.resetModules();
    const { fetchNews } = require('../services/newsService');
    const result = await fetchNews('AAPL', 'Apple Inc.');

    expect(result.isMocked).toBe(true);
    expect(result.articles.length).toBeGreaterThan(0);
  });

  it('should return mock news when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    jest.resetModules();
    const { fetchNews } = require('../services/newsService');
    const result = await fetchNews('AAPL', 'Apple Inc.');

    expect(result.isMocked).toBe(true);
    expect(result.mockReason).toBeDefined();
  });
});
