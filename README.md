# AI Stock Market and Sentiment Dashboard

Production-style full-stack fintech application that combines market data, news sentiment, and AI-generated recommendations. The platform is designed around clear backend boundaries, resilient fallbacks, and a multi-page frontend experience.

Repository: https://github.com/MarmikKaila/AI_Stock_Market_and_Sentiment_Dashboard.git

## What This Project Delivers

- Market overview for major tickers with cached data strategy
- Deep stock detail pages with fundamentals, history, sentiment, and recommendation
- Persistent watchlist backed by MongoDB and client session identity
- Side-by-side stock comparison workflow
- AI-assisted recommendation and summarization with fallback logic when model or quota is unavailable
- Security hardening: CORS controls, helmet, request validation, and rate limiting

## System Architecture

### Frontend

- Runtime: React 19 + Vite
- Routing: React Router multi-page SPA
- Visualization: Recharts
- Styling: Tailwind CSS
- State: React Context for watchlist state and optimistic updates

### Backend

- Runtime: Node.js + Express
- Data: MongoDB + Mongoose
- External providers:
  - Alpha Vantage for market data and historical prices
  - NewsAPI for financial headlines
  - Gemini API for sentiment/recommendation tasks
- Reliability patterns:
  - Graceful degradation to mock/fallback behavior
  - DB availability checks before cache-dependent operations
  - Route-level and payload-level request validation

## Complete Folder Structure

```text
AI_StockMarketSummary_SentimentDashbord/
├─ README.md
├─ package.json
├─ theory.txt
├─ client/
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ index.html
│  ├─ vite.config.js
│  ├─ eslint.config.js
│  ├─ README.md
│  ├─ public/
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ index.css
│     ├─ App.css
│     ├─ assets/
│     ├─ context/
│     │  └─ WatchlistContext.jsx
│     ├─ services/
│     │  ├─ stockService.js
│     │  └─ watchlistService.js
│     ├─ pages/
│     │  ├─ Home.jsx
│     │  ├─ StockDetail.jsx
│     │  ├─ Watchlist.jsx
│     │  ├─ Compare.jsx
│     │  ├─ NotFound.jsx
│     │  └─ Dashboard.jsx
│     ├─ components/
│     │  ├─ Navbar.jsx
│     │  ├─ StockCard.jsx
│     │  ├─ StockSummaryCard.jsx
│     │  ├─ SentimentBadge.jsx
│     │  ├─ SentimentChart.jsx
│     │  ├─ SentimentGauge.jsx
│     │  ├─ PriceChart.jsx
│     │  ├─ EnhancedPriceChart.jsx
│     │  ├─ NewsFeed.jsx
│     │  ├─ AIRecommendation.jsx
│     │  └─ MockDataBanner.jsx
│     └─ __tests__/
│        ├─ components/
│        └─ services/
└─ server/
  ├─ package.json
  ├─ package-lock.json
  ├─ server.js
  ├─ .env.example
  ├─ config/
  │  ├─ db.js
  │  └─ validateEnv.js
  ├─ models/
  │  ├─ Stock.js
  │  └─ Watchlist.js
  ├─ controllers/
  │  ├─ stockController.js
  │  ├─ opinionController.js
  │  └─ watchlistController.js
  ├─ routes/
  │  ├─ stockRoutes.js
  │  ├─ opinionRoutes.js
  │  ├─ aiRoutes.js
  │  └─ watchlistRoutes.js
  ├─ services/
  │  ├─ stockService.js
  │  ├─ newsService.js
  │  └─ aiService.js
  └─ __tests__/
    ├─ aiService.test.js
    ├─ newsService.test.js
    └─ stockService.test.js
```

## Tech Stack (Detailed)

### Frontend stack

| Layer | Technology | Why it is used |
|---|---|---|
| App framework | React 19 | Component-based UI and scalable stateful pages |
| Build tool | Vite 7 | Fast dev server and optimized production build |
| Routing | React Router 7 | Route-based navigation for Home, Detail, Watchlist, Compare |
| Styling | Tailwind CSS 4 | Utility-first styling and responsive design speed |
| Charts | Recharts | Declarative charting for price/sentiment visualizations |
| Testing | Vitest + RTL | Fast unit/component testing with DOM behavior assertions |

