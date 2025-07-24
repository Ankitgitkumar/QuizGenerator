import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const mockData = [
  { name: 'Rohan Verma', score: 80 },
  { name: 'Anjali Mehta', score: 95 },
  { name: 'Aman Singh', score: 70 },
  { name: 'Sana Sheikh', score: 92 },
  { name: 'Neha Das', score: 85 },
];

const Leaderboard = () => {
  const [students, setStudents] = useState([]);

  // Simulate real-time updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...mockData]
        .map((s) => ({ ...s, score: s.score + Math.floor(Math.random() * 5) }))
        .sort((a, b) => b.score - a.score);
      setStudents(shuffled);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
      <h1 className="text-3xl font-bold text-white mb-4">📊 Live Leaderboard</h1>
      <p className="text-gray-400 mb-6 text-lg">Quiz: General Knowledge | Status: Ongoing</p>

      <div className="overflow-x-auto border-2 border-gray-500  bg-gray-800">
        <table className="min-w-full  rounded-xl shadow">
          <thead className=" text-white bg-gray-900">
            <tr>
              <th className="py-3 px-6 text-left">Rank</th>
              <th className="py-3 px-6 text-left">Student Name</th>
              <th className="py-3 px-6 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index} className="border-t text-white hover:bg-gray-700">
                <td className="py-3 px-6">{index + 1}</td>
                <td className="py-3 px-6">{student.name}</td>
                <td className="py-3 px-6 font-semibold text-blue-600">{student.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
