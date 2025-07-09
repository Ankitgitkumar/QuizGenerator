import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PracticeQuizReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions, responses } = location.state || {};

  if (!questions || !responses) {
    return (
      <div className="text-center mt-20 text-red-500">
        No review data found. Please attempt a quiz first.
      </div>
    );
  }

  const getStatus = (question) => {
    const userAnswer = responses[question.id];
    if (!userAnswer) return "unanswered";
    return userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
      ? "correct"
      : "incorrect";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "correct":
        return "bg-green-100 text-green-800";
      case "incorrect":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen  px-4 py-10">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">
          Quiz Review
        </h2>

        {questions.map((q, index) => {
          const status = getStatus(q);
          const userAnswer = responses[q.id];

          return (
            <div
              key={q.id}
              className={`mb-6 p-4 border rounded-md ${getStatusColor(status)}`}
            >
              <p className="font-semibold text-black mb-2">
                Q{index + 1}. {q.question}
              </p>

              {q.type === "mcq" && (
                <ul className="list-disc ml-6 mb-2 text-sm">
                  {q.options.map((opt) => (
                    <li
                      key={opt}
                      className={`${
                        opt === q.answer
                          ? "font-bold underline"
                          : opt === userAnswer
                          ? "italic"
                          : ""
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}

              {q.type === "one-word" && (
                <p className="text-sm">
                  <strong>Correct Answer:</strong> {q.answer}
                </p>
              )}

              <p className="text-sm mt-1">
                <strong>Your Answer:</strong>{" "}
                {userAnswer ? userAnswer : <span className="italic">Not attempted</span>}
              </p>
              <p className="text-sm mt-1">
                <strong>Status:</strong>{" "}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
            </div>
          );
        })}

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/student/practice-quiz")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Practice Quizzes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeQuizReview;