### Backend stack

| Layer | Technology | Why it is used |
|---|---|---|
| Runtime | Node.js | Event-driven backend runtime |
| Framework | Express 4 | Routing, middleware pipeline, API composition |
| Database | MongoDB Atlas | Flexible document storage for cache and watchlist |
| ODM | Mongoose 8 | Schema modeling and DB operations |
| HTTP client | Axios | External API integrations with timeout control |
| Security | Helmet, CORS, Rate Limit | Security headers, origin policy, abuse prevention |
| Validation | express-validator | Input validation at API boundary |
| Testing | Jest + Supertest | Service and API contract verification |

### External API providers

| Provider | Purpose | Where used |
|---|---|---|
| Alpha Vantage | Fundamentals + price history | server/services/stockService.js |
| NewsAPI | Latest company/market news | server/services/newsService.js |
| Gemini API | AI sentiment and recommendation tasks | server/services/aiService.js, server/services/newsService.js |

## End-to-End Request Flow

### 1. Stock detail page

1. Client navigates to /stock/:symbol.
2. Client service sends parallel requests:
   - GET /api/stocks/:symbol
   - GET /api/opinion/:symbol
3. Backend stock controller fetches and composes:
   - Fundamentals
   - Price/history
   - News
   - Sentiment score and history
4. Backend returns consolidated stock document and cache metadata.
5. UI renders cards, enhanced chart, sentiment gauge, AI recommendation, and news list.

### 2. Market overview page

1. Client requests GET /api/stocks/market/overview.
2. Backend loops over popular symbols with cache-first logic.
3. Per symbol, service composes cached/fresh stock data and lightweight sentiment summary.
4. UI renders summary cards with watchlist actions.

### 3. Watchlist flow

1. Client creates/stores a stable session id in localStorage.
2. Context loads GET /api/watchlist/:sessionId.
3. Add/remove calls use:
   - POST /api/watchlist/:sessionId/add
   - DELETE /api/watchlist/:sessionId/:symbol
4. UI applies optimistic updates and reverts on failure.

## How Everything Works (Deep Dive)

### A) Startup lifecycle

1. Server reads environment variables through dotenv.
2. validateEnv checks required and optional runtime configuration.
3. connectDB attempts MongoDB connection; app continues even if DB is unavailable.
4. Security middleware is mounted in this order: helmet, cors, rate-limiters, body parsers.
5. API route modules are mounted under /api namespaces.

### B) Stock analysis pipeline

1. Stock symbol enters from route parameter or search input.
2. Backend validates symbol format (letters only, 1-5 length).
3. Service layer fetches:
  - Fundamentals from Alpha Vantage OVERVIEW
  - Historical prices from TIME_SERIES_DAILY
  - News headlines from NewsAPI
4. News sentiment is computed using Gemini model selection logic.
5. If Gemini is unavailable (quota/model/access), fallback sentiment logic is used.
6. Sentiment score is normalized and stored with stock payload.
7. Response includes data quality indicators (mock/fallback status) to inform UI.

### C) Caching strategy

1. Stock data is cached in MongoDB with lastFetchedAt timestamp.
2. Overview endpoint checks cache freshness before calling providers.
3. If DB is unavailable, app still returns data by live/mock composition.
4. This design prioritizes uptime and user-facing continuity.

### D) Watchlist state synchronization

1. Client generates a stable session ID and stores it in localStorage.
2. Context provider fetches watchlist symbols and hydrated stock docs.
3. Add/remove actions update UI optimistically for speed.
4. On server rejection, UI reverts and performs refresh to restore truth state.

### E) Compare page behavior

1. Two symbols are selected by user input/query params.
2. Client fetches both stock payloads in parallel.
3. UI computes metric-by-metric deltas and highlights directional advantages.
4. Shared rendering primitives keep comparison and detail pages visually consistent.

## Frontend Structure

### Application shell and routing

- Entry: [client/src/main.jsx](client/src/main.jsx)
- Router and provider composition: [client/src/App.jsx](client/src/App.jsx)
- Routes:
  - /
  - /stock/:symbol
  - /watchlist
  - /compare
  - * (not found)

