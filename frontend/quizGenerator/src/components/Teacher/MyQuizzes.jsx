import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: 'Math Quiz', topic: 'Algebra', createdAt: '2025-07-03' },
    { id: 2, title: 'Science Quiz', topic: 'Physics', createdAt: '2025-07-01' },
    { id: 3, title: 'History Quiz', topic: 'World War II', createdAt: '2025-06-28' },
  ]);

  const handleDelete = (id) => {
    const confirmed = confirm("Are you sure you want to delete this quiz?");
    if (confirmed) setQuizzes(quizzes.filter(q => q.id !== id));
  };
  const Navigate = useNavigate();

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="absolute top-4 right-4">
    <Link 
      to="/dashboard" 
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
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="border-t text-gray-200 hover:bg-gray-700">
                <td className="py-3 px-6">{quiz.title}</td>
                <td className="py-3 px-6">{quiz.topic}</td>
                <td className="py-3 px-6">{quiz.createdAt}</td>
                <td className="py-3 px-6 flex gap-3">
                  <Link to={`/quiz/${quiz.id}`}>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">View</button>
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                  <button onClick={() => {Navigate('/finalresults')}} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Result</button>
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
