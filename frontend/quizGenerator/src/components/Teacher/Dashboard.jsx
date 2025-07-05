import React, { use } from 'react';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 z-10 relative">
      <h1 className="text-3xl font-bold text-white z-10 relative mb-8 ">
        Welcome, Mr. Gouri Shankar 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 z-10 gap-6">

        {/* Card 1: Create Quiz */}
        <div className="bg-gray-800 rounded-2xl shadow p-6 hover:shadow-md transition duration-300">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Create New Quiz</h2>
          <p className="text-gray-400 mb-4">
            Use Gemini or upload a PDF to generate AI-powered quizzes.
          </p>
          <button onClick={() => {navigate('/createquiz')}} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Create Quiz
          </button>
        </div>

        {/* Card 2: My Quizzes */}
        <div className="bg-gray-800 rounded-2xl shadow p-6 hover:shadow-md transition duration-300">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">My Quizzes</h2>
          <p className="text-gray-400 mb-4">
            View, final results or delete previously created quizzes.
          </p>
          <button onClick={() => {navigate('/myquizzes')}} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            View Quizzes
          </button>
        </div>

        {/* Card 3: Live Leaderboard */}
        <div className="bg-gray-800 rounded-2xl shadow p-6 hover:shadow-md transition duration-300">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Live Leaderboard</h2>
          <p className="text-gray-400 mb-4">
            Monitor quiz performance in real-time as students answer.
          </p>
          <button onClick={() => {navigate('/leaderboard')}} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            View Leaderboard
          </button>
        </div>

      </div>
    </div>
    </div>
  );
};

export default Dashboard;
