
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("teacherToken");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get('http://localhost:3141/api/v1/teacher/quizzes', {
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
      await axios.delete(`http://localhost:3141/api/v1/teacher/quiz/${id}`, {
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
    navigate(`/teacher/finalresults/${id}`); 
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="absolute top-4 right-4">
        <Link 
          to="/teacher/dashboard" 
          className="text-sm bg-gray-200 text-black font-semibold px-3 py-1 rounded hover:bg-gray-300"
        >
          Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-white mb-8">My Quizzes</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-xl shadow">
          <thead className="bg-gray-600 text-gray-300">
            <tr>
              <th className="py-3 px-6 text-left">Title</th>
              <th className="py-3 px-6 text-left">Topic</th>
              <th className="py-3 px-6 text-left">Created At</th>
              <th className="py-3 px-6 text-left">Scheduled</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz._id} className="border-t text-gray-200 hover:bg-gray-700">
                <td className="py-3 px-6">{quiz.title}</td>
                <td className="py-3 px-6">{quiz.topic}</td>
                <td className="py-3 px-6">{new Date(quiz.createdAt).toLocaleString()}</td>
                <td className="py-3 px-6">
                  {quiz.isScheduled ? (
                    <span className="text-green-400">
                      {new Date(quiz.scheduleAt).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-red-400">Not Scheduled</span>
                  )}
                </td>
                <td className="py-3 px-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEditSchedule(quiz._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    {quiz.isScheduled ? 'View' : 'Edit/Schedule'}
                  </button>

                  <button
                    onClick={() => handleDelete(quiz._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>

                  {quiz.isScheduled && quiz.isCompleted && (
                    <button
                      onClick={() => handleViewResults(quiz._id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Result
                    </button>
                  )}
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
