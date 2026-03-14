# 📊 AI Stock Market and Sentiment Dashboard

> A production-grade **full-stack fintech application** that delivers real-time stock analysis, AI-powered sentiment evaluation, and intelligent buy/sell/hold recommendations powered by Google Gemini.

**Repository:** https://github.com/MarmikKaila/AI_Stock_Market_and_Sentiment_Dashboard.git

---

## 🎯 What Problem Does This Solve?

Investors today face an overload of market data. Without intelligent contextualization, it's hard to make confident decisions.

**This dashboard solves it by:**
- ✅ Pulling real stock fundamentals from Alpha Vantage
- ✅ Analyzing market sentiment from live news via NewsAPI  
- ✅ Generating AI-powered investment recommendations using Gemini
- ✅ Caching results to minimize API calls and costs
- ✅ Providing a persistent watchlist for personal tracking
- ✅ Allowing side-by-side stock comparisons

---

## 📹 Product Walkthrough (Video Demo)

[▶️ **WATCH DEMO VIDEO**](https://drive.google.com/file/d/13IK9walcuvg2VHGvFdtoI_qaeRcHtXdw/view?usp=sharing)



*In this video, watch:*
- Market overview page showing top 5 stocks
- Clicking into a stock detail page and seeing fundamentals + sentiment
- Adding/removing stocks from watchlist
- Comparing two stocks side-by-side
- Enhanced price chart with time range selector

---

## 🏗️ System Architecture Overview

### How the pieces fit together:

```
┌─────────────────┐
│   React SPA     │  (Client: React 19, Vite, React Router)
│   Home          │  Pages: Home, StockDetail, Watchlist, Compare
│   Detail        │
│   Watchlist     │
└────────┬────────┘
         │ HTTP/JSON
         ↓
┌──────────────────────┐
│   Express Server     │  (Backend: Node.js + Express)
│   /api/stocks        │  
│   /api/opinion       │  Routes: Stock, Opinion, AI, Watchlist
│   /api/watchlist     │
└────────┬─────────────┘
         │
    ┌────┴─────┬──────────┬──────────┐
    ↓          ↓          ↓          ↓
MongoDB    Alpha Vantage NewsAPI   Gemini API
 (Cache)   (Prices +     (News)    (AI Models)
          Fundamentals)
```

---

## 🖥️ Frontend Architecture (React SPA)

### Pages and their responsibilities:

| Page | What It Does | Key Features |
|---|---|---|
| **Home** `/` | Market overview showing top 5 stocks | Summary cards, quick actions, watchlist toggles |
| **Stock Detail** `/stock/:symbol` | Deep dive into one stock | Charts, fundamentals, sentiment, AI recommendation, news |
| **Watchlist** `/watchlist` | Persistent user-saved stocks | MongoDB-backed, session-based identity |
| **Compare** `/compare` | Side-by-side stock analysis | Color-coded metric comparison, overlaid charts |
| **Not Found** `/*` | 404 fallback | Friendly error page |

### Frontend tech stack:

```
React 19 (Component framework)
├─ React Router 7 (Multi-page routing)
├─ Context API (Watchlist state + optimistic updates)
├─ Recharts (Price/sentiment charts)
├─ Tailwind CSS 4 (Styling + responsiveness)
└─ Vitest + RTL (Unit/component testing)
```

---

## ⚙️ Backend Architecture (Express API)

### What the backend does:

1. **Validates** incoming requests (symbol format, session ID, etc.)
2. **Fetches** from external APIs (Alpha Vantage, NewsAPI, Gemini)
3. **Composes** data into unified payloads
4. **Caches** results in MongoDB to reduce API calls
5. **Falls back gracefully** if external services fail

---

## 📡 API Endpoints (What Gets Called)

### Stock endpoints

```http
GET /api/stocks/market/overview
→ Returns top 5 stocks with cached data

GET /api/stocks/:symbol
→ Returns full stock analysis (fundamentals, price, news, sentiment, recommendation)

GET /api/stocks/:symbol/history?range=7d|30d|90d
→ Returns historical price data for charting
```

### Opinion (AI Recommendation) endpoint

```http
GET /api/opinion/:symbol
→ Returns AI recommendation: BUY, HOLD, or SELL with explanation
```

### Watchlist endpoints

```http
GET /api/watchlist/:sessionId
→ Returns list of symbols + full stock data

POST /api/watchlist/:sessionId/add
Body: { "symbol": "AAPL" }
→ Adds stock to watchlist (max 20)

DELETE /api/watchlist/:sessionId/:symbol
→ Removes stock from watchlist
```

---

## 🔄 How Data Flows Through the System

### Flow 1: User searches for a stock (Stock Detail Page)

```
1. User types "AAPL" in search bar
   ↓
2. React Router navigates to /stock/AAPL
   ↓
3. StockDetail component mounts, calls getStockDetails("AAPL")
   ↓
4. Frontend sends TWO parallel requests:
   └─→ GET /api/stocks/AAPL
   └─→ GET /api/opinion/AAPL
   ↓
5. Backend receives /api/stocks/AAPL:
   ├─ Check MongoDB cache (is it fresh?)
   ├─ If YES → return cached data
   ├─ If NO → fetch from external APIs:
   │   ├─ Alpha Vantage for fundamentals + prices
   │   ├─ NewsAPI for 5 latest headlines
   │   └─ For each headline, call Gemini to classify sentiment
   ├─ Aggregate sentiment score (-1 to +1)
   └─ Save to MongoDB (cache) and return
   ↓
6. Backend receives /api/opinion/AAPL:
   ├─ Analyze fundamentals + sentiment
   └─ Call Gemini to generate BUY/HOLD/SELL recommendation
   ↓
7. Frontend receives both payloads:
   ├─ Render fundamentals in cards
   ├─ Render enhanced price chart (with vol bars, time range selector)
   ├─ Render sentiment gauge (SVG dial showing -1 to +1)
   ├─ Render AI recommendation (styled with color: green=BUY, yellow=HOLD, red=SELL)
   └─ Render news feed with sentiment badges
```

### Flow 2: User adds stock to watchlist

```
1. User clicks ★ star on a stock card
   ↓
2. useWatchlist().addStock("AAPL") is called
   ↓
3. UI updates OPTIMISTICALLY (star immediately fills yellow)
   ↓
4. POST /api/watchlist/:sessionId/add sent to backend
   ├─ Backend validates sessionId format
   ├─ Checks if stock already in list
   ├─ Ensures list doesn't exceed 20 symbols
   └─ Saves to MongoDB
   ↓
5. Response received:
   ├─ If SUCCESS → keep optimistic update
   └─ If FAILED → revert star to empty ☆ and fetch fresh watchlist
```

### Flow 3: Market overview loads

```
1. User visits home page /
   ↓
2. Home component calls GET /api/stocks/market/overview
   ↓
3. Backend loops SEQUENTIALLY over [AAPL, GOOGL, MSFT, AMZN, TSLA]:
   ├─ 1.5 second delay between calls (respect API rate limits)
   ├─ Check MongoDB cache first
   ├─ If stale, fetch fresh data with delays
   └─ Compose lightweight response (symbol, price, sentiment, %change)
   ↓
4. Frontend receives 5 stock summaries
   ↓
5. Render grid of StockSummaryCard components
   └─ Each card shows: symbol, name, price, %change, mini sparkline, sentiment
```

---

## 📹 Deep Dive Videos (Space for attachments)

### Video 1: Frontend walkthrough

**[INSERT VIDEO: Tour of React pages and components]**

*Topics covered:*
- How React Router navigates between pages
- StockDetail page and all its sections
- EnhancedPriceChart interaction (time range selector)
- SentimentGauge component rendering
- Watchlist context managing add/remove state

---

### Video 2: Backend data flow

**[INSERT VIDEO: API calls and database interactions]**

*Topics covered:*
- getStock() fetching from Alpha Vantage + NewsAPI
- Gemini sentiment classification logic
- MongoDB caching strategy
- Error handling and fallback behavior
- Rate limiting and CORS security

---

### Video 3: Stock comparison workflow

**[INSERT VIDEO: Comparing two stocks]**

*Topics covered:*
- How Compare page fetches both stocks in parallel
- Color-coded metric comparison (green = better)
- Side-by-side chart rendering
- Query param syncing with URL

---

## 🔑 Environment Variables and API Keys

### What each key is used for:

| Key | Required | Purpose | Source |
|---|---|---|---|
| **MONGO_URI** | YES | MongoDB Atlas connection string | https://cloud.mongodb.com |
| **GEMINI_API_KEY** | YES | Google Gemini AI for sentiment/recommendations | https://aistudio.google.com/app/apikey |
| **ALPHA_VANTAGE_API_KEY** | Recommended | Stock prices, fundamentals, historical data | https://www.alphavantage.co/support/#api-key |
| **NEWSAPI_KEY** | Recommended | Latest financial news headlines | https://newsapi.org/register |
| **COHERE_API_KEY** | Optional | Reserved for future AI model strategy | https://dashboard.cohere.com/api-keys |
| **PORT** | No | Server port (default 5000) | Custom |
| **CORS_ORIGINS** | No | Allowed frontend origins | Custom |

### Example .env file (with safe placeholders):

```env
# Database
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# External APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
NEWSAPI_KEY=your_newsapi_key_here
GEMINI_API_KEY=your_gemini_api_key_here
COHERE_API_KEY=your_cohere_api_key_here

# CORS (optional)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

⚠️ **Critical Security Notes:**
- Never commit .env with real keys
- Rotate immediately if leaked
- Use per-environment keys (dev/prod) with restricted quotas
- Keep .env.example with only placeholders

---

## 🚀 Getting Started

### 1) Clone and install

```bash
git clone https://github.com/MarmikKaila/AI_Stock_Market_and_Sentiment_Dashboard.git
cd AI_StockMarketSummary_SentimentDashbord

# Backend
cd server && npm install
cd ../client && npm install
```

### 2) Set up environment

```bash
cd server
cp .env.example .env
# Edit .env with your API keys and MongoDB URI
```

### 3) Start backend

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### 4) Start frontend (new terminal)

```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### 5) Open in browser

👉 **http://localhost:5173**

---

## 📊 Tech Stack (Complete Reference)

### Frontend
- **React 19** — Component framework
- **Vite 7** — Build tool and dev server
- **React Router 7** — URL-based multi-page navigation
- **Recharts** — Data visualization for charts
- **Tailwind CSS 4** — Utility-first styling
- **Vitest** — Unit/component test runner
- **React Testing Library** — Component testing utilities

### Backend
- **Node.js** — JavaScript runtime
- **Express 4** — HTTP server and routing framework
- **Mongoose 8** — MongoDB object modeling
- **MongoDB Atlas** — Cloud database
- **Axios** — HTTP client for external APIs
- **helmet** — Security headers middleware
- **express-validator** — Input validation at route level
- **express-rate-limit** — Abuse prevention via request throttling
- **Jest 30** — Server-side unit testing
- **Supertest** — HTTP assertion library for API testing

### External APIs
- **Alpha Vantage** — Stock prices, fundamentals, historical data
- **NewsAPI** — Financial news headlines
- **Google Gemini** — AI-powered sentiment analysis and recommendations

---

## 🧪 Running Tests

### Backend tests

```bash
cd server
npm test              # Run all tests once
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### Frontend tests

```bash
cd client
npm test              # Run all tests once
npm run test:coverage # Coverage report
```

---

## 🛡️ Security Features

This project includes production-grade security hardening:

✅ **Helmet** — HTTP security headers (XSS, clickjacking, etc.)  
✅ **CORS** — Strict origin allow-list with explicit methods (GET, POST, DELETE)  
✅ **Rate Limiting** — Global limit (100 req/15min) + AI endpoint limit (20 req/15min)  
✅ **Input Validation** — express-validator at every route boundary  
✅ **Body Size Limits** — 10KB max JSON/urlencoded to prevent abuse  
✅ **Environment Validation** — Fail-fast on missing required config  

---

## 📚 How Everything Works (Architecture Deep Dive)

### Startup sequence (what happens when server.js runs):

```
1. Load environment variables from .env
2. Validate required vars (MONGO_URI, GEMINI_API_KEY)
3. Attempt MongoDB connection; log success/failure
4. Register security middleware (helmet, CORS, rate-limit)
5. Register request parsing middleware (json, urlencoded)
6. Mount API route handlers
7. Start listening on PORT
```

### Stock fetch pipeline (when /api/stocks/:symbol is called):

```
1. Validate symbol format (letters only, 1-5 length)
2. Check MongoDB cache:
   ├─ If EXISTS and age < 30min → return cached data
   └─ If MISSING or STALE → proceed to step 3
3. Fetch fundamentals from Alpha Vantage OVERVIEW endpoint
4. Wait 1.5 seconds (respect rate limits)
5. Fetch price history from Alpha Vantage TIME_SERIES_DAILY endpoint
6. Wait 1.5 seconds
7. Fetch news from NewsAPI for this company/symbol
8. For each headline:
   ├─ Send to Gemini to classify: Positive, Negative, or Neutral
   └─ Collect responses
9. Compute average sentiment score (range -1 to +1)
10. Compile response object with:
    ├─ Fundamentals (P/E, P/B, EPS, Market Cap)
    ├─ Price + price history
    ├─ News list with individual sentiment tags
    ├─ Aggregated sentiment score
    └─ Metadata (isMocked, lastFetchedAt)
11. Save to MongoDB cache
12. Return JSON to frontend
```

### Gemini model selection logic:

```
First request to Gemini:
├─ Try gemini-2.0-flash (newest)
├─ Try gemini-2.0-flash-lite
├─ Try gemini-1.5-flash (stable)
└─ Try gemini-1.5-pro (fallback)

If all fail:
└─ Use keyword-based sentiment fallback
    └─ Count positive/negative words in headline
    └─ Return Positive, Negative, or Neutral
```

### Watchlist sync pattern (optimistic updates):

```
User clicks ★ to add stock:
1. Frontend instantly fills star (yellow) — OPTIMISTIC
2. Frontend sends POST to backend
3. Backend processes add request
4. If SUCCESS:
   └─ Keep UI in optimistic state ✅
5. If FAILURE (e.g., limit reached):
   └─ Revert star to empty ☆
   └─ Fetch fresh watchlist from server to restore truth state
```

---

## 📈 Performance and Caching

- **Market overview** caches for 30 minutes to reduce API calls
- **Stock details** cached per symbol with freshness check
- **Watchlist** loads instantly from MongoDB
- **Price history** supports 7d, 30d, 90d queries (via time range reducer)
- **Rate limiting** protects paid-tier APIs from runaway requests

---

## 🔧 Troubleshooting

### Gemini quota exceeded
→ Free tier exhausted. Wait 24h or get new API key from https://aistudio.google.com

### MongoDB connection fails
→ Check MONGO_URI in .env. Verify IP whitelist in MongoDB Atlas.

### Alpha Vantage returns "API limit reached"
→ Free tier: 5 calls/minute. Pro plan: 500/minute. Add delays or upgrade.

### CORS error when adding to watchlist
→ This was a bug (DELETE method not allowed). Already fixed in server.js.

---

## 🎓 Learning outcomes from this project

- Full-stack JavaScript (React + Node.js)
- API design and REST principles
- Database modeling (relational vs document-based)
- External API integration and error handling
- Security hardening (helmet, CORS, validation, rate limiting)
- Caching strategies and cache invalidation
- Testing strategy (unit + integration + API)
- Optimistic UI patterns for better UX
- Production-grade error handling and fallbacks

---

## 📚 Complete Folder Tree

```text
AI_StockMarketSummary_SentimentDashbord/
├─ README.md                              # This file
├─ package.json                           # Workspace root
├─ theory.txt
├─
├─ client/                                # Frontend (React + Vite)
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
│
└─ server/                                # Backend (Node + Express)
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

---

## 🌟 Future Roadmap

- [ ] Authenticated users + account-scoped watchlists
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Redis caching tier for sub-second responses
- [ ] Route-level code splitting + bundle budgets
- [ ] Real-time WebSocket price updates
- [ ] Portfolio tracking + P&L calculations
- [ ] Email alerts on watchlist changes

---

## 👤 Author

**Marmik Kaila**

- 🔗 GitHub: https://github.com/MarmikKaila
- 💼 LinkedIn: https://www.linkedin.com/in/marmik-kaila-748bab28a/

---

## ⭐ Support

If you found this project helpful, please consider giving it a **star** on GitHub! It helps others discover and learn from this codebase.

---

**Last updated:** March 2026  
**License:** ISC
