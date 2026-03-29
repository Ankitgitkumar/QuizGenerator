import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const QuizAttempt = () => {
  const { quizid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // pass this from previous page:
  // navigate(`/student/quiz/attempt/${id}`, { state: { type: "practice" } })
  // navigate(`/student/quiz/attempt/${id}`, { state: { type: "classroom" } })
  const quizType = location.state?.type || "classroom";

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        const url =
          quizType === "practice"
            ? "https://quizgenerator-backend-vafs.onrender.com/api/v1/student/quizzes/practice/attempt"
            : "https://quizgenerator-backend-vafs.onrender.com/api/v1/student/quizzes/attempt";

        const res = await axios.post(
          url,
          { quizId: quizid },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setQuestions(res.data.Questions || []);
      } catch (err) {
        console.error("Fetch quiz error:", err.response?.data || err.message);
        alert(err.response?.data?.error || err.response?.data || "Failed to load quiz.");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizid, quizType, navigate]);

  useEffect(() => {
    if (loading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, questions.length]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const updated = prev + 1;
          if (updated >= 3) {
            setBlocked(true);
          } else {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
          }
          return updated;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (qid, value) => {
    setResponses((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
  if (submitting) return;
  setSubmitting(true);

  try {
    const token = localStorage.getItem("studentToken");

    const res = await axios.post(
      "https://quizgenerator-backend-vafs.onrender.com/api/v1/student/quizzes/submit",
      {
        quizId: quizid,
        responses,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ✅ GET questions from backend response
    const { score, total, questions: reviewQuestions } = res.data || {};

    navigate(`/student/quiz/attempt/${quizid}/review`, {
      state: {
        questions: reviewQuestions || [],   // ✅ FIXED
        responses,
        score,
        total,
        type: quizType,
      },
    });
  } catch (err) {
    console.error("Submit quiz error:", err.response?.data || err.message);
    alert(err.response?.data?.error || "Failed to submit quiz. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return <div className="text-white text-center mt-10">Loading quiz...</div>;
  }

  if (!questions.length) {
    return <div className="text-white text-center mt-10">No questions found.</div>;
  }

  const q = questions[current];

  return (
    <div className="relative">
      <div className={`min-h-screen text-white flex flex-col ${blocked ? "blur-sm pointer-events-none" : ""}`}>
        <div className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-md sticky top-0 z-10">
          <h1 className="text-xl font-bold text-blue-400">
            {quizType === "practice" ? "📘 Practice Quiz" : "🏫 Classroom Quiz"}
          </h1>
          <span className="bg-blue-700 px-4 py-1 rounded-full text-sm font-mono">
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 max-w-5xl mx-auto w-full">
          <h2 className="text-xl font-semibold mb-4">
            Q{current + 1}. {q.questionText}
          </h2>

          {q.type === "mcq" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt) => (
                <label
                  key={opt}
                  className={`p-4 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer ${
                    responses[q._id] === opt ? "ring-2 ring-blue-400" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    value={opt}
                    checked={responses[q._id] === opt}
                    onChange={() => handleChange(q._id, opt)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-700 rounded-full text-center leading-8 font-bold text-white">
                      {opt[0]}
                    </div>
                    <span>{opt}</span>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
              placeholder="Enter your answer"
              value={responses[q._id] || ""}
              onChange={(e) => handleChange(q._id, e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-md sticky bottom-0 z-10">
          <button
            onClick={() => setCurrent((prev) => prev - 1)}
            disabled={current === 0}
            className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          >
            ⬅️ Previous
          </button>

          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((prev) => prev + 1)}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Next ➡️
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-4 py-2 rounded text-white ${
                submitting ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>

      {showWarning && (
        <div className="fixed top-6 right-6 bg-yellow-100 text-yellow-800 px-6 py-3 rounded shadow-lg z-50">
          ⚠️ You switched tabs! Attempt {tabSwitches}/3
        </div>
      )}

      {blocked && (
        <div className="fixed inset-0 bg-opacity-70 text-white flex flex-col items-center justify-center z-50">
          <h1 className="text-3xl font-bold mb-4">Quiz Blocked</h1>
          <p>You switched tabs 3 times. Your test is disqualified.</p>
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;