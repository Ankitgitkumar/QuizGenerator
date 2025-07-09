
import React from "react";
import { Link } from "react-router-dom";


const PracticeQuiz = () => {
  return (
    <div className="min-h-screen  px-6 py-10">
      <h1 className="text-3xl text-white font-bold text-center mb-10">Practice Quizzes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        <Link to="/student/practice-quiz/generate-quiz">
          <div className="bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2 text-gray-200">Generate New Quiz</h2>
            <p className="text-gray-400">Use AI to generate and start a new quiz.</p>
          </div>
        </Link>

        <Link to="/student/practice-quiz/available-quizzes">
          <div className="bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2 text-gray-200">Available Quizzes</h2>
            <p className="text-gray-400">Practice quizzes you’ve generated but not yet attempted.</p>
          </div>
        </Link>


        <Link to="/student/practice-quiz/history">
          <div className="bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2 text-gray-200">Previous Attempts</h2>
            <p className="text-gray-400">View your past attempts and scores.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PracticeQuiz;
