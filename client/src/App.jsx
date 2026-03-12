import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WatchlistProvider } from "./context/WatchlistContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import StockDetail from "./pages/StockDetail";
import Watchlist from "./pages/Watchlist";
import Compare from "./pages/Compare";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <WatchlistProvider>
        <div className="bg-black min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </WatchlistProvider>
    </BrowserRouter>
  );
}

export default App;
