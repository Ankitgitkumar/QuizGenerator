
import React from "react";
import { Link } from "react-router-dom";


const PracticeQuiz = () => {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto fade-in">
      <h1 className="text-3xl text-slate-900 font-extrabold text-center mb-10">Practice Quizzes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Link to="/student/practice-quiz/generate-quiz">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 hover:shadow-md hover:border-indigo-300 transition duration-200 h-full">
            <h2 className="text-lg font-bold mb-2 text-slate-850">Generate New Quiz</h2>
            <p className="text-slate-500 text-sm leading-relaxed">Use AI to generate and start a new customized quiz.</p>
          </div>
        </Link>

        <Link to="/student/practice-quiz/available-quizzes">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 hover:shadow-md hover:border-indigo-300 transition duration-200 h-full">
            <h2 className="text-lg font-bold mb-2 text-slate-850">Available Quizzes</h2>
            <p className="text-slate-500 text-sm leading-relaxed">Practice quizzes you’ve generated but not yet attempted.</p>
          </div>
        </Link>

        <Link to="/student/practice-quiz/history">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 hover:shadow-md hover:border-indigo-300 transition duration-200 h-full">
            <h2 className="text-lg font-bold mb-2 text-slate-850">Previous Attempts</h2>
            <p className="text-slate-500 text-sm leading-relaxed">View your past attempts, review answers, and check scores.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PracticeQuiz;
