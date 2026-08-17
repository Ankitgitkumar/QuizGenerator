// File: src/components/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { logoutUser } from '../../utils/auth';

const StudentDashboard = () => {
  const [studentName, setStudentName] = useState('Student');
  const [hasClassroom, setHasClassroom] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const rawStudentData = localStorage.getItem('studentData');
    if (rawStudentData) {
      try {
        const parsedData = JSON.parse(rawStudentData);
        const fullName = `${parsedData?.firstName || ''} ${parsedData?.lastName || ''}`.trim();
        if (fullName) {
          setStudentName(fullName);
        }
      } catch (error) {
        console.error('Error parsing studentData:', error);
      }
    }

    const checkClassroom = async () => {
      const token = localStorage.getItem('studentToken');
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/classroom/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.classroom) {
          setHasClassroom(true);
        }
      } catch (err) {
        setHasClassroom(false);
      }
    };

    checkClassroom();
  }, []);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Welcome, <span className="text-indigo-650">{studentName}</span> 👋
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-semibold">
            Ready to join your classroom or practice quizzes today?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
        {/* Classroom Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 sm:p-8 flex flex-col justify-between min-h-[220px] hover:shadow-md transition duration-300">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {hasClassroom ? "My Classroom" : "Join a Classroom"}
            </h2>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              {hasClassroom 
                ? "Access tests assigned by your teacher, view scheduled quizzes, and check live leaderboards." 
                : "Enter your classroom code to join and access tests shared by your teacher."}
            </p>
          </div>

          <Link
            to={hasClassroom ? "/student/classroom" : "/student/join-classroom"}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-center font-bold text-sm transition shadow-xs cursor-pointer"
          >
            {hasClassroom ? "Go to Classroom" : "Join Classroom"}
          </Link>
        </div>

        {/* Practice Quiz */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 sm:p-8 flex flex-col justify-between min-h-[220px] hover:shadow-md transition duration-300">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Practice Quiz
            </h2>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Generate and attempt your own quizzes using AI to improve your preparation.
            </p>
          </div>

          <Link
            to="/student/practice-quiz"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-center font-bold text-sm transition shadow-xs cursor-pointer"
          >
            Practice Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;