import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

const MEDAL = ['🥇', '🥈', '🥉'];
const POLL_INTERVAL = 10_000; // refresh every 10 s

const Leaderboard = () => {
  const [leaders, setLeaders]   = useState([]);
  const [scope, setScope]       = useState('global');
  const [limit, setLimit]       = useState(10);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const token = localStorage.getItem('teacherToken') || localStorage.getItem('studentToken');

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/leaderboard?scope=${scope}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeaders(data.leaders ?? []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Could not load leaderboard. Is Redis running?');
    } finally {
      setLoading(false);
    }
  }, [scope, limit, token]);

  // Initial fetch + polling
  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
    const id = setInterval(fetchLeaderboard, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black px-4 py-8">
      {/* ── Header ── */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              📊 Live Leaderboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Auto-refreshes every 10 s
              {lastUpdated && (
                <span className="ml-2 text-gray-600">
                  · Last updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Link
            to="/teacher/dashboard"
            className="text-sm border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 px-4 py-2 rounded-lg transition"
          >
            ← Dashboard
          </Link>
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Scope */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <span className="text-gray-400 text-sm">Scope:</span>
            <button
              onClick={() => setScope('global')}
              className={`text-sm px-3 py-1 rounded-lg transition ${
                scope === 'global'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🌐 Global
            </button>
          </div>

          {/* Limit */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <span className="text-gray-400 text-sm">Show top:</span>
            {[5, 10, 25, 50].map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`text-sm px-3 py-1 rounded-lg transition ${
                  limit === n
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Manual refresh */}
          <button
            onClick={() => { setLoading(true); fetchLeaderboard(); }}
            className="ml-auto text-sm border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl transition"
          >
            ↻ Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Animated top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-cyan-400 to-blue-500 animate-pulse" />

          {loading ? (
            <div className="py-20 text-center text-gray-400 animate-pulse">
              Loading leaderboard…
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-400">{error}</div>
          ) : leaders.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              No scores yet — students must submit a quiz first.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-400 uppercase text-xs tracking-wider border-b border-white/10">
                  <th className="py-4 px-6 text-left">Rank</th>
                  <th className="py-4 px-6 text-left">Student</th>
                  <th className="py-4 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((s, idx) => (
                  <tr
                    key={s.studentId}
                    className={`border-t border-white/5 transition hover:bg-white/5 ${
                      idx === 0 ? 'bg-yellow-500/5' :
                      idx === 1 ? 'bg-gray-400/5'  :
                      idx === 2 ? 'bg-amber-700/5'  : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-bold text-xl">
                      {idx < 3 ? MEDAL[idx] : <span className="text-gray-500 text-sm">#{s.rank}</span>}
                    </td>
                    <td className="py-4 px-6 text-white font-medium">{s.name}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="bg-violet-600/20 border border-violet-500/30 text-violet-300 px-3 py-1 rounded-full font-semibold tabular-nums">
                        {s.score} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
