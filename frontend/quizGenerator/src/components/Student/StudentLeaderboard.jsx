import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

const MEDAL = ['🥇', '🥈', '🥉'];
const POLL_INTERVAL = 10_000;

const StudentLeaderboard = () => {
  const [leaders, setLeaders]     = useState([]);
  const [myRank, setMyRank]       = useState(null);  // { rank, score, name }
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const token     = localStorage.getItem('studentToken');
  const rawData   = localStorage.getItem('studentData');
  const studentId = rawData ? JSON.parse(rawData)?._id : null;

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      // Fetch top 10 + own rank in parallel
      const [boardRes, rankRes] = await Promise.all([
        fetch(`${API_BASE_URL}/leaderboard?scope=global&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        studentId
          ? fetch(`${API_BASE_URL}/leaderboard/${studentId}/rank?scope=global`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ]);

      if (!boardRes.ok) throw new Error(`HTTP ${boardRes.status}`);
      const boardData = await boardRes.json();
      setLeaders(boardData.leaders ?? []);

      if (rankRes && rankRes.ok) {
        setMyRank(await rankRes.json());
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Could not load leaderboard.');
    } finally {
      setLoading(false);
    }
  }, [token, studentId]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
    const id = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAll]);
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto bg-slate-50 text-slate-800 fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            🏆 Leaderboard
          </h1>
          <p className="text-slate-505 text-xs mt-1 font-semibold">
            Global rankings · auto-refreshes every 10 s
            {lastUpdated && (
              <span className="ml-2 text-slate-400 font-semibold">
                · {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Link
          to="/student/dashboard"
          className="text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition shadow-2xs"
        >
          ← Dashboard
        </Link>
      </div>

      {/* ── My Rank Card ── */}
      {myRank && (
        <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-450 text-[10px] uppercase font-bold tracking-wider mb-1">Your Rank</p>
            <p className="text-3xl font-extrabold text-indigo-700">
              {myRank.rank !== null ? `#${myRank.rank}` : 'Unranked'}
            </p>
            <p className="text-slate-600 text-xs font-semibold mt-1">{myRank.name}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-450 text-[10px] uppercase font-bold tracking-wider mb-1">Total Score</p>
            <p className="text-3xl font-extrabold text-indigo-700 tabular-nums">{myRank.score}</p>
            <p className="text-slate-500 text-[10px] font-bold mt-1">points</p>
          </div>
        </div>
      )}

      {/* ── Leaderboard Table ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="h-1 w-full bg-indigo-600" />

        {loading ? (
          <div className="py-20 text-center text-slate-400 font-semibold text-sm animate-pulse">Loading…</div>
        ) : error ? (
          <div className="py-20 text-center text-rose-600 font-bold text-sm">{error}</div>
        ) : leaders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-semibold text-sm">
            No scores yet. Submit a quiz to appear here!
          </div>
        ) : (
          <table className="min-w-full text-sm divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-slate-550 uppercase text-xs font-semibold tracking-wider">
                <th className="py-4 px-6 text-left">Rank</th>
                <th className="py-4 px-6 text-left">Student</th>
                <th className="py-4 px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaders.map((s, idx) => {
                const isMe = s.studentId === studentId;
                return (
                  <tr
                    key={s.studentId}
                    className={`transition hover:bg-slate-50/50 ${
                      isMe      ? 'bg-indigo-50/40 ring-1 ring-inset ring-indigo-500/20' :
                      idx === 0 ? 'bg-amber-500/5' :
                      idx === 1 ? 'bg-slate-400/5'   :
                      idx === 2 ? 'bg-amber-700/5'  : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-extrabold text-lg">
                      {idx < 3
                        ? MEDAL[idx]
                        : <span className="text-slate-400 text-xs">#{s.rank}</span>}
                    </td>
                    <td className="py-4 px-6 text-slate-950 font-bold">
                      {s.name}
                      {isMe && (
                        <span className="ml-2 inline-flex items-center bg-indigo-100/60 border border-indigo-200/50 text-indigo-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold text-xs tabular-nums">
                        {s.score} pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-slate-400 text-xs mt-6 font-semibold leading-relaxed">
        Scores accumulate from all quiz submissions. Keep attempting quizzes to climb the ranks!
      </p>
    </div>
  );
};

export default StudentLeaderboard;
