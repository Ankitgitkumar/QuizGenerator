import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config/api";
import QuizLeaderboardModal from "../Classroom/QuizLeaderboardModal";

const QuizAttempt = () => {
  const { quizid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const quizType = location.state?.type || "practice";

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [reportTimeout, setReportTimeout] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const lastSwitchRef = useRef(0);
  const disqualifiedRef = useRef(false);
  const responsesRef = useRef(responses);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  // Full screen listener
  useEffect(() => {
    const checkFullScreen = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullScreen(isFull);
    };

    document.addEventListener("fullscreenchange", checkFullScreen);
    document.addEventListener("webkitfullscreenchange", checkFullScreen);
    document.addEventListener("mozfullscreenchange", checkFullScreen);
    document.addEventListener("MSFullscreenChange", checkFullScreen);

    // Initial check
    checkFullScreen();

    return () => {
      document.removeEventListener("fullscreenchange", checkFullScreen);
      document.removeEventListener("webkitfullscreenchange", checkFullScreen);
      document.removeEventListener("mozfullscreenchange", checkFullScreen);
      document.removeEventListener("MSFullscreenChange", checkFullScreen);
    };
  }, []);

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error("Error enabling full screen:", err);
      });
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  // Fetch Quiz & Setup Timer
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        const url =
          quizType === "practice"
            ? `${API_BASE_URL}/student/quizzes/practice/attempt`
            : `${API_BASE_URL}/student/quizzes/attempt`;

        const res = await axios.post(
          url,
          { quizId: quizid },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const durationMin = res.data.duration || 10;
        const storageKey = `quiz_end_${quizid}`;
        const storedEnd = localStorage.getItem(storageKey);

        if (storedEnd) {
          const remainingSec = Math.round((parseInt(storedEnd) - Date.now()) / 1000);
          if (remainingSec <= 0) {
            toast.error("Time limit exceeded for this test attempt!");
            setTimeLeft(0);
            setQuestions(res.data.Questions || []);
            // Auto submit with empty responses since time is up
            handleSubmitDirect(res.data.Questions || [], {});
            return;
          } else {
            setTimeLeft(remainingSec);
          }
        } else {
          const durationSec = durationMin * 60;
          localStorage.setItem(storageKey, (Date.now() + durationSec * 1000).toString());
          setTimeLeft(durationSec);
        }

        setQuestions(res.data.Questions || []);
      } catch (err) {
        console.error("Fetch quiz error:", err.response?.data || err.message);
        toast.error(err.response?.data?.error || err.response?.data || "Failed to load quiz.");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizid, quizType, navigate]);

  // Handle automatic submission on mount if time expired
  const handleSubmitDirect = async (qs, currentResponses) => {
    setSubmitting(true);
    localStorage.removeItem(`quiz_end_${quizid}`);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await axios.post(
        `${API_BASE_URL}/student/quizzes/submit`,
        {
          quizId: quizid,
          responses: currentResponses,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { score, total, questions: reviewQuestions } = res.data || {};
      navigate(`/student/quiz/attempt/${quizid}/review`, {
        state: {
          questions: reviewQuestions || [],
          responses: currentResponses,
          score,
          total,
          type: quizType,
        },
      });
    } catch (err) {
      console.error("Direct submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Timer Tick Hook
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

  const handleDisqualify = async () => {
    if (disqualifiedRef.current) return;
    disqualifiedRef.current = true;
    setBlocked(true);
    localStorage.removeItem(`quiz_end_${quizid}`);
    const token = localStorage.getItem("studentToken");
    if (!token) return;

    try {
      await axios.post(
        `${API_BASE_URL}/student/quizzes/submit`,
        {
          quizId: quizid,
          responses: responsesRef.current,
          disqualified: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.error("You have been disqualified for switching tabs!");
    } catch (err) {
      console.error("Disqualification submission failed:", err);
    }
  };

  // Visibility and Blur Listeners for defocus warning
  useEffect(() => {
    const handleDefocusOrVisibility = () => {
      if (disqualifiedRef.current) return;
      // Debounce events within 500ms to avoid double triggers (tab change fires visibilitychange & blur)
      const now = Date.now();
      if (now - lastSwitchRef.current < 500) return;
      lastSwitchRef.current = now;

      setTabSwitches((prev) => {
        const updated = prev + 1;
        if (updated >= 3) {
          handleDisqualify();
        } else {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3500);
        }
        return updated;
      });
    };

    document.addEventListener("visibilitychange", handleDefocusOrVisibility);
    window.addEventListener("blur", handleDefocusOrVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleDefocusOrVisibility);
      window.removeEventListener("blur", handleDefocusOrVisibility);
    };
  }, [quizid]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (qid, value) => {
    const updatedResponses = { ...responses, [qid]: value };
    setResponses(updatedResponses);

    // Clear previous timeout if user is typing/clicking fast
    if (reportTimeout) {
      clearTimeout(reportTimeout);
    }

    // Debounce the server updates by 800ms to prevent triggering API rate limits
    const timeout = setTimeout(() => {
      try {
        const token = localStorage.getItem("studentToken");
        axios.post(
          `${API_BASE_URL}/student/quizzes/ongoing-score`,
          {
            quizId: quizid,
            responses: updatedResponses,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch((e) => console.debug("Error reporting ongoing score:", e));
      } catch (err) {
        console.warn("Ongoing score reporting skipped:", err);
      }
    }, 800);

    setReportTimeout(timeout);
  };

  const handleSubmit = async () => {
    if (submitting || disqualifiedRef.current) return;
    disqualifiedRef.current = true;
    setSubmitting(true);
    localStorage.removeItem(`quiz_end_${quizid}`);

    try {
      const token = localStorage.getItem("studentToken");

      const res = await axios.post(
        `${API_BASE_URL}/student/quizzes/submit`,
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

      const { score, total, questions: reviewQuestions } = res.data || {};

      navigate(`/student/quiz/attempt/${quizid}/review`, {
        state: {
          questions: reviewQuestions || [],
          responses,
          score,
          total,
          type: quizType,
        },
      });
    } catch (err) {
      console.error("Submit quiz error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-slate-600 text-sm">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-700 mb-4">No questions found.</h2>
        <button onClick={() => navigate('/student/dashboard')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Blocker if NOT in full screen mode (only show if not blocked or loading)
  if (!isFullScreen && !blocked) {
    return (
      <div className="fixed inset-0 bg-slate-950 backdrop-blur-md text-white flex flex-col items-center justify-center z-50 p-6 text-center">
        <div className="text-6xl mb-4 select-none animate-pulse">🖥️</div>
        <h1 className="text-3xl font-extrabold mb-2 text-indigo-400">Full Screen Mode Required</h1>
        <p className="text-slate-300 text-sm max-w-md leading-relaxed mt-2 font-medium">
          To continue this proctored quiz, your browser must be in full screen mode.
          Exiting full screen is not permitted during the test.
        </p>
        <button
          onClick={enterFullScreen}
          className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-md cursor-pointer select-none"
        >
          Enter Full Screen
        </button>
      </div>
    );
  }

  const q = questions[current];
  const inputStyle =
    "w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium text-sm";

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto fade-in">
      {/* Header Info */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">
              Question {current + 1} of {questions.length}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1 select-none animate-fade-in">
              Practice Test Session
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Live Leaderboard Button */}
            {quizType === "classroom" && (
              <button
                onClick={() => setShowLeaderboard(true)}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs select-none"
              >
                🏆 Live Ranks
              </button>
            )}

            {/* Countdown Timer */}
            <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-2xs flex items-center gap-1.5 border select-none ${
              timeLeft < 60
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Question view */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden min-h-[360px] flex flex-col justify-between">
        <div className="p-6 sm:p-8">
          <h2 className="text-slate-800 text-lg font-bold leading-relaxed mb-6 select-none">
            {q.questionText}
          </h2>

          <div className="space-y-3.5">
            {q.type === "mcq" ? (
              (q.options || []).map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border transition duration-200 cursor-pointer select-none ${
                    responses[q._id] === opt
                      ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 font-semibold"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/20 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    value={opt}
                    checked={responses[q._id] === opt}
                    onChange={() => handleChange(q._id, opt)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-350 cursor-pointer"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={responses[q._id] || ""}
                  onChange={(e) => handleChange(q._id, e.target.value)}
                  className={inputStyle}
                  autoComplete="off"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer controls inside quiz */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-slate-200 shadow-2xs sticky bottom-0 z-20">
          <button
            onClick={() => setCurrent((prev) => prev - 1)}
            disabled={current === 0}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer text-white ${
                submitting ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>

      {showWarning && (
        <div className="fixed top-24 right-6 bg-amber-50 border border-amber-200 text-amber-800 px-6 py-3.5 rounded-xl shadow-lg z-50 font-bold text-xs animate-bounce shadow-amber-200/30 animate-pulse">
          ⚠️ Tab switch or window switch detected! Warning {tabSwitches}/3
        </div>
      )}

      {blocked && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md text-white flex flex-col items-center justify-center z-50 p-6 text-center">
          <div className="text-6xl mb-4 select-none">🚫</div>
          <h1 className="text-3xl font-extrabold mb-2 text-red-500">Quiz Disqualified</h1>
          <p className="text-slate-300 text-sm max-w-sm leading-relaxed mt-2 font-medium">
            You have switched tabs or windows 3 times. To protect the integrity of the test, this attempt has been blocked.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      )}

      <QuizLeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        quizId={quizid}
        quizTopic="Live Ranks"
      />
    </div>
  );
};

export default QuizAttempt;