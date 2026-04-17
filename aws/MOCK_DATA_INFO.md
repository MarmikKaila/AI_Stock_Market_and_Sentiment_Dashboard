(Mock data for health check and basic endpoints - AWS Lambda handlers)

All Lambda functions will return mock data until actual APIs are integrated:
- Alpha Vantage API key is integrated
- NewsAPI key is integrated
- Gemini API key is integrated

Expected responses:

GET /api/health:
{
  "status": "healthy",
  "timestamp": "2026-04-17T...",
  "services": {
    "database": "ok",
    "secretsManager": "ok",
    "cloudwatch": "ok"
  }
}

GET /api/stocks/AAPL:
{
  "symbol": "AAPL",
  "name": "Mock Company Inc.",
  "price": 150.25,
  "sentiment_score": 0.65,
  "recommendation": "BUY",
  "isMocked": true
}

GET /api/stocks/market/overview:
{
  "stocks": [
    {"symbol": "AAPL", "sentiment": 0.72},
    {"symbol": "MSFT", "sentiment": 0.68},
    ...
  ]
}
