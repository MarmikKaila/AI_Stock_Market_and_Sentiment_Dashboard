import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchWatchlist as apiFetchWatchlist,
  addToWatchlist as apiAddToWatchlist,
  removeFromWatchlist as apiRemoveFromWatchlist,
} from '../services/watchlistService';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [symbols, setSymbols] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetchWatchlist();
      setSymbols(data.symbols || []);
      setStocks(data.stocks || []);
    } catch (err) {
      console.error('Failed to load watchlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const addStock = useCallback(async (symbol) => {
    const clean = symbol.toUpperCase();
    // Optimistic update
    setSymbols(prev => prev.includes(clean) ? prev : [...prev, clean]);
    try {
      const data = await apiAddToWatchlist(clean);
      setSymbols(data.symbols);
    } catch (err) {
      // Revert on failure
      setSymbols(prev => prev.filter(s => s !== clean));
      throw err;
    }
  }, []);

  const removeStock = useCallback(async (symbol) => {
    const clean = symbol.toUpperCase();
    // Optimistic update
    setSymbols(prev => prev.filter(s => s !== clean));
    setStocks(prev => prev.filter(s => s.symbol !== clean));
    try {
      const data = await apiRemoveFromWatchlist(clean);
      setSymbols(data.symbols);
    } catch (err) {
      // Revert on failure
      setSymbols(prev => [...prev, clean]);
      await loadWatchlist();
      throw err;
    }
  }, [loadWatchlist]);

  const isInWatchlist = useCallback((symbol) => {
    return symbols.includes(symbol.toUpperCase());
  }, [symbols]);

  return (
    <WatchlistContext.Provider value={{ symbols, stocks, loading, addStock, removeStock, isInWatchlist, refreshWatchlist: loadWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
}
