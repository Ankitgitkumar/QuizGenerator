
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from "../../config/api";

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("teacherToken");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/teacher/quizzes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setQuizzes(res.data);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      }
    };
    fetchQuizzes();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this quiz?");
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/teacher/quiz/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleEditSchedule = (id) => {
    navigate(`/teacher/quiz/${id}`); 
  };

  const handleViewResults = (id) => {
    navigate(`/teacher/quiz/${id}/results`);
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto fade-in">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Quizzes</h1>

      <div className="overflow-x-auto bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created At</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quizzes.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 px-6 text-center text-slate-400 font-semibold text-sm">
                  No quizzes found. Create one with AI to get started!
                </td>
              </tr>
            ) : quizzes.map((quiz) => (
              <tr key={quiz._id} className="text-slate-700 hover:bg-slate-50/80 transition duration-150">
                <td className="py-4 px-6 text-sm font-bold text-slate-900">{quiz.title}</td>
                <td className="py-4 px-6 text-sm font-semibold text-slate-600">{quiz.topic}</td>
                <td className="py-4 px-6 text-sm text-slate-500">{new Date(quiz.createdAt).toLocaleString()}</td>
                <td className="py-4 px-6 text-sm">
                  {quiz.isScheduled ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold">
                      {new Date(quiz.scheduleAt).toLocaleString()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-100 text-xs font-bold">
                      Not Scheduled
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEditSchedule(quiz._id)}
                      className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
                    >
                      {quiz.isScheduled ? 'View Details' : 'Edit / Schedule'}
                    </button>

                    {quiz.isScheduled && (
                      <button
                        onClick={() => handleViewResults(quiz._id)}
                        className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
                      >
                        View Results
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyQuizzes;
