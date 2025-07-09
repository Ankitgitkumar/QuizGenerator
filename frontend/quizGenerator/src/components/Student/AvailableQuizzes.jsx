
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AvailableQuizzes = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: "Photosynthesis Basics",
      createdAt: "2025-07-01",
      score: null, // not attempted
    },
    {
      id: 2,
      title: "World War II",
      createdAt: "2025-07-02",
      score: 8, // out of 10
    },
  ]);

  const handleDelete = (id) => {
    const filtered = quizzes.filter((q) => q.id !== id);
    setQuizzes(filtered);
  };

  const handleAttempt = (id) => {
    navigate(`/student/practice-quiz/attempt/${id}`);
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Your Practice Quizzes</h2>

      <div className="max-w-4xl mx-auto space-y-4">
        {quizzes.length === 0 ? (
          <p className="text-center text-gray-500">No quizzes available. Generate one first!</p>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-gray-800 rounded-xl shadow p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-200">{quiz.title}</h3>
                <p className="text-sm text-gray-400">Created: {quiz.createdAt}</p>
                {quiz.score !== null && (
                  <p className="text-green-600 font-semibold mt-1">Score: {quiz.score}/10</p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleAttempt(quiz.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {quiz.score !== null ? 'Reattempt' : 'Attempt'}
                </button>
                <button
                  onClick={() => handleDelete(quiz.id)}
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

export default AvailableQuizzes;
