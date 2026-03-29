import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PracticeQuizzes = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("studentToken");

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3141/api/v1/student/quizzes/practice",
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
    return <div className="text-white text-center mt-10">Loading practice quizzes...</div>;
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Your Practice Quizzes
      </h2>

      <div className="max-w-4xl mx-auto space-y-4">
        {quizzes.length === 0 ? (
          <p className="text-center text-gray-500">
            No practice quizzes available. Generate one first!
          </p>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-gray-800 rounded-xl shadow p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-200">
                  {quiz.topic || quiz.title}
                </h3>
                <p className="text-sm text-gray-400">
                  Created: {new Date(quiz.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-green-400">Type: Practice Quiz</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleAttempt(quiz._id)}
                  className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
                >
                  Attempt
                </button>

                <button
                  onClick={() => handleDelete(quiz._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
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