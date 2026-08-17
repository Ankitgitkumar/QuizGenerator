import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const AssignQuiz = ({ classroomId, quizzes, onAssigned }) => {
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_BASE_URL}/classroom/assign-quiz`, { classroomId, quizId: selectedQuiz });
      setSuccess("Quiz assigned!");
      if (onAssigned) onAssigned(selectedQuiz);
    } catch (err) {
      setError(err.response?.data?.message || "Error assigning quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAssign} className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm w-full max-w-md mx-auto flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Assign Quiz to Classroom</h2>
      <select
        value={selectedQuiz}
        onChange={(e) => setSelectedQuiz(e.target.value)}
        className="border border-slate-300 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-slate-900 transition text-sm mb-2"
        required
      >
        <option value="">Select a quiz</option>
        {quizzes.map((q) => (
          <option key={q._id} value={q._id}>{q.title}</option>
        ))}
      </select>
      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition duration-200 text-sm shadow-xs cursor-pointer" disabled={loading}>
        {loading ? "Assigning..." : "Assign"}
      </button>
      {error && <div className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2 mt-2 text-xs font-semibold">{error}</div>}
      {success && <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 mt-2 text-xs font-semibold">{success}</div>}
    </form>
  );
};

export default AssignQuiz;
