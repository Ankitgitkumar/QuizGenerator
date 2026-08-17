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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto fade-in bg-slate-50">
      {/* ── Header ── */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              📊 Live Leaderboard
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-semibold">
              Auto-refreshes every 10 s
              {lastUpdated && (
                <span className="ml-2 text-slate-400 font-semibold">
                  · Last updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Link
            to="/teacher/dashboard"
            className="text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition shadow-2xs"
          >
            ← Dashboard
          </Link>
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Scope */}
          <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-xl px-4 py-2 shadow-2xs">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Scope:</span>
            <button
              onClick={() => setScope('global')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                scope === 'global'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🌐 Global
            </button>
          </div>

          {/* Limit */}
          <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-xl px-4 py-2 shadow-2xs">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Top:</span>
            {[5, 10, 25, 50].map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  limit === n
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Manual refresh */}
          <button
            onClick={() => { setLoading(true); fetchLeaderboard(); }}
            className="ml-auto text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition shadow-2xs cursor-pointer"
          >
            ↻ Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Animated top bar */}
          <div className="h-1 w-full bg-indigo-600" />

          {loading ? (
            <div className="py-20 text-center text-slate-400 font-semibold text-sm animate-pulse">
              Loading leaderboard…
            </div>
          ) : error ? (
            <div className="py-20 text-center text-rose-600 font-bold text-sm">{error}</div>
          ) : leaders.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-semibold text-sm">
              No scores yet — students must submit a quiz first.
            </div>
          ) : (
            <table className="min-w-full text-sm divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-slate-500 uppercase text-xs font-semibold tracking-wider">
                  <th className="py-4 px-6 text-left">Rank</th>
                  <th className="py-4 px-6 text-left">Student</th>
                  <th className="py-4 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaders.map((s, idx) => (
                  <tr
                    key={s.studentId}
                    className={`transition hover:bg-slate-50/50 ${
                      idx === 0 ? 'bg-amber-500/5' :
                      idx === 1 ? 'bg-slate-400/5'  :
                      idx === 2 ? 'bg-amber-700/5'  : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-extrabold text-lg">
                      {idx < 3 ? MEDAL[idx] : <span className="text-slate-400 text-xs">#{s.rank}</span>}
                    </td>
                    <td className="py-4 px-6 text-slate-950 font-bold">{s.name}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold text-xs tabular-nums">
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
