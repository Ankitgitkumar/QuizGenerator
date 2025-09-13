import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PracticeQuizReview = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const res = location.state;

  if (!res || !res.questions || !res.responses) {
    navigate("/student/dashboard");
    return null;
  }

  const getStatus = (q) => {
    const userAns = res.responses[q._id];
    if (q.type === "mcq") return userAns === q.correctAnswer ? "correct" : "wrong";
    return userAns?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? "correct" : "wrong";
  };

  const  handleNext =async()=>{
     const token = localStorage.getItem("studentToken");

await axios.post(
  "https://quiz-generator-znsi.vercel.app/api/v1/student/quizzes/submit",
  {
    responses:res.responses,
    questions:res.questions,
    score:res.score,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);


    navigate("/student/dashboard");
  }

  return (
    <div className="min-h-screen text-white bg-gray-900 px-4 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">📋 Review</h1>
      <div className="p-4 my-5 text-4xl text-green-400 text-center font-bold">{res.score}/10</div>
      <div className="space-y-8 ">
        {res.questions.map((q, i) => (
          <div key={q._id} className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Q{i + 1}. {q.questionText}</h2>
            {q.type === "mcq" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt) => {
                  const isSelected = res.responses[q._id] === opt;
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <div key={opt} className={`p-4 rounded-xl border ${isCorrect ? "border-green-600 bg-green-900" : isSelected ? "border-red-600 bg-red-900" : "border-gray-700 bg-gray-800"}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full text-center leading-8 font-bold bg-gray-700">{opt[0]}</div>
                        <span>{opt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <p className={`p-3 rounded bg-gray-700 inline-block ${getStatus(q) === "correct" ? "text-green-400" : "text-red-400"}`}>
                  Your answer: {res.responses[q._id] || "Not answered"}
                </p>
              </div>
            )}
            {getStatus(q) === "wrong" && (
              <p className="mt-3 text-sm text-yellow-400">Correct Answer: {q.correctAnswer}</p>
            )}
          </div>
        ))}
      </div>
      <div className="flex  justify-center">
        <button  onClick={() => navigate("/student/practice-quiz")} className="bg-blue-600 hover:cursor-pointer p-2 mt-10  rounded-lg font-bold" >Back to Dashboard</button>
      </div>
    </div>
  );
};

export default PracticeQuizReview;
