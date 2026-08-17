import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const MEDALS = ["🥇", "🥈", "🥉"];

const QuizLeaderboardModal = ({ isOpen, onClose, quizId, quizTopic }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !quizId) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("studentToken") || localStorage.getItem("teacherToken");
        const res = await axios.get(`${API_BASE_URL}/leaderboard/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaders(res.data.leaders || []);
      } catch (err) {
        console.error("Error fetching quiz leaderboard:", err);
        setError("Failed to load rankings.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen, quizId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 w-full max-w-md relative fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold p-1 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
          🏆 Quiz Leaderboard
        </h2>
        <p className="text-xs text-slate-500 font-semibold mb-6">
          Topic: <span className="text-indigo-650">{quizTopic || "Practice Quiz"}</span>
        </p>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-sm">
            <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block mr-2" />
            Loading live rankings...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600 font-bold text-sm">
            {error}
          </div>
        ) : leaders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-sm">
            No submissions yet for this test.
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
            {leaders.map((student, idx) => (
              <div
                key={student.studentId || idx}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-2xl hover:bg-slate-100/50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold select-none">
                    {idx < 3 ? MEDALS[idx] : `#${student.rank}`}
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {student.name}
                  </span>
                </div>
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-extrabold text-xs">
                  {student.score} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizLeaderboardModal;
