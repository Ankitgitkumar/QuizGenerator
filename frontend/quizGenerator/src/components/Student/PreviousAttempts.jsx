import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const PreviousAttempts = () => {
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        const res = await axios.get(
          `${API_BASE_URL}/student/quizzes/previous`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAttemptedQuizzes(res.data || []);
      } catch (e) {
        console.error("Error fetching previous attempts:", e.response?.data || e.message);
        setAttemptedQuizzes([]);
      }
    };

    fetchAttempts();
  }, []);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Previous Attempted Quizzes</h1>
        <button
          onClick={() => navigate('/student/practice-quiz')}
          className="text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition shadow-2xs cursor-pointer"
        >
          ← Back to Practice
        </button>
      </div>

      <div className="space-y-4">
        {attemptedQuizzes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-semibold text-sm">
            You haven't attempted any quizzes yet.
          </div>
        ) : (
          attemptedQuizzes.map((quiz, index) => (
            <div
              key={quiz._id || index}
              className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 flex justify-between items-center hover:shadow-sm transition"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Attempt #{index + 1}
                </h3>

                <p className="text-xs text-slate-450 font-semibold mb-2">
                  Attempted: {new Date(quiz.attemptedAt).toLocaleString()}
                </p>

                <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                  Score: {quiz.score}/{quiz.questions?.length || 10}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() =>
                    navigate(`/student/quiz/attempt/${quiz.quizId}/review`, {
                      state: {
                        questions: quiz.questions,
                        responses: quiz.responses,
                        score: quiz.score,
                        total: quiz.questions?.length || 10,
                      },
                    })
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PreviousAttempts;