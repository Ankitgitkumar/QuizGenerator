
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const AvailableQuizzes = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("studentToken");

  useEffect(()=>{
    const res=axios.get("http://localhost:3141/api/v1/student/quizzes/available", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      
    })
    .then((res) => {
      setQuizzes(res.data || []);
    })
  },[])
  const [quizzes, setQuizzes] = useState([
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
            <div key={quiz._id} className="bg-gray-800 rounded-xl shadow p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-200">{quiz.topic}</h3>
                <p className="text-sm text-gray-400">Created: {quiz.createdAt}</p>
                {quiz.score !== null && (
                  <p className="text-green-600 font-semibold mt-1">Score: {quiz.score}/10</p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleAttempt(quiz._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {quiz.score !== null ? 'Attempt' : 'Attempt'}
                </button>
                <button
                  onClick={() => handleDelete(quiz._id)}
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
