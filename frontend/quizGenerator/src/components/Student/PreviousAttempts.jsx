import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PreviousAttempts = () => {
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        const res = await axios.get("https://quiz-generator-livid.vercel.app/api/v1/student/quizzes/previous", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttemptedQuizzes(res.data);
      } catch (e) {
        console.error(e);
        setAttemptedQuizzes([]);
      }
    };

    fetchAttempts();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Previous Attempted Quizzes</h2>

      <div className="max-w-4xl mx-auto space-y-4">
        {attemptedQuizzes.length === 0 ? (
          <p className="text-center text-gray-500">You haven't attempted any quizzes yet.</p>
        ) : (
          attemptedQuizzes.map((quiz, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl shadow p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-200">Attempt #{index + 1}</h3>
                <p className="text-sm text-gray-400">
                  Attempted: {new Date(quiz.attemptedAt).toLocaleDateString()}
                </p>
                <p className="text-green-600 font-semibold mt-1">Score: {quiz.score}/10</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    navigate(`/student/practice-quiz/attempt/${12}/review`, {
      state: { questions: quiz.questions, responses:quiz.responses,score:quiz.score },
    })
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
