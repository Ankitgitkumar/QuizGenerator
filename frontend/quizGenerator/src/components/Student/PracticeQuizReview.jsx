import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PracticeQuizReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const res = location.state;

  if (!res || !res.questions || !res.responses) {
    navigate("/student/dashboard");
    return null;
  }

  const getUserAnswer = (q, i) => {
    if (q._id && res.responses[q._id] !== undefined) {
      return res.responses[q._id];
    }

    const v = Object.values(res.responses || {});
    return v[i];
  };

  const getStatus = (q, i) => {
    const userAns = getUserAnswer(q, i);

    if (userAns === undefined || userAns === null || userAns === "") {
      return "wrong";
    }

    if (q.type === "mcq") {
      return userAns === q.correctAnswer ? "correct" : "wrong";
    }

    const u = String(userAns || "").trim().toLowerCase();
    const c = String(q.correctAnswer || "").trim().toLowerCase();

    return u === c ? "correct" : "wrong";
  };

  return (
    <div className="min-h-screen text-white bg-gray-900 px-4 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">📋 Review</h1>

      <div className="p-4 my-5 text-4xl text-green-400 text-center font-bold">
        {res.score}/{res.total || res.questions.length}
      </div>

      <div className="space-y-8">
        {res.questions.map((q, i) => {
          const userAns = getUserAnswer(q, i);
          const status = getStatus(q, i);

          return (
            <div
              key={q._id || i}
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-lg font-semibold mb-4">
                Q{i + 1}. {q.questionText}
              </h2>

              {q.type === "mcq" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(q.options || []).map((opt) => {
                    const isSelected = userAns === opt;
                    const isCorrect = opt === q.correctAnswer;

                    return (
                      <div
                        key={opt}
                        className={`p-4 rounded-xl border ${
                          isCorrect
                            ? "border-green-600 bg-green-900"
                            : isSelected
                            ? "border-red-600 bg-red-900"
                            : "border-gray-700 bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full text-center leading-8 font-bold bg-gray-700">
                            {opt[0]}
                          </div>
                          <span>{opt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <p
                    className={`p-3 rounded bg-gray-700 inline-block ${
                      status === "correct" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    Your answer: {userAns || "Not answered"}
                  </p>
                </div>
              )}

              {status === "wrong" && (
                <p className="mt-3 text-sm text-yellow-400">
                  Correct Answer: {q.correctAnswer || "Not available"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate("/student/dashboard")}
          className="bg-blue-600 hover:cursor-pointer p-2 mt-10 rounded-lg font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PracticeQuizReview;