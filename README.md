# 📊 AI Stock Market and Sentiment Dashboard

> A **production-grade full-stack fintech application** that delivers real-time stock analysis, AI-powered sentiment evaluation, and intelligent buy/sell/hold recommendations powered by Google Gemini.

**Repository:** https://github.com/MarmikKaila/AI_Stock_Market_and_Sentiment_Dashboard.git

**Status:** ✅ **Production-Ready** | **All features tested and working**

---

## 🎯 What Problem Does This Solve?

Investors today face an overload of market data without intelligent contextualization. This makes confident investment decisions difficult.

**This dashboard solves it by:**
- ✅ **Real-time stock fundamentals** from Alpha Vantage (P/E, Market Cap, EPS)
- ✅ **Live market sentiment** analysis from news via NewsAPI
- ✅ **AI-powered recommendations** using Google Gemini (BUY/HOLD/SELL)
- ✅ **Smart caching** to minimize API calls and operational costs
- ✅ **Persistent watchlist** for personalized tracking
- ✅ **Side-by-side comparisons** for informed decision-making
- ✅ **Multiple deployment options:** Local, Vercel (Serverless), AWS Lambda

---

## 📹 Product Walkthrough

[▶️ **WATCH DEMO VIDEO**](https://drive.google.com/file/d/13IK9walcuvg2VHGvFdtoI_qaeRcHtXdw/view?usp=sharing)

**In this video, watch:**
- 🏠 Market overview page (top 5 stocks with live sentiment)
- 📈 Stock detail page (fundamentals + AI sentiment analysis + recommendations)
- ⭐ Watchlist management (add/remove stocks persistently)
- 🔄 Side-by-side stock comparison
- 📊 Enhanced price charts with 7d/30d/90d time selectors

---

## 🏗️ System Architecture

### Complete Data Float Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER (React 19 + Vite)                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Pages: Home, StockDetail, Watchlist, Compare, NotFound             │    │
│  │ Components: Navbar, StockCard, SentimentGauge, EnhancedChart       │    │
│  │ State: WatchlistContext (Optimistic Updates), Local Cache           │    │
│  │ Styling: Tailwind CSS 4, ApexCharts, Recharts                      │    │
│  └──────────────────────────────┬──────────────────────────────────────┘    │
│                                  │ HTTP/JSON (XMLHttpRequest/fetch)         │
│                                  │ HTTPS in production                       │
│                                  ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                   DEPLOYMENT OPTIONS (Choose One)                     │   │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │   │
│  │  │  OPTION 1       │  │  OPTION 2        │  │  OPTION 3         │  │   │
│  │  │  LOCAL DEV      │  │  VERCEL          │  │  AWS LAMBDA       │  │   │
│  │  │                 │  │                  │  │                   │  │   │
│  │  │  http://localhost  │  Auto-deployed │  │  CloudFront CDN   │  │   │
│  │  │  :5000/5173     │  │  from `/api`     │  │  → API Gateway    │  │   │
│  │  │                 │  │  folder          │  │  → Lambda         │  │   │
│  │  └─────────────────┘  └──────────────────┘  └───────────────────┘  │   │
│  │                                                                      │   │
│  │  ↓↓↓ All routes below ↓↓↓                                           │   │
└──────────────────────────────────────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴──────────────────────────┐
         ▼                                                    ▼
  ┌────────────────────────────┐            ┌──────────────────────────┐
  │ EXPRESS.JS BACKEND         │            │   AWS MANAGED SERVICES   │
  │ (Node.js 18+)              │            │   (Optional Deployment)  │
  │                            │            │                          │
  │ Routes:                    │            │ - RDS PostgreSQL/MySQL   │
  │ • GET /api/stocks/...      │            │ - CloudWatch Monitoring  │
  │ • GET /api/opinion/...     │            │ - Secrets Manager        │
  │ • GET /api/watchlist/...   │            │ - S3 Static Assets       │
  │ • POST /api/watchlist/...  │            │ - CloudFront CDN         │
  │ • DELETE /api/watchlist/..│            │                          │
  │                            │            │                          │
  │ Services:                  │            │                          │
  │ • stockService.js          │            │                          │
  │ • aiService.js             │            │                          │
  │ • newsService.js           │            │                          │
  │                            │            │                          │
  │ Middleware:                │            │                          │
  │ • helmet (security)        │            │                          │
  │ • cors (cross-origin)      │            │                          │
  │ • rate-limit (abuse)       │            │                          │
  │ • express-validator        │            │                          │
  └────────────┬───────────────┘            └──────────────────────────┘
               │
    ┌──────────┴──────┬───────────────┬──────────────────┐
    ▼                 ▼               ▼                  ▼
┌─────────────┐  ┌──────────────┐ ┌─────────────┐  ┌──────────────┐
│  MONGODB    │  │ ALPHA        │ │  NEWSAPI    │  │   GEMINI     │
│  ATLAS      │  │  VANTAGE     │ │             │  │   API 2.0    │
│             │  │              │ │             │  │              │
│ • Stock     │  │ • Real-time  │ │ • Latest    │  │ • Sentiment  │
│ • Watchlist │  │   prices     │ │   headlines │  │   analysis   │
│ • Cache     │  │ • P/E Ratio  │ │ • Company   │  │ • AI         │
│ • Session   │  │ • Market Cap │ │   news      │  │   recommend  │
│   data      │  │ • EPS, etc   │ │ • Sources   │  │   -ations    │
│             │  │              │ │             │  │   (B/H/S)    │
└─────────────┘  └──────────────┘ └─────────────┘  └──────────────┘

Free tier APIs:                Premium features available:
• 5 calls/min limit           • Unlimited with upgrade
• Rate limit handled          • Reduced latency
• Graceful degradation        • Priority support
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

## 🚀 Getting Started (3 Deployment Options)

### Option A: Local Development (Recommended for setup)

#### 1. Prerequisites

```bash
# Install Node.js 18+
# Download from: https://nodejs.org
# Verify: node --version

# Install Git
# Download from: https://git-scm.com

# Create MongoDB Atlas account (free tier)
# Visit: https://www.mongodb.com/cloud/atlas
# Create free cluster (M0, no credit card)
```

#### 2. Clone repository

```bash
git clone https://github.com/MarmikKaila/AI_Stock_Market_and_Sentiment_Dashboard.git
cd AI_StockMarketSummary_SentimentDashbord
```

#### 3. Setup API Keys

```bash
# Get these free keys:

# 1. Alpha Vantage (free tier: 5 calls/min, 500/day)
#    Visit: https://www.alphavantage.co/support/#api-key
#    No credit card needed

# 2. NewsAPI (free tier: 100 calls/day)
#    Visit: https://newsapi.org/register
#    Free account: news-only, no paid features

# 3. Google Gemini 2.0 (free tier: unlimited, rate-limited)
#    Visit: https://aistudio.google.com/app/apikey
#    Generate API key, no credit card

# 4. MongoDB Atlas connection string
#    Create cluster, get connection: mongodb+srv://user:pass@cluster.mongodb.net/
```

#### 4. Install backend

```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Edit .env with your API keys
# Linux/Mac: nano .env
# Windows PowerShell: notepad .env
#
# Required:
# MONGO_URI=mongodb+srv://...
# GEMINI_API_KEY=your_key_here
# ALPHA_VANTAGE_API_KEY=your_key_here
# NEWSAPI_KEY=your_key_here
```

#### 5. Install frontend

```bash
cd ../client
npm install
```

#### 6. Start backend

```bash
cd ../server
npm run dev
# Server runs at http://localhost:5000
# Look for: "Server running on port 5000"
# MongoDB connected successfully
```

#### 7. Start frontend (new terminal)

```bash
cd ../client
npm run dev
# Frontend runs at http://localhost:5173
# Vite dev server with HMR enabled
```

#### 8. Open in browser

👉 **http://localhost:5173**

**You should see:**
- ✅ Home page with top 5 stocks
- ✅ Click stock → see details + sentiment + AI recommendation
- ✅ Add to watchlist → persists in MongoDB
- ✅ Compare page → side-by-side analysis

---

### Option B: Vercel Deployment (Serverless)

Vercel auto-detects the `/api` folder and deploys it as serverless functions.

#### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Connect to Vercel

```bash
# Option 1: Via Vercel CLI
npm i -g vercel
vercel

# Option 2: Via Vercel Dashboard
# Visit: https://vercel.com
# Login with GitHub
# Click "New Project"
# Select your repo
# Deploy
```

#### 3. Set environment variables on Vercel

```
Dashboard → Settings → Environment Variables

MONGO_URI = mongodb+srv://...
GEMINI_API_KEY = your_key_here
ALPHA_VANTAGE_API_KEY = your_key_here
NEWSAPI_KEY = your_key_here
CORS_ORIGINS = https://yourdomain.vercel.app
```

#### 4. Deploy

```bash
# Automatic: Push to main branch
git push origin main
# Vercel auto-deploys

# Manual: Via CLI
vercel --prod
```

**Result:**
- Frontend: `https://yourproject.vercel.app`
- Backend API: Serverless functions (auto-scaled)
- **Cost:** $0 (within free tier)

---

### Option C: AWS Deployment (Enterprise)

Deploy to AWS Lambda + API Gateway + RDS.

#### 1. Install AWS CLI & Terraform

```bash
# Windows with Chocolatey:
choco install awscli terraform nodejs

# Or download manually from:
# https://aws.amazon.com/cli
# https://www.terraform.io/downloads
```

#### 2. Configure AWS credentials

```bash
aws configure
# AWS Access Key ID: [from IAM console]
# AWS Secret Access Key: [from IAM console]
# Default region: us-east-1
# Default output: json

# Verify:
aws sts get-caller-identity
```

#### 3. Initialize Terraform

```bash
cd aws/terraform

# Create terraform.tfvars file (customize for your environment)
cat > terraform.tfvars << EOF
aws_region  = "us-east-1"
app_name    = "stock-dashboard"
environment = "prod"
lambda_timeout = 30
lambda_memory = 256
EOF

# Initialize Terraform
terraform init
```

#### 4. Plan infrastructure

```bash
terraform plan -out=tfplan
# Review what will be created
```

#### 5. Deploy infrastructure

```bash
terraform apply tfplan
# Terraform creates:
# - Lambda functions (8 microservices)
# - API Gateway (REST endpoint)
# - RDS database (PostgreSQL/MySQL)
# - S3 bucket (assets)
# - CloudFront distribution (CDN)
# - IAM roles + security groups
# - CloudWatch monitoring
# - Secrets Manager (API keys)

# Wait 5-10 minutes for all resources to be created
```

#### 6. Get API endpoint

```bash
terraform output
# Shows:
# api_gateway_url = "https://abc123.execute-api.us-east-1.amazonaws.com"
```

#### 7. Deploy frontend to S3 + CloudFront

```bash
cd ../../client
npm run build
# Creates dist/ folder

cd dist
aws s3 sync . s3://your-bucket-name/
# Website now live at CloudFront domain
```

**Result:**
- Frontend: CloudFront CDN (global edge locations)
- Backend: Lambda (auto-scales)
- Database: RDS (managed)
- **Cost:** ~$1-2/month (all within AWS free tier!)

**See detailed guide:** Check [aws/DEPLOYMENT.md](aws/DEPLOYMENT.md)

---

## 📊 Tech Stack (Complete Reference)

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.1.0 | Component framework |
| React Router | 7.13.1 | URL routing + navigation |
| Vite | 7.0.4 | Build tool + dev server (HMR) |
| Recharts | 3.2.1 | Data visualization (charts) |
| ApexCharts | 5.3.5 | Advanced charting (gauges, sparklines) |
| Tailwind CSS | 4.1.11 | Utility-first styling (80+ responsive) |
| Vitest | 4.0.18 | Unit test runner (Vite-native) |
| @testing-library/react | 16.3.2 | Component testing utilities |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| Node.js | 18.x | JavaScript runtime |
| Express | 4.19.2 | HTTP server + routing |
| Mongoose | 8.4.1 | MongoDB object modeling |
| MongoDB Driver | 6.20.0 | Direct DB access |
| Axios | 1.7.2 | HTTP client for external APIs |
| Helmet | 8.1.0 | Security headers |
| express-validator | 7.3.1 | Input validation |
| express-rate-limit | 8.3.1 | Abuse prevention |
| dotenv | 16.4.5 | Environment variable loader |
| Jest | 30.2.0 | Test runner |
| Supertest | 7.2.2 | HTTP assertion library |
| Nodemon | 3.1.3 | Auto-restart on file changes |

### External APIs

| Service | Tier | Rate Limit | Cost |
|---------|------|-----------|------|
| Alpha Vantage | Free | 5 calls/min, 500/day | $0 |
| NewsAPI | Free | 100 requests/day | $0 |
| Google Gemini 2.0 | Free | Rate-limited (~100/min) | $0 |
| MongoDB Atlas | M0 | 512MB storage, unlimited reads | $0 |

### Infrastructure (AWS or Vercel)

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Lambda | Compute (serverless) | 1M requests/month |
| API Gateway | REST endpoint | 1M requests/month |
| RDS | Database | 750 hours/month, db.t3.micro |
| S3 | Asset storage | 5GB/month |
| CloudFront | CDN | 50GB/month egress |
| Secrets Manager | API key management | $0.40/secret/month |
| CloudWatch | Monitoring | Minimal ($0-0.50) |

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

---

## 🏗️ AWS Infrastructure Architecture (Optional, Fully Documented)

```
AWS Deployment Stack (Terraform IaC):

┌─────────────────────────────────────────────────────────────────┐
│                        CLOUDFRONT CDN                            │
│  (Global edge locations, 50GB/month free tier)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
            ┌────────────────────────────┐
            │   API GATEWAY              │
            │ (1M requests/month free)   │
            │                            │
            │ • /api/stocks              │
            │ • /api/opinion             │
            │ • /api/watchlist           │
            └────────────┬───────────────┘
                         │
      ┌──────────────────┼──────────────────┐
      ▼                  ▼                  ▼
  ┌────────┐         ┌────────┐        ┌────────┐
  │ Lambda │         │ Lambda │        │ Lambda │
  │ 1               │ 2               │ 3      │
  │                  │                  │ 
  │ get-stock.js     │ opinion.js      │ watchlist.js
  │ (128MB RAM)      │ (256MB RAM)     │ (256MB RAM)
  │                  │                  │
  │ ~$0/month        │                  │
  │ (1M calls free)  │                  │
  └────────┬─────────┘                  ▼
           │                      ┌──────────────┐
           │                      │  RDS        │
           │                      │  db.t3.micro│
           │                      │              │
           └─────────────┬────────┤              │
                         │        │  ~$0/month   │
                         ▼        │  (750 hrs)   │
                    ┌─────────┐   │              │
                    │ Secrets │   │  Backup &    │
                    │ Manager │   │  Multi-AZ    │
                    │         │   │  support     │
                    │ ~$0.40  │   └──────────────┘
                    │ /month  │
                    │ (2 keys)│
                    └─────────┘

Total monthly cost: ~$1-2 (all within FREE TIER!)

AWS Services Used:
├─ Lambda (Compute) — Serverless functions, auto-scaling
├─ API Gateway — REST API management, routing
├─ RDS — Managed relational database
├─ S3 — Static asset storage
├─ CloudFront — Content delivery network (CDN)
├─ CloudWatch — Application monitoring & logs
├─ Secrets Manager — API key & credential storage
└─ IAM — Access control & permissions

Benefits:
✅ No server management
✅ Auto-scales with traffic
✅ Pay only for what you use
✅ Global distribution via CloudFront
✅ Managed database backups
✅ Built-in monitoring & alerting
✅ 99.99% uptime SLA
```

**See complete AWS setup guide:** [aws/DEPLOYMENT.md](aws/DEPLOYMENT.md)

---

## 🔐 Security & Hardening Features

This project includes **production-grade security hardening:**

### 1. HTTP Security Headers (Helmet)

```javascript
// Prevents:
app.use(helmet());
// - XSS (Cross-Site Scripting)
// - Clickjacking
// - Content sniffing
// - MIME type sniffing
// - Strict-Transport-Security (HTTPS enforcement)
```

### 2. CORS Restrictions

```javascript
// Strict origin allow-list
const allowedOrigins = ['https://yourdomain.com', 'https://app.yourdomain.com'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
```

### 3. Rate Limiting

```javascript
// Global rate limit: 100 requests per 15 minutes per IP
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests
  standardHeaders: true,
  legacyHeaders: false
}));

// AI endpoint limit: 20 requests per 15 minutes (more expensive)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});
app.use('/api/opinion', aiLimiter);
```

### 4. Input Validation

```javascript
// Express-validator at every route boundary
router.get('/:symbol', [
  param('symbol')
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]{1,5}$/)  // 1-5 uppercase letters only
    .withMessage('Invalid stock symbol format')
], controller.getStock);
```

### 5. Environment Validation

```javascript
// Fail-fast on missing required config
const requiredEnvVars = [
  'MONGO_URI',
  'GEMINI_API_KEY',
  'ALPHA_VANTAGE_API_KEY',
  'NEWSAPI_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required env var: ${varName}`);
  }
});
```

### 6. Body Size Limits

```javascript
// Prevent DoS attacks via large payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb' }));
```

### 7. MongoDB Injection Prevention

```javascript
// Mongoose auto-escapes queries
// ✅ SAFE: Mongoose validates/sanitizes
const stock = await Stock.findOne({ symbol: userInput });

