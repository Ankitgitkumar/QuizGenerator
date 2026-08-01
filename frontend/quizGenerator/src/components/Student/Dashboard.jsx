// File: src/components/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../utils/auth';

const StudentDashboard = () => {
  const [studentName, setStudentName] = useState('Student');
  const navigate = useNavigate();

  useEffect(() => {
    const rawStudentData = localStorage.getItem('studentData');
    console.log('Raw studentData from localStorage:', rawStudentData);

    if (rawStudentData) {
      try {
        const parsedData = JSON.parse(rawStudentData);
        console.log('Parsed studentData:', parsedData);

        const fullName = `${parsedData?.firstName || ''} ${parsedData?.lastName || ''}`.trim();
        console.log('Full name:', fullName);

        if (fullName) {
          setStudentName(fullName);
        }
      } catch (error) {
        console.error('Error parsing studentData:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Welcome, <span className="text-blue-400">{studentName}</span> 👋
            </h1>
            <p className="text-gray-400 mt-3 text-sm sm:text-base">
              Ready to join your classroom or practice quizzes today?
            </p>
          </div>
          <button
            onClick={() => logoutUser(navigate, '/')}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col justify-between min-h-[240px] hover:scale-[1.02] transition duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-3">
                Join a Classroom
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mb-6 leading-6">
                Enter your classroom code to join and access tests shared by your teacher.
              </p>
            </div>

            <Link
              to="/student/join-classroom"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-center font-medium transition"
            >
              Join Classroom
            </Link>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col justify-between min-h-[240px] hover:scale-[1.02] transition duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-3">
                Practice Quiz
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mb-6 leading-6">
                Generate and attempt your own quizzes using AI and improve your preparation.
              </p>
            </div>

            <Link
              to="/student/practice-quiz"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl text-center font-medium transition"
            >
              Practice Now
            </Link>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col justify-between min-h-[240px] hover:scale-[1.02] transition duration-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-3">
                🏆 Leaderboard
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mb-6 leading-6">
                See how you rank against other students. Scores update automatically after every quiz.
              </p>
            </div>

            <Link
              to="/student/leaderboard"
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl text-center font-medium transition"
            >
              View Rankings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;