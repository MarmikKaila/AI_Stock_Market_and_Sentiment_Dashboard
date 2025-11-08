# 📊 AI Stock Market Summary & Sentiment Dashboard  

> **An AI-powered FinTech dashboard combining stock market analytics, sentiment evaluation, and real-time AI recommendations.**

---

## 🧠 Overview  

**AI Stock Market Summary & Sentiment Dashboard** is a full-stack web application designed to help investors make smarter decisions using AI.  
It provides real-time stock insights, key financial ratios, AI-driven sentiment scores, and BUY/HOLD/SELL recommendations based on live market data and news sentiment.

---

## 🏗️ Tech Stack  

### 🖥️ Frontend (Client)
- ⚛️ **React.js (Vite)** — Modern, fast front-end development  
- 💨 **Tailwind CSS** — Clean, responsive UI design  
- 📊 **Recharts** — Interactive data visualizations  
- ⚡ **Axios** — For API integration  

### ⚙️ Backend (Server)
- 🟢 **Node.js + Express.js** — RESTful API and server logic  
- 🗄️ **MongoDB + Mongoose** — Database and schema management  
- 🔑 **Alpha Vantage API** — For stock fundamentals and price data  
- 📰 **NewsAPI** — For fetching latest financial & company news  
- 🤖 **Google Gemini API** — For AI-based sentiment analysis and recommendations  

---

## 🚀 Key Features  

### 📈 Real-time Stock Data  
- Fetches latest prices, P/E, P/B, EPS, and Market Cap from **Alpha Vantage API**.  
- Displays them using beautiful **animated cards** and **line/candlestick charts**.  

### 🧾 Financial Ratios & Analytics  
- Auto-calculates and displays **fundamental indicators**.  
- Helps in understanding stock valuation and performance.  

### 🧠 AI Recommendation Engine  
- **Google Gemini AI** analyzes market data + news sentiment.  
- Suggests an actionable decision — **BUY**, **HOLD**, or **SELL**.  

### 📰 News & Sentiment Analysis  
- Fetches 5 latest headlines using **NewsAPI**.  
- Each headline is analyzed by Gemini to classify as:
  - 🟢 Positive  
  - 🟡 Neutral  
  - 🔴 Negative  
- Sentiment score is averaged between `-1` (very negative) and `+1` (very positive).  

### 🎨 Modern Interactive UI  
- Built with **Tailwind CSS** and **Recharts** for smooth visuals.  
- Fully responsive (desktop, tablet, and mobile).  
- Animated cards, hover effects, and gradient highlights.  

---

## 🗂️ Folder Structure  

```
AI_StockMarketSummary_SentimentDashboard/
│
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── assets/                  # Icons, SVGs
│   │   ├── components/              # UI Components
│   │   │   ├── Navbar.jsx           # Top navigation bar + stock search
│   │   │   ├── StockCard.jsx        # Displays key stock metrics
│   │   │   └── SentimentBadge.jsx   # Color-coded sentiment label
│   │   ├── pages/
│   │   │   └── Dashboard.jsx        # Main dashboard screen
│   │   ├── services/
│   │   │   └── stockService.js      # Fetch stock & sentiment data from backend
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js           # Tailwind setup
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── stockController.js       # Fetches stock and ratios
│   │   └── opinionController.js     # Handles AI recommendation
│   ├── models/
│   │   └── Stock.js                 # MongoDB schema for stocks
│   ├── routes/
│   │   ├── stockRoutes.js
│   │   ├── aiRoutes.js
│   │   └── opinionRoutes.js
│   ├── services/
│   │   ├── aiService.js             # Gemini AI integration
│   │   ├── newsService.js           # NewsAPI + sentiment classification
│   │   └── stockService.js          # Alpha Vantage API fetch logic
│   ├── .env                         # Environment variables
│   ├── server.js                    # Express server entry point
│   └── package.json
│
├── README.md                        # Project Documentation
└── .gitignore
```

---

## ⚙️ Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/MarmikKaila/AI_Stock_Market_and_Sentiment_Dashboard.git
cd AI_StockMarketSummary_SentimentDashboard
```

### 2️⃣ Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file inside `/server` and add your keys:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key
NEWSAPI_KEY=your_newsapi_key
GEMINI_API_KEY=your_gemini_api_key
```

Run the backend:

```bash
npm run dev
```

### 3️⃣ Setup the Frontend
```bash
cd ../client
npm install
npm run dev
```

Then open the app in your browser:  
👉 **http://localhost:5173**

---

## 💡 How to Use

1️⃣ Open the dashboard in your browser.

2️⃣ Use the search bar (top-right) to enter a stock symbol — e.g.:
- `AAPL` → Apple Inc.
- `TSLA` → Tesla
- `GOOGL` → Alphabet Inc.

3️⃣ The app will automatically:
- Fetch stock fundamentals via Alpha Vantage
- Fetch latest news via NewsAPI
- Analyze sentiment with Gemini AI
- Display an AI recommendation

---

## 🧮 Example Output

```
Stock: AAPL
P/E Ratio: 28.4
P/B Ratio: 47.1
Price: $150.23
Sentiment Score: 0.65
AI Recommendation: 🟢 BUY

"Strong fundamentals and positive market sentiment indicate a buying opportunity."
```

---

## 🔑 APIs Used

| API | Purpose | Documentation |
|-----|---------|---------------|
| 🟢 **Alpha Vantage API** | Fetches stock prices & ratios | [https://www.alphavantage.co](https://www.alphavantage.co) |
| 📰 **NewsAPI** | Fetches financial & company-related news | [https://newsapi.org](https://newsapi.org) |
| 🤖 **Google Gemini API** | Performs sentiment analysis & recommendation generation | [https://ai.google.dev](https://ai.google.dev) |

---

## 🧠 Development Notes

- Each fetched news headline is analyzed by **Gemini AI** to determine sentiment: "Positive", "Neutral", or "Negative".
- Sentiment scores are aggregated to compute an average numeric sentiment score (between `-1` and `+1`).
- If Gemini is unavailable, a **fallback rule-based recommendation** (based on P/E, P/B ratios, sentiment) is applied.
- **MongoDB** caches stock data to minimize API calls and improve performance.

---

## 🚀 Future Enhancements

- ✅ User authentication & personalized watchlists
- ✅ Add real-time candlestick charts
- ✅ Integrate WebSocket live price updates
- ✅ Portfolio management & profit tracking
- ✅ Multi-stock comparison view
- ✅ Export reports to PDF or Excel

---


## 💬 Author

👨‍💻 **Marmik Kaila**    
🔗 [GitHub](https://github.com/MarmikKaila) | [LinkedIn](https://www.linkedin.com/in/marmik-kaila-748bab28a/)


---

## 📸 Screenshots


### Dashboard View
<img width="1919" height="817" alt="Screenshot 2025-11-08 150730" src="https://github.com/user-attachments/assets/710712df-9f0f-4132-ae3a-317faaa46176" />

### Live Demo

```
https://drive.google.com/file/d/1u2UylDWB9ABXlyrAl76QbzMclK4peIP9/view
```





**⭐ If you found this project helpful, please consider giving it a star!**
