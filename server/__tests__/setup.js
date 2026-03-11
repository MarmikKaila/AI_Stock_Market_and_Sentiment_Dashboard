// Test setup for Jest
process.env.NODE_ENV = 'test';

// Mock environment variables for tests
process.env.ALPHA_VANTAGE_API_KEY = 'test_alpha_key';
process.env.NEWSAPI_KEY = 'test_news_key';
process.env.GEMINI_API_KEY = 'test_gemini_key';
process.env.MONGO_URI = 'mongodb://localhost:27017/test_stockdb';

// Increase timeout for async tests
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Close any open connections
  await new Promise(resolve => setTimeout(resolve, 500));
});