// API/Key rotation recommendations
// - Rotate Alpha Vantage key every 90 days
// - Rotate Gemini API key every 90 days
// - Use separate keys for dev/prod
// - Store in AWS Secrets Manager (production)
```

---

## 📡 API Endpoints (Complete Reference)

### Stock Endpoints

```http
GET /api/stocks/market/overview
Description: Get top 5 stocks with lightweight data
Response:
[
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 150.75,
    changePercent: +2.5,
    sentiment: 0.65,
    isMocked: false
  },
  ...
]

GET /api/stocks/:symbol
Description: Get full stock analysis
Response:
{
  symbol: "AAPL",
  name: "Apple Inc.",
  fundamentals: {
    pe: 28.5,
    pb: 45.2,
    eps: 6.05,
    marketCap: "2.8T",
    yield: "0.46%"
  },
  price: 150.75,
  sentiment: 0.65,
  news: [
    {
      headline: "Apple announces new AI features",
      source: "Bloomberg",
      sentiment: "Positive",
      link: "https://..."
    },
    ...
  ],
  isMocked: false,
  lastFetchedAt: "2024-01-15T10:30:00Z"
}

GET /api/stocks/:symbol/history?range=7d|30d|90d
Description: Get price history for charting
Response:
[
  {
    date: "2024-01-15",
    open: 148.2,
    high: 151.8,
    low: 147.5,
    close: 150.75,
    volume: 52000000
  },
  ...
]
```

### AI Opinion Endpoint

```http
GET /api/opinion/:symbol
Description: Get AI-generated BUY/HOLD/SELL recommendation
Response:
{
  recommendation: "BUY" | "HOLD" | "SELL",
  confidence: 0.85 (0-1 scale),
  reasoning: "Strong positive sentiment combined with solid P/E ratio...",
  model: "gemini-2.0-flash"
}
```

### Watchlist Endpoints

```http
GET /api/watchlist/:sessionId
Description: Get user's watched stocks (with full data)
Response:
{
  sessionId: "xyz-abc-123",
  symbols: ["AAPL", "GOOGL"],
  stocks: [
    { symbol: "AAPL", price: 150.75, sentiment: 0.65, ... },
    { symbol: "GOOGL", price: 140.2, sentiment: 0.58, ... }
  ]
}

