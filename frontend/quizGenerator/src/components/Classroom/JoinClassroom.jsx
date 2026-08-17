import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const JoinClassroom = ({ studentId, onJoined }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${API_BASE_URL}/classroom/join`, { code, studentId });
      setSuccess("Joined classroom!");
      setCode("");
      if (onJoined) onJoined(res.data.classroom);
    } catch (err) {
      setError(err.response?.data?.message || "Error joining classroom");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm w-full max-w-md mx-auto flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Join Classroom</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Classroom Code"
        className="border border-slate-300 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-slate-900 transition text-sm mb-2"
        required
      />
      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition duration-200 text-sm shadow-xs cursor-pointer" disabled={loading}>
        {loading ? "Joining..." : "Join"}
      </button>
      {error && <div className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2 mt-2 text-xs font-semibold">{error}</div>}
      {success && <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 mt-2 text-xs font-semibold">{success}</div>}
    </form>
  );
};

export default JoinClassroom;
