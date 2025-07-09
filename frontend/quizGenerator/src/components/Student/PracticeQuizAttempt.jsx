import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PracticeQuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions] = useState([
    {
      id: 1,
      question: "What is the capital of France?",
      type: "mcq",
      options: ["Paris", "Rome", "London", "Berlin"],
      answer: "Paris",
      hint: "It's known as the city of love.",
    },
    {
      id: 2,
      question: "What is 5 + 3?",
      type: "one-word",
      answer: "8",
      hint: "Simple addition.",
    },
  ]);

  const [responses, setResponses] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes 
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [blocked, setBlocked] = useState(false);
// for timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // for tab switch detection
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
    // Add event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (qid, value) => {
    setResponses((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = () => {
    navigate(`/student/practice-quiz/attempt/${id}/review`, { state: { questions, responses } });
  };

  const q = questions[current];

  return (

    <div className="relative">
    <div className={`min-h-screen text-white flex flex-col ${blocked ? "blur-sm pointer-events-none" : ""}`}>
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-400">📘 quiz</h1>
        <span className="bg-blue-700 px-4 py-1 rounded-full text-sm font-mono">{formatTime(timeLeft)}</span>
      </div>

      {/* Main Question Area */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-5xl mx-auto w-full">
        <h2 className="text-xl font-semibold mb-4">Q{current + 1}. {q.question}</h2>

        {q.type === "mcq" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options.map((opt) => (
              <label key={opt} className={`p-4 rounded-xl bg-gray-800 border border-gray-700 cursor-pointer ${responses[q.id] === opt ? "ring-2 ring-blue-400" : ""}`}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt}
                  checked={responses[q.id] === opt}
                  onChange={() => handleChange(q.id, opt)}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-700 rounded-full text-center leading-8 font-bold text-white">{opt[0]}</div>
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
            value={responses[q.id] || ""}
            onChange={(e) => handleChange(q.id, e.target.value)}
          />
        )} 
      </div>

      {/* Bottom Bar */}
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
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            ✅ Submit Quiz
          </button>
        )}
      </div>
    </div>
      {/* Warning notification */}
      {showWarning && (
        <div className="fixed top-6 right-6 bg-yellow-100 text-yellow-800 px-6 py-3 rounded shadow-lg z-50">
          ⚠️ You switched tabs! Attempt {tabSwitches}/3
        </div>
      )}

      {/* Disqualification modal */}
      {blocked && (
        <div className="fixed inset-0 bg-opacity-70 text-white flex flex-col items-center justify-center z-50">
          <h1 className="text-3xl font-bold mb-4">Quiz Blocked</h1>
          <p>You switched tabs 3 times. Your test is disqualified.</p>
        </div>
      )}
    </div>
  );
};

export default PracticeQuizAttempt;