POST /api/watchlist/:sessionId/add
Description: Add stock to watchlist
Body: { symbol: "AAPL" }
Response:
{
  success: true,
  symbols: ["AAPL", "GOOGL", "MSFT"],
  message: "AAPL added to watchlist"
}

DELETE /api/watchlist/:sessionId/:symbol
Description: Remove stock from watchlist
Response:
{
  success: true,
  symbols: ["GOOGL", "MSFT"],
  message: "AAPL removed from watchlist"
}
```

---

## 🔄 Complete Data Flow Examples (Deep Dive)

### Example 1: User searches for stock "AAPL"

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                           │
│ 1. Clicks search bar on dashboard                               │
│ 2. Types "AAPL"                                                 │
│ 3. Presses Enter or clicks "Search"                             │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                            │
│ 4. navigate(`/stock/AAPL`) via React Router                     │
│ 5. StockDetail component mounts                                 │
│ 6. useEffect() triggers: getStockDetails("AAPL")                │
│ 7. Show loading spinner                                         │
│ 8. Send 2 parallel requests:                                    │
│    - GET /api/stocks/AAPL                                       │
│    - GET /api/opinion/AAPL                                      │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                            │
│ 9. Receive GET /api/stocks/AAPL                                 │
│ 10. stockController validates symbol: "AAPL" ✓                  │
│ 11. Check MongoDB cache:                                        │
│     - Query: db.stocks.findOne({ symbol: "AAPL" })             │
│     - If FOUND and fresh (< 30min old):                         │
│       └─ SKIP external APIs, return cached data                │
│     - If NOT FOUND or stale (> 30min):                         │
│       └─ Proceed to step 12                                     │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL API CALLS (Orchestrated)                  │
│ 12. Call Alpha Vantage OVERVIEW endpoint                        │
│     ├─ Response: { pe: 28.5, pb: 45.2, eps: 6.05, ... }       │
│     └─ Wait 1.5 seconds (rate limit)                            │
│ 13. Call Alpha Vantage TIME_SERIES_DAILY endpoint              │
│     ├─ Response: [ { date, open, high, low, close }, ... ]    │
│     └─ Wait 1.5 seconds                                         │
│ 14. Call NewsAPI for AAPL                                       │
│     ├─ Response: [ { title, source, link, content }, ... ]    │
│     └─ For each headline, call Gemini (async):                 │
│        - Send headline text to Gemini                          │
│        - Gemini responds: "Positive" | "Negative" | "Neutral"  │
│        - Assign score: Positive=+1, Neutral=0, Negative=-1    │
│ 15. Compute aggregated sentiment:                               │
│     ├─ Average all sentiment scores                             │
│     ├─ Final sentiment: 0.65 (example)                          │
│ 16. Compile response object                                     │
│ 17. Save to MongoDB cache:                                      │
│     └─ db.stocks.updateOne({ symbol: "AAPL" }, {...})         │
│ 18. Return JSON to frontend                                     │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React) - Part 2                    │
│ 19. Receive response, hide loading spinner                      │
│ 20. Render Stock Detail page with:                              │
│     ├─ Fundamentals card                                        │
│     ├─ Enhanced price chart                                     │
│     ├─ Sentiment gauge                                          │
│     ├─ News feed with sentiment badges                          │
│     ├─ Watchlist star                                           │
│     └─ AI Recommendation                                        │
│ 21. Content displayed, user can interact                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Performance & Caching Strategy

### MongoDB Caching

```javascript
// Stock data cached for 30 minutes
const stock = {
  symbol: "AAPL",
  ...data,
  cachedAt: new Date(),
  // TTL index: auto-delete after 30 minutes
};

