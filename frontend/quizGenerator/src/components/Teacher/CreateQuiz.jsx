import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

const parseError = (error) => {
  const status = error?.status || error?.response?.status;
  const data = error?.data || error?.response?.data;
  if (status === 429) return "You've hit the rate limit. Please wait an hour before generating another quiz.";
  if (status === 401) return "Session expired. Please sign in again.";
  if (status === 413) return "PDF file is too large. Maximum size is 10MB.";
  if (!error?.response && !error?.data) return "Cannot reach server. Check your internet connection.";
  if (data?.details?.length) return data.details.map((d) => `• ${d.message}`).join('\n');
  return data?.error || data?.message || "Quiz generation failed. Please try again.";
};

const STEPS = [
  { label: "Quiz Details", icon: "📝" },
  { label: "AI Settings", icon: "🤖" },
  { label: "Schedule", icon: "📅" },
];

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const defaultSchedule = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };
  const [startTime, setStartTime] = useState(defaultSchedule);
  const [duration, setDuration] = useState(30);

  // Fake progress ticker during AI generation
  const startProgressTicker = () => {
    setLoadingProgress(0);
    const id = setInterval(() => {
      setLoadingProgress((p) => {
        if (p >= 90) { clearInterval(id); return p; }
        return p + Math.random() * 8;
      });
    }, 800);
    return id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Quiz title is required"); return; }
    if (!topic.trim() && !pdf) { toast.error("Enter a topic or upload a PDF"); return; }
    if (numQuestions < 1 || numQuestions > 50) { toast.error("Number of questions must be between 1 and 50"); return; }

    const token = localStorage.getItem("teacherToken");
    if (!token) { toast.error("Session expired. Please sign in."); navigate("/signin"); return; }

    setLoading(true);
    const tickerId = startProgressTicker();

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("topic", topic.trim());
      formData.append("numberOfQuestions", numQuestions);
      formData.append("duration", duration);
      formData.append("scheduleAt", startTime);
      formData.append("useRag", pdf ? "true" : "false");
      if (pdf) formData.append("pdf", pdf);

      const res = await fetch(`${API_BASE_URL}/teacher/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json") ? await res.json() : await res.text();

      if (!res.ok) {
        clearInterval(tickerId);
        setLoading(false);
        const msg = parseError({ status: res.status, data });
        toast.error(msg, { duration: 6000 });
        return;
      }

      if (res.status === 202) {
        clearInterval(tickerId);
        setLoadingProgress(80);
        const quizId = data.quizId;

        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`${API_BASE_URL}/teacher/quiz/${quizId}/status`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              if (statusData.status === "ready") {
                clearInterval(pollInterval);
                setLoadingProgress(100);
                toast.success("🎉 Quiz created and generated successfully!");
                setTimeout(() => {
                  setLoading(false);
                  setLoadingProgress(0);
                  navigate("/teacher/myquizzes");
                }, 600);
              } else if (statusData.status === "failed") {
                clearInterval(pollInterval);
                setLoading(false);
                setLoadingProgress(0);
                toast.error("AI failed to generate quiz questions. Please try again.");
              }
            }
          } catch (err) {
            console.error("Polling error:", err);
          }
        }, 2000);

        return;
      }

      clearInterval(tickerId);
      setLoadingProgress(100);
      toast.success("🎉 Quiz created successfully!");
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        navigate("/teacher/myquizzes");
      }, 600);
    } catch (error) {
      clearInterval(tickerId);
      setLoading(false);
      setLoadingProgress(0);
      toast.error(parseError(error), { duration: 6000 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm w-full px-6 fade-in">
          {/* Animated brain/AI icon */}
          <div className="text-5xl mb-6 animate-bounce">🤖</div>
          <h2 className="text-slate-900 text-2xl font-bold mb-2">Generating Your Quiz</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {pdf
              ? "Indexing your PDF and building questions with AI..."
              : `Creating ${numQuestions} questions about "${topic}" with Gemini AI...`}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-indigo-600 transition-all duration-700"
              style={{ width: `${Math.min(loadingProgress, 98)}%` }}
            />
          </div>
          <p className="text-slate-400 text-xs font-semibold">
            {loadingProgress < 30 ? "Connecting to Gemini AI..." :
             loadingProgress < 60 ? "Building questions..." :
             loadingProgress < 85 ? "Polishing answers..." :
             "Almost done..."}
          </p>

          <p className="text-slate-400 text-[11px] mt-6">This usually takes 10–30 seconds</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 transition";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 fade-in">
      {/* Top nav */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-6">
        <Link to="/teacher/dashboard" className="text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 text-sm font-semibold transition">
          ← Back to Dashboard
        </Link>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">AI Quiz Generator</span>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-8">
          <h1 className="text-slate-900 text-3xl font-extrabold text-center mb-1">Create New Quiz</h1>
          <p className="text-slate-400 text-center text-xs font-medium mb-8">Powered by Gemini 2.5 Flash AI</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Title */}
            <div>
              <label className={labelClass}>Quiz Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Python Fundamentals Quiz"
                className={inputClass}
              />
            </div>

            {/* Topic */}
            <div>
              <label className={labelClass}>
                Topic / Subject
                <span className="text-slate-400 font-normal ml-2 text-xs">(or upload a PDF below)</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Machine Learning, World War II, React hooks..."
                className={inputClass}
              />
            </div>

            {/* PDF Upload */}
            <div>
              <label className={labelClass}>Upload PDF (optional — enables RAG)</label>
              <div className={`${inputClass} cursor-pointer flex items-center gap-3 ${pdf ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-300 hover:border-slate-400"}`}
                onClick={() => document.getElementById("pdf-input").click()}>
                <span className="text-lg">{pdf ? "📄" : "📎"}</span>
                <span className={pdf ? "text-emerald-800 text-sm font-medium" : "text-slate-400 text-sm"}>
                  {pdf ? pdf.name : "Click to upload a PDF file"}
                </span>
                {pdf && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPdf(null); }}
                    className="ml-auto text-red-600 hover:text-red-700 text-xs font-bold">✕ Remove</button>
                )}
              </div>
              <input id="pdf-input" type="file" accept=".pdf" className="hidden"
                onChange={(e) => setPdf(e.target.files[0] || null)} />
            </div>

            {/* 2-column: Questions + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Number of Questions <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className={inputClass}
                />
                <p className="text-slate-400 text-[11px] mt-1 font-medium">Max 50 questions</p>
              </div>
              <div>
                <label className={labelClass}>Duration (minutes) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={inputClass}
                />
                <p className="text-slate-400 text-[11px] mt-1 font-medium">Max 300 minutes</p>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className={labelClass}>Schedule Start Time <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={startTime}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setStartTime(e.target.value)}
                className={`${inputClass} [color-scheme:light]`}
              />
              <p className="text-slate-400 text-[11px] mt-1 font-medium">Students can attempt after this time</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:scale-[1.01] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🚀</span>
              Generate Quiz with AI
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
