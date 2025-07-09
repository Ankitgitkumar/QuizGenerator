// File: src/pages/PreviousAttempts.jsx
import React from 'react';

const PreviousAttempts = () => {
  const attemptedQuizzes = [
    {
      id: 1,
      title: "Basics of Electricity",
      attemptedAt: "2025-07-01",
      score: 9,
    },
    {
      id: 2,
      title: "Human Digestive System",
      attemptedAt: "2025-07-02",
      score: 7,
    },
  ];

  return (
    <div className="min-h-screen  px-6 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Previous Attempted Quizzes</h2>

      <div className="max-w-4xl mx-auto space-y-4">
        {attemptedQuizzes.length === 0 ? (
          <p className="text-center text-gray-500">You haven't attempted any quizzes yet.</p>
        ) : (
          attemptedQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-gray-800 rounded-xl shadow p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-200">{quiz.title}</h3>
                <p className="text-sm text-gray-400">Attempted: {quiz.attemptedAt}</p>
                <p className="text-green-600 font-semibold mt-1">Score: {quiz.score}/10</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => navigate(`/student/practice-quiz/history/review/${quiz.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Review
                </button>
                <button onClick={() => navigate(`/student/practice-quiz/history/attempt/${quiz.id}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
                  Reattempt
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