// Watchlist cached for 24 hours
const watchlist = {
  sessionId: "xyz-123",
  symbols: [...],
  // TTL index: auto-delete after 24 hours
};
```

### Rate Limiting

```
Global API: 100 requests per 15 minutes
AI endpoint: 20 requests per 15 minutes (expensive Gemini calls)
```

### Response Times (Typical)

```
Market overview:  ~1-2 seconds (cached most of the time)
Stock detail:     ~3-5 seconds (parallel API calls)
Watchlist load:   ~0.5 seconds (MongoDB only)
Compare page:     ~5-8 seconds (two stocks fetched parallel)
```

---

## 🔧 Troubleshooting

### Backend won't start: "MONGO_URI not found"

```bash
# Fix: Add .env file in server/ folder
cd server
cp .env.example .env
# Edit .env and fill in MONGO_URI
```

### "API limit reached" (Alpha Vantage)

```
Free tier limit: 5 calls/minute, 500 calls/day
Solution:
1. Wait 1 minute for rate limit to reset
2. Upgrade to Pro tier ($20/month for 500/min)
3. Or add delay between calls (already implemented)
```

### "Gemini quota exceeded"

```
Free tier: ~100 calls/minute (rate-limited)
Solution:
1. Wait 24 hours for quota to reset
2. Generate new API key: https://aistudio.google.com/app/apikey
3. Update GEMINI_API_KEY in .env
```

### MongoDB connection fails

```bash
# Check connection string format
mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Common issues:
1. Whitelist IP in MongoDB Atlas (Security > Network Access)
   - Add your IP address
   - Or add 0.0.0.0/0 (allow all, not recommended)
