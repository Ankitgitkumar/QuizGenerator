import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const PracticeQuizzes = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("studentToken");

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/student/quizzes/practice`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setQuizzes(res.data || []);
      } catch (err) {
        console.error("Error fetching practice quizzes:", err.response?.data || err.message);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [token]);

  const handleDelete = (id) => {
    const filtered = quizzes.filter((q) => q._id !== id);
    setQuizzes(filtered);
  };

  const handleAttempt = (id) => {
    navigate(`/student/quiz/attempt/${id}`, {
  state: { type: "practice" },
});
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-slate-600 text-sm">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Your Practice Quizzes</h1>
        <button
          onClick={() => navigate('/student/practice-quiz')}
          className="text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition shadow-2xs cursor-pointer"
        >
          ← Back to Practice
        </button>
      </div>

      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-semibold text-sm">
            No practice quizzes available. Generate one first!
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {quiz.topic || quiz.title}
                </h3>
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-100">
                  Practice Quiz
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAttempt(quiz._id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Attempt
                </button>

                <button
                  onClick={() => handleDelete(quiz._id)}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PracticeQuizzes;