### Key pages

- [client/src/pages/Home.jsx](client/src/pages/Home.jsx): market overview and quick actions
- [client/src/pages/StockDetail.jsx](client/src/pages/StockDetail.jsx): full analysis page for one ticker
- [client/src/pages/Watchlist.jsx](client/src/pages/Watchlist.jsx): persistent watchlist view
- [client/src/pages/Compare.jsx](client/src/pages/Compare.jsx): side-by-side comparison workflow
- [client/src/pages/NotFound.jsx](client/src/pages/NotFound.jsx): catch-all route

### State and data services

- Watchlist context: [client/src/context/WatchlistContext.jsx](client/src/context/WatchlistContext.jsx)
- Stock API client: [client/src/services/stockService.js](client/src/services/stockService.js)
- Watchlist API client: [client/src/services/watchlistService.js](client/src/services/watchlistService.js)

### Visualization and UI components

- Enhanced price chart: [client/src/components/EnhancedPriceChart.jsx](client/src/components/EnhancedPriceChart.jsx)
- Sentiment gauge: [client/src/components/SentimentGauge.jsx](client/src/components/SentimentGauge.jsx)
- Stock summary cards: [client/src/components/StockSummaryCard.jsx](client/src/components/StockSummaryCard.jsx)
- Recommendation block: [client/src/components/AIRecommendation.jsx](client/src/components/AIRecommendation.jsx)
- News feed and sentiment badges: [client/src/components/NewsFeed.jsx](client/src/components/NewsFeed.jsx), [client/src/components/SentimentBadge.jsx](client/src/components/SentimentBadge.jsx)

## Backend Structure

### App bootstrap and middleware

- Server bootstrap: [server/server.js](server/server.js)
- DB connection and availability check: [server/config/db.js](server/config/db.js)
- Environment validation: [server/config/validateEnv.js](server/config/validateEnv.js)

Security and runtime controls currently enabled:

- helmet headers
- strict CORS allow-list with explicit methods including DELETE
- global rate limit on /api
- stricter rate limit for /api/ai
- JSON and URL-encoded body size limits
- centralized error middleware

### API surface

#### Stock routes

- GET /api/stocks/market/overview
- GET /api/stocks/:symbol
- GET /api/stocks/:symbol/history?range=7d|30d|90d

Definitions: [server/routes/stockRoutes.js](server/routes/stockRoutes.js)

#### Opinion and AI routes

- GET /api/opinion/:symbol
- POST /api/ai/recommend
- POST /api/ai/summarize

Definitions: [server/routes/opinionRoutes.js](server/routes/opinionRoutes.js), [server/routes/aiRoutes.js](server/routes/aiRoutes.js)

#### Watchlist routes

- GET /api/watchlist/:sessionId
- POST /api/watchlist/:sessionId/add
- DELETE /api/watchlist/:sessionId/:symbol

Definitions: [server/routes/watchlistRoutes.js](server/routes/watchlistRoutes.js)

### Core controllers and services

- Stock controller: [server/controllers/stockController.js](server/controllers/stockController.js)
- Opinion controller: [server/controllers/opinionController.js](server/controllers/opinionController.js)
- Watchlist controller: [server/controllers/watchlistController.js](server/controllers/watchlistController.js)
- Market data service: [server/services/stockService.js](server/services/stockService.js)
- News + sentiment service: [server/services/newsService.js](server/services/newsService.js)
- AI integration service: [server/services/aiService.js](server/services/aiService.js)

## Data Model

### Stock cache model

- Schema location: [server/models/Stock.js](server/models/Stock.js)
- Purpose: stores normalized stock snapshot, sentiment metadata, and fetch timestamps to reduce external API pressure.

### Watchlist model

- Schema location: [server/models/Watchlist.js](server/models/Watchlist.js)
- Fields:
  - sessionId (indexed)
  - symbols array
  - timestamps
- Guardrail: max 20 symbols enforced in controller logic.

## Environment Configuration

Use [server/.env.example](server/.env.example) as template.

Expected variables:

- PORT
- MONGO_URI
- ALPHA_VANTAGE_API_KEY
- NEWSAPI_KEY
- GEMINI_API_KEY
- COHERE_API_KEY (optional in current flow)
- CORS_ORIGINS (optional, comma-separated)