2. Wrong password in connection string
3. Database user has no read/write permissions
```

### CORS error on watchlist operations

```
Error: "Access to XMLHttpRequest blocked by CORS policy"
Solution: Check CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
(No trailing slashes)
```

### Frontend takes too long to load

```
1. Check network tab (DevTools → Network)
2. Disable browser cache and reload
3. Check backend is running: curl http://localhost:5000
4. Check MongoDB is connected (look for console logs)
5. Reduce page size with time range selector (7d instead of 90d)
```

---

## 🌍 Environment Variables Quick Reference

### Required in all deployments

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/stock-dashboard
GEMINI_API_KEY=AIza...
ALPHA_VANTAGE_API_KEY=demo
NEWSAPI_KEY=abc123...
```

### Optional (defaults to localhost)

```env
PORT=5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
NODE_ENV=development|production
```

### AWS-specific

```env
AWS_REGION=us-east-1
AWS_LAMBDA_FUNCTION_NAME=stock-dashboard
RDS_ENDPOINT=db-instance.us-east-1.rds.amazonaws.com
RDS_PORT=5432
```

---

## 📚 Additional Documentation

- **[aws/DEPLOYMENT.md](aws/DEPLOYMENT.md)** — Complete AWS setup guide
- **[aws/FREE_TIER_OPTIMIZATION.md](aws/FREE_TIER_OPTIMIZATION.md)** — Cost-saving tips
- **[lld.md](lld.md)** — Low-level design details

