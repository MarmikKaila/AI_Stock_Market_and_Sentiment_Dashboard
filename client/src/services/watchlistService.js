const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getSessionId() {
  let id = localStorage.getItem('stocksent_session_id');
  if (!id) {
    id = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
    localStorage.setItem('stocksent_session_id', id);
  }
  return id;
}

export async function fetchWatchlist() {
  const sessionId = getSessionId();
  const res = await fetch(`${BACKEND_URL}/api/watchlist/${sessionId}`);
  if (!res.ok) throw new Error('Failed to load watchlist');
  return res.json();
}

export async function addToWatchlist(symbol) {
  const sessionId = getSessionId();
  const res = await fetch(`${BACKEND_URL}/api/watchlist/${sessionId}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol: symbol.toUpperCase() }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to add to watchlist');
  }
  return res.json();
}

export async function removeFromWatchlist(symbol) {
  const sessionId = getSessionId();
  const res = await fetch(`${BACKEND_URL}/api/watchlist/${sessionId}/${symbol.toUpperCase()}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove from watchlist');
  return res.json();
}