### API keys and exactly what they do

| Variable | Required | Used for | Source |
|---|---|---|---|
| ALPHA_VANTAGE_API_KEY | Optional but recommended | Fundamentals + historical prices | https://www.alphavantage.co/support/#api-key |
| NEWSAPI_KEY | Optional but recommended | News headline ingestion | https://newsapi.org/register |
| GEMINI_API_KEY | Required | AI sentiment/recommendation generation | https://aistudio.google.com/app/apikey |
| COHERE_API_KEY | Optional | Reserved for optional model strategy/extensions | https://dashboard.cohere.com/api-keys |

### Example .env template (safe placeholders)

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
NEWSAPI_KEY=your_newsapi_key_here
GEMINI_API_KEY=your_gemini_key_here
COHERE_API_KEY=your_cohere_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Security guidance for keys

- Never commit real keys in any tracked file.
- Keep only placeholders in .env.example.
- Rotate keys immediately if leaked.
- Prefer per-environment keys (dev/stage/prod) with restricted quotas.

Important:

- Never commit real credentials.
- Keep [server/.env](server/.env) local-only.

## Local Development

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas connection string

### 1) Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2) Configure environment

```bash
cd server
cp .env.example .env
```

Then edit .env with your own credentials.

### 3) Run backend

```bash
cd server
npm run dev
```

### 4) Run frontend

```bash
cd client
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Test Strategy

### Backend

- Frameworks: Jest + Supertest
- Commands:

```bash
cd server
npm test
npm run test:coverage
```

### Frontend

- Frameworks: Vitest + React Testing Library
- Commands:

```bash
cd client
npm test
npm run test:coverage
```

Current test files include:

- [server/__tests__/stockService.test.js](server/__tests__/stockService.test.js)
- [server/__tests__/newsService.test.js](server/__tests__/newsService.test.js)
- [server/__tests__/aiService.test.js](server/__tests__/aiService.test.js)
- [client/src/__tests__/services/stockService.test.js](client/src/__tests__/services/stockService.test.js)
- [client/src/__tests__/components/Navbar.test.jsx](client/src/__tests__/components/Navbar.test.jsx)
- [client/src/__tests__/components/StockCard.test.jsx](client/src/__tests__/components/StockCard.test.jsx)
- [client/src/__tests__/components/SentimentBadge.test.jsx](client/src/__tests__/components/SentimentBadge.test.jsx)

## Build and Verification

### Frontend production build

```bash
cd client
npm run build
```

### Backend syntax verification

```bash
cd server
node -c server.js
```

## Reliability and Fallback Behavior

- If MongoDB is unavailable:
  - App continues serving responses without DB caching.
- If Gemini quota/model is unavailable:
  - Sentiment/recommendation falls back to keyword/rule-based logic where implemented.
- If external provider limits are reached:
  - Services return mock or partial-safe payloads to keep UI functional.

## Performance and Operational Notes

- Cache-first market overview to reduce third-party calls
- Request validation at route boundaries to reject malformed payloads early
- Explicit AI endpoint throttling to protect quota and cost
- Preflight CORS policy includes DELETE for watchlist mutation paths

## Security Notes

- Helmet enabled for common HTTP hardening headers
- CORS allow-list driven by CORS_ORIGINS
- Input validation via express-validator
- Rate limiting via express-rate-limit
- Body size limits configured for abuse mitigation

## Known Constraints

- Free-tier third-party API limits can trigger degraded mode
- Watchlist identity is session-based, not account-authenticated
- Bundle size warning may appear in production builds without route-level code splitting

## Roadmap

- Add authenticated users and account-scoped watchlists
- Add CI pipeline gates (lint, unit, integration)
- Add API docs via OpenAPI/Swagger
- Add Redis for low-latency cache tier
- Add route-level code splitting and bundle budgets

## Author

Marmik Kaila

- GitHub: https://github.com/MarmikKaila
- LinkedIn: https://www.linkedin.com/in/marmik-kaila-748bab28a/

If this project is useful, consider starring the repository.
**⭐ If you found this project helpful, please consider giving it a star!**
