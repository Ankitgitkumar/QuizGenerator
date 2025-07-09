// File: src/components/StudentDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  return (
    <div className="min-h-screen px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Welcome, Student 👋</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* Join Classroom Card */}
        <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col justify-between min-h-[250px]">
          <div>
            <h2 className="text-xl font-semibold text-gray-200 mb-2">Join a Classroom</h2>
            <p className="text-gray-400 mb-4">
              Enter your classroom code to join and access tests from your teacher.
            </p>
          </div>
          <Link
            to="/student/join-classroom"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-center"
          >
            Join Classroom
          </Link>
        </div>

        {/* Practice Quiz Card */}
        <div className="bg-gray-800 rounded-xl shadow p-6 flex flex-col justify-between min-h-[250px]">
          <div>
            <h2 className="text-xl font-semibold text-gray-200 mb-2">Practice Quiz</h2>
            <p className="text-gray-400 mb-4">
              Generate and attempt your own quizzes using AI.
            </p>
          </div>
          <Link
            to="/student/practice-quiz"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-center"
          >
            Practice Now
          </Link>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
