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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              🏆 Leaderboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Global rankings · auto-refreshes every 10 s
              {lastUpdated && (
                <span className="ml-2 text-gray-600">
                  · {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Link
            to="/student/dashboard"
            className="text-sm border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 px-4 py-2 rounded-lg transition"
          >
            ← Dashboard
          </Link>
        </div>

        {/* ── My Rank Card ── */}
        {myRank && (
          <div className="mb-6 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Your Rank</p>
              <p className="text-4xl font-black text-white">
                {myRank.rank !== null ? `#${myRank.rank}` : 'Unranked'}
              </p>
              <p className="text-gray-400 text-sm mt-1">{myRank.name}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Score</p>
              <p className="text-4xl font-black text-violet-300 tabular-nums">{myRank.score}</p>
              <p className="text-gray-500 text-xs mt-1">points</p>
            </div>
          </div>
        )}

        {/* ── Leaderboard Table ── */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-cyan-400 to-blue-500" />

          {loading ? (
            <div className="py-20 text-center text-gray-400 animate-pulse">Loading…</div>
          ) : error ? (
            <div className="py-20 text-center text-red-400">{error}</div>
          ) : leaders.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              No scores yet. Submit a quiz to appear here!
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
                {leaders.map((s, idx) => {
                  const isMe = s.studentId === studentId;
                  return (
                    <tr
                      key={s.studentId}
                      className={`border-t border-white/5 transition hover:bg-white/5 ${
                        isMe      ? 'ring-1 ring-inset ring-violet-500/50 bg-violet-500/10' :
                        idx === 0 ? 'bg-yellow-500/5' :
                        idx === 1 ? 'bg-gray-400/5'   :
                        idx === 2 ? 'bg-amber-700/5'  : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-xl">
                        {idx < 3
                          ? MEDAL[idx]
                          : <span className="text-gray-500 text-sm">#{s.rank}</span>}
                      </td>
                      <td className="py-4 px-6 text-white font-medium">
                        {s.name}
                        {isMe && (
                          <span className="ml-2 text-xs bg-violet-600/30 border border-violet-500/40 text-violet-300 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded-full font-semibold tabular-nums">
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

        <p className="text-center text-gray-600 text-xs mt-4">
          Scores accumulate from all quiz submissions. Keep attempting quizzes to climb the ranks!
        </p>
      </div>
    </div>
  );
};

export default StudentLeaderboard;
