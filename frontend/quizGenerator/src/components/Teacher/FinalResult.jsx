import React from 'react';
import { Link } from 'react-router-dom';

const finalResults = [
  { name: 'Anjali Mehta', score: 90, correct: 9, incorrect: 1, time: '3m 20s' },
  { name: 'Rohan Verma', score: 85, correct: 8, incorrect: 2, time: '3m 50s' },
  { name: 'Sana Sheikh', score: 75, correct: 7, incorrect: 3, time: '4m 10s' },
  { name: 'Neha Das', score: 65, correct: 6, incorrect: 4, time: '5m 00s' },
];

const FinalResult = () => {
  return (
    <div className="min-h-screen border-2  px-6 py-10">
      <div className="absolute top-4 right-4">
    <Link 
      to="/teacher/myquizzes" 
      className="text-sm bg-gray-200 text-black font-semibold px-3 py-1 rounded hover:bg-gray-300"
    >
      Back
    </Link>
    </div>
      <h1 className="text-3xl font-bold text-white mb-2">📋 Final Results</h1>
      <p className="text-gray-300 mb-6">Quiz: General Knowledge | Total Questions: 10</p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-xl shadow">
          <thead className="bg-gray-800 text-gray-200">
            <tr>
              <th className="py-3 px-6">Rank</th>
              <th className="py-3 px-6">Student</th>
              <th className="py-3 px-6">Score</th>
              <th className="py-3 px-6">Correct</th>
              <th className="py-3 px-6">Incorrect</th>
              <th className="py-3 px-6">Time Taken</th>
            </tr>
          </thead>
          <tbody>
            {finalResults.map((res, idx) => (
              <tr key={idx} className="border-t text-center text-gray-300">
                <td className="py-3 px-6">{idx + 1}</td>
                <td className="py-3 px-6">{res.name}</td>
                <td className="py-3 px-6 font-bold text-green-600">{res.score}</td>
                <td className="py-3 px-6">{res.correct}</td>
                <td className="py-3 px-6">{res.incorrect}</td>
                <td className="py-3 px-6">{res.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="mt-8 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        onClick={() => window.print()}
      >
        🖨️ Print / Save as PDF
      </button>
    </div>
  );
};

export default FinalResult;
