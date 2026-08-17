import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config/api";
import QuizLeaderboardModal from "../Classroom/QuizLeaderboardModal";

const StudentClassroom = () => {
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedQuizTopic, setSelectedQuizTopic] = useState("");
  const [attemptedQuizIds, setAttemptedQuizIds] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const action = query.get("action");

  const [viewMode, setViewMode] = useState(action === "join" ? "join" : "class");
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    const fetchClassroom = async () => {
      const token = localStorage.getItem("studentToken");

      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/classroom/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setClassroom(res.data.classroom);
        setAttemptedQuizIds(res.data.attemptedQuizIds || []);
        setError(null);
        if (action !== "join") {
          setViewMode("class");
        }
      } catch (err) {
        console.error("Error fetching classroom:", err.response?.data || err.message);
        setClassroom(null);
        if (err.response?.status === 404) {
          setViewMode("join");
        } else {
          setError(err.response?.data?.message || "Failed to load classroom.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [navigate, action]);

  const handleJoin = async (e) => {
    e.preventDefault();
    const trimmedCode = joinCode.trim().toUpperCase();

    if (!trimmedCode) {
      toast.error("Please enter a classroom code");
      return;
    }

    const token = localStorage.getItem("studentToken");
    if (!token) {
      toast.error("Please sign in as a student first");
      navigate("/signin");
      return;
    }

    setJoinLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/classroom/join`,
        { code: trimmedCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("🎉 Joined classroom successfully!");
      setClassroom(res.data.classroom);
      setAttemptedQuizIds(res.data.attemptedQuizIds || []);
      setViewMode("class");
      setJoinCode("");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error;
      toast.error(msg || "Failed to join classroom. Please try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleAttempt = (quizId) => {
    navigate(`/student/quiz/attempt/${quizId}`, {
      state: { type: "classroom" },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-slate-600 text-sm">Loading classroom...</p>
        </div>
      </div>
    );
  }

  // If classroom is not loaded yet and no error, fallback to join mode
  const activeViewMode = (!classroom && !loading) ? "join" : viewMode;

  const now = new Date();
  const quizzes = classroom
    ? (classroom.quizzes || [])
        .map((quiz) => {
          const scheduleDate = quiz.scheduleAt ? new Date(quiz.scheduleAt) : null;
          const durationMin = quiz.duration || 30;
          let status = "unscheduled";

          if (quiz.isScheduled && scheduleDate) {
            const closingDate = new Date(scheduleDate.getTime() + durationMin * 60 * 1000);
            if (now < scheduleDate) {
              status = "upcoming";
            } else if (now >= scheduleDate && now <= closingDate) {
              status = "available";
            } else {
              status = "closed";
            }
          }

          return { ...quiz, status, scheduleDate };
        })
        .filter((quiz) => quiz.isScheduled && quiz.status !== "unscheduled")
    : [];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto fade-in">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {activeViewMode === "join" ? "🏫 Join Classroom" : classroom ? classroom.name : "Classroom"}
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            {activeViewMode === "join"
              ? "Enter your class code below to register in a new classroom."
              : classroom ? `Code: ${classroom.code}` : ""}
          </p>
        </div>

        {/* Dropdown to toggle: Joined Classroom vs Join New Classroom */}
        <div className="flex items-center gap-3">
          <select
            value={activeViewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {classroom && <option value="class">🏫 {classroom.name}</option>}
            <option value="join">➕ Join a Class</option>
          </select>
        </div>
      </div>

      {activeViewMode === "join" ? (
        /* Section to Join New Classroom */
        <div className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-3xl shadow-sm p-8 fade-in">
          <div className="text-4xl text-center mb-4 select-none">🏫</div>
          <h2 className="text-slate-900 text-2xl font-extrabold text-center mb-2">Classroom Registration</h2>
          <p className="text-slate-500 text-center text-xs font-semibold mb-8">
            Enter the code provided by your teacher
          </p>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Classroom Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={20}
                autoComplete="off"
                autoCapitalize="characters"
                className="w-full bg-white text-slate-900 text-center text-2xl font-bold tracking-[0.4em] border border-slate-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300 placeholder:text-base placeholder:tracking-normal transition"
              />
              <p className="text-slate-400 text-[11px] mt-2 text-center font-medium">
                Codes are case-insensitive
              </p>
            </div>

            <button
              type="submit"
              disabled={joinLoading || !joinCode.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {joinLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Classroom"
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Classroom details & assigned tests section */
        <>
          {quizzes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-semibold text-sm">
              No quizzes assigned to this classroom yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[200px]"
                >
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">{quiz.topic}</h2>
                    <p className="text-slate-400 text-xs font-semibold mb-3">
                      Scheduled: {quiz.scheduleDate ? quiz.scheduleDate.toLocaleString() : "Not scheduled"}
                    </p>

                    <div className="text-xs font-bold flex items-center gap-1.5 mb-4">
                      Status:{" "}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          quiz.status === "available"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                            : quiz.status === "upcoming"
                            ? "bg-amber-50 text-amber-800 border-amber-100"
                            : "bg-rose-50 text-rose-800 border-rose-100"
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAttempt(quiz._id)}
                      disabled={quiz.status !== "available" || attemptedQuizIds.includes(quiz._id)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition text-center ${
                        attemptedQuizIds.includes(quiz._id)
                          ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                          : quiz.status === "available"
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                          : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {attemptedQuizIds.includes(quiz._id) 
                        ? "Attempted" 
                        : quiz.status === "available" 
                        ? "Attempt Quiz" 
                        : quiz.status === "closed"
                        ? "Closed"
                        : "Not Available"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuizId(quiz._id);
                        setSelectedQuizTopic(quiz.topic);
                        setShowLeaderboard(true);
                      }}
                      className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs select-none"
                    >
                      🏆 Leaderboard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <QuizLeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => {
          setShowLeaderboard(false);
          setSelectedQuizId(null);
          setSelectedQuizTopic("");
        }}
        quizId={selectedQuizId}
        quizTopic={selectedQuizTopic}
      />
    </div>
  );
};

export default StudentClassroom;