---

## 🤝 Contributing

This project is designed as a portfolio/learning project. Feel free to:
- Fork and customize for your needs
- Submit PRs for bug fixes
- Suggest improvements via Issues

---

## ⭐ Support & Stars

If you found this project helpful, please consider giving it a **star** on GitHub! It helps others discover this resource and is greatly appreciated. 🙌

**Star the repo:** https://github.com/MarmikKaila/AI_Stock_Market_and_Sentiment_Dashboard

---

## 🗺️ Roadmap

### ✅ Completed
- Real-time stock fundamentals
- AI sentiment analysis
- BUY/HOLD/SELL recommendations
- Persistent watchlist
- Side-by-side comparisons
- Multi-deployment support (Local, Vercel, AWS)

### 🔄 Planned
- [ ] User authentication (JWT or OAuth)
- [ ] Account-scoped watchlists
- [ ] Portfolio tracking + P&L calculations
- [ ] WebSocket real-time price updates
- [ ] Email alerts on watchlist changes
- [ ] Advanced technical indicators (RSI, MACD, Bollinger Bands)
- [ ] Options analysis support
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Rate limiting per user (not IP)
- [ ] Dark mode theme
- [ ] Mobile app (React Native)
- [ ] API documentation (OpenAPI/Swagger)

---

