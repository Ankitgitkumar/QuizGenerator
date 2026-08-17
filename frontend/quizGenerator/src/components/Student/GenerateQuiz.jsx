
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from "../../config/api";

const GenerateQuiz = () => {
  const [topic, setTopic] = useState('');
  const [pdf, setPdf] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("topic", topic);
    formData.append("numberOfQuestions", numberOfQuestions);
    if (pdf) formData.append("pdf", pdf);

  const token = localStorage.getItem("studentToken");

  const res = await fetch(`${API_BASE_URL}/student/quizzes/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json(); 

  setLoading(false);

  if (!res.ok) {
    toast.error(data.error || "Something went wrong");
    return;
  }



  toast.success("Quiz created successfully!");
  navigate(`/student/quiz/attempt/${data.quizId}`, {
  state: { type: "practice" },
});
  setQuizGenerated(true);
};

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-slate-600 text-sm">Generating Quiz with AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto fade-in bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/student/practice-quiz')}
          className="text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 text-sm font-semibold transition cursor-pointer"
        >
          ← Back to Practice
        </button>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">AI Practice Quiz</span>
      </div>

      <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-8">Generate Quiz Using AI</h2>

      {!quizGenerated ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Topic / Subject</label>
            <input
              type="text"
              placeholder="e.g. Photosynthesis, Trigonometry, World War I"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Number of Questions</label>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition font-medium"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Upload Reference PDF (optional)</label>
            <div className={`w-full bg-white text-slate-900 border rounded-xl px-4 py-3 cursor-pointer flex items-center gap-3 ${pdf ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-300 hover:border-slate-400"}`}
              onClick={() => document.getElementById("pdf-input").click()}>
              <span className="text-lg">{pdf ? "📄" : "📎"}</span>
              <span className={pdf ? "text-emerald-850 text-sm font-bold truncate max-w-[200px]" : "text-slate-400 text-sm"}>
                {pdf ? pdf.name : "Click to upload a PDF file"}
              </span>
              {pdf && (
                <button type="button" onClick={(e) => { e.stopPropagation(); setPdf(null); }}
                  className="ml-auto text-red-650 hover:text-red-700 text-xs font-bold">✕ Remove</button>
              )}
            </div>
            <input id="pdf-input" type="file" accept=".pdf" className="hidden"
              onChange={(e) => setPdf(e.target.files[0] || null)} />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-xs cursor-pointer text-center text-sm"
          >
            Generate Quiz
          </button>
        </form>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center mt-10">
          <h3 className="text-xl font-bold text-emerald-600 mb-4">
            ✓ Quiz generated successfully!
          </h3>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/student/practice-quiz/available-quizzes')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer shadow-xs transition"
            >
              Start Now
            </button>
            <button 
              onClick={() => navigate('/student/practice-quiz')}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer shadow-2xs transition"
            >
              Attempt Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateQuiz;
