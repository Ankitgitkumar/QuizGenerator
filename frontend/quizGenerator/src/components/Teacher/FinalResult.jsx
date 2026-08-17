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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto fade-in bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">📋 Final Results</h1>
          <p className="text-slate-500 mt-1 text-sm font-semibold">Quiz: General Knowledge | Total Questions: 10</p>
        </div>
        <Link 
          to="/teacher/myquizzes" 
          className="text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition shadow-2xs"
        >
          ← Back to Quizzes
        </Link>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-500 uppercase text-xs font-semibold tracking-wider text-center">
              <th className="py-4 px-6">Rank</th>
              <th className="py-4 px-6">Student</th>
              <th className="py-4 px-6">Score</th>
              <th className="py-4 px-6">Correct</th>
              <th className="py-4 px-6">Incorrect</th>
              <th className="py-4 px-6">Time Taken</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {finalResults.map((res, idx) => (
              <tr key={idx} className="text-slate-700 hover:bg-slate-50/80 transition duration-150 text-center border-b border-slate-100 last:border-b-0">
                <td className="py-4 px-6 text-sm font-bold text-slate-950">{idx + 1}</td>
                <td className="py-4 px-6 text-sm font-semibold text-slate-700">{res.name}</td>
                <td className="py-4 px-6 text-sm font-extrabold text-emerald-600">{res.score}</td>
                <td className="py-4 px-6 text-sm text-slate-600 font-semibold">{res.correct}</td>
                <td className="py-4 px-6 text-sm text-slate-600 font-semibold">{res.incorrect}</td>
                <td className="py-4 px-6 text-sm text-slate-500">{res.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="mt-8 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition"
        onClick={() => window.print()}
      >
        🖨️ Print / Save as PDF
      </button>
    </div>
  );
};

export default FinalResult;