## 📄 License

**ISC License** — You can use this code freely. See LICENSE file for details.

---

## 👤 Author

**Marmik Kaila**

- 🔗 **GitHub:** https://github.com/MarmikKaila
- 💼 **LinkedIn:** https://www.linkedin.com/in/marmik-kaila-748bab28a/
- 📧 **Email:** [From GitHub profile]

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Demo Video** | https://drive.google.com/file/d/13IK9walcuvg2VHGvFdtoI_qaeRcHtXdw/view?usp=sharing |
| **GitHub Repo** | https://github.com/MarmikKaila/AI_Stock_Market_and_Sentiment_Dashboard |
| **Alpha Vantage API** | https://www.alphavantage.co |
| **NewsAPI** | https://newsapi.org |
| **Google Gemini** | https://aistudio.google.com/app/apikey |
| **MongoDB Atlas** | https://www.mongodb.com/cloud/atlas |
| **Vercel Deployment** | https://vercel.com |
| **AWS Console** | https://console.aws.amazon.com |
| **Terraform Docs** | https://www.terraform.io/docs |

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Status:** ✅ Production-Ready

---

## 📞 Support

Encountered an issue? Check:
1. [Troubleshooting section](#-troubleshooting) above
2. AWS deployment guide: [aws/DEPLOYMENT.md](aws/DEPLOYMENT.md)
3. API endpoint documentation in README
4. GitHub Issues: Search existing or create new

**Enjoy building!** 🚀

### ✅ Stock Analysis

- Real-time fundamentals (P/E, P/B, EPS, Market Cap)
- 30-minute cache to optimize API costs
- Historical price data (7d/30d/90d)
- Company news feed with sources

### ✅ AI-Powered Sentiment

- Sentiment scoring on each news headline (-1 to +1)
- Aggregated sentiment per stock
- Google Gemini 2.0 integration (free tier)
- Fallback to keyword-based sentiment if Gemini fails

### ✅ Investment Recommendations

- AI-generated BUY/HOLD/SELL recommendations
- Confidence scoring (0-1 scale)
- Context-aware reasoning
- Multiple Gemini model strategy (fallback support)

### ✅ Watchlist Management

- Session-based identity (no login required)
- Persistent storage in MongoDB
- Add/remove stocks (max 20 per watchlist)
- Auto-synced across device via sessionId

### ✅ Stock Comparison

- Side-by-side metrics display
- Color-coded comparison (green = better)
- Overlaid price charts
- URL query parameter syncing

### ✅ Enhanced Charting

- Interactive price charts (Recharts)
- Time range selector (7d/30d/90d)
- Volume bars
- Sparklines on overview cards

### ✅ Security

- Helmet security headers
- CORS with origin whitelist
- Rate limiting (global + per-endpoint)
- Input validation on all routes
- MongoDB injection prevention

### ✅ Deployment Options

- Local development (Express + Vite)
- Vercel serverless (auto-deployment)
- AWS Lambda + RDS (enterprise)

### ✅ Testing

- Unit tests for services (Jest)
- Component tests for React (Vitest + RTL)
- Integration tests for API endpoints
- Coverage reporting
