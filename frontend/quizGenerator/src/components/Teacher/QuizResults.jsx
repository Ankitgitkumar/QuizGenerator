import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem("teacherToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/teacher/quiz/${id}/results`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setResults(res.data.results || []);
      } catch (err) {
        console.error("Error fetching quiz results:", err);
        setError(err.response?.data?.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-slate-600 text-sm">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-50 text-red-600 p-6">
        <p className="font-bold text-lg mb-4">{error}</p>
        <button onClick={() => navigate("/teacher/myquizzes")} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition">
          Back to My Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Quiz Results</h1>
        <button
          onClick={() => navigate("/teacher/myquizzes")}
          className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs"
        >
          ← Back to Quizzes
        </button>
      </div>

      {results.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-semibold text-sm">
          No submissions yet for this quiz.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 bg-white">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((item, idx) => {
                const student = item.studentId || {};
                const name = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email || "Unknown";
                return (
                  <tr key={item._id || idx} className={`text-slate-700 hover:bg-slate-50/80 transition duration-150 ${item.disqualified ? "bg-rose-50/30" : ""}`}>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900">{idx + 1}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-700">
                      {name}
                      {item.disqualified && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                          UFM Alert
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {item.disqualified ? (
                        <span className="font-extrabold text-red-650">0 (Disqualified)</span>
                      ) : (
                        <span className="font-extrabold text-emerald-650">{item.score}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">{new Date(item.attemptedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuizResults;
