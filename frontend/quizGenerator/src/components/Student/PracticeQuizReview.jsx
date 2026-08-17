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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto bg-slate-50 text-slate-800 fade-in">
      <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-6">Quiz Review</h1>

      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 max-w-xs mx-auto text-center mb-8">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Your Score</span>
        <div className="text-5xl font-black text-indigo-600">
          {res.score}
        </div>
        <div className="text-slate-400 text-xs font-bold mt-1.5">
          out of {res.total || res.questions.length} questions
        </div>
      </div>

      <div className="space-y-6">
        {res.questions.map((q, i) => {
          const userAns = getUserAnswer(q, i);
          const status = getStatus(q, i);

          return (
            <div
              key={q._id || i}
              className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-4 leading-snug">
                Q{i + 1}. {q.questionText}
              </h2>

              {q.type === "mcq" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(q.options || []).map((opt, optIdx) => {
                    const isSelected = userAns === opt;
                    const isCorrect = opt === q.correctAnswer;

                    let bgClass = "border-slate-200 bg-white text-slate-600";
                    let bubbleClass = "bg-slate-100 text-slate-500 border border-slate-200";

                    if (isCorrect) {
                      bgClass = "border-emerald-300 bg-emerald-50/70 text-emerald-800 font-bold";
                      bubbleClass = "bg-emerald-600 text-white";
                    } else if (isSelected) {
                      bgClass = "border-rose-350 bg-rose-50/70 text-rose-800 font-bold";
                      bubbleClass = "bg-rose-600 text-white";
                    }

                    return (
                      <div
                        key={opt}
                        className={`p-4 rounded-xl border flex items-center gap-3 transition text-sm ${bgClass}`}
                      >
                        <div className={`w-8 h-8 rounded-full text-center leading-8 font-bold text-xs select-none ${bubbleClass}`}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <p
                    className={`p-3 rounded-xl inline-block font-semibold text-xs border ${
                      status === "correct" 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                  >
                    Your answer: {userAns || "Not answered"}
                  </p>
                </div>
              )}

              {status === "wrong" && (
                <div className="mt-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold">
                  Correct Answer: <span className="underline font-bold">{q.correctAnswer || "Not available"}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={() => {
            if (res.type === "classroom") {
              navigate("/student/classroom");
            } else {
              navigate("/student/dashboard");
            }
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition text-sm cursor-pointer"
        >
          {res.type === "classroom" ? "Back to Classroom" : "Back to Dashboard"}
        </button>
      </div>
    </div>
  );
};

export default PracticeQuizReview;