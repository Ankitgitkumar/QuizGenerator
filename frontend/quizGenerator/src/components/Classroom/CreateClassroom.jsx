
import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const CreateClassroom = ({ teacherId, onCreated }) => {
  const [name, setName] = useState("");
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
      const payload = { name, teacherId };
      if (code.trim()) payload.code = code.trim();
      const res = await axios.post(`${API_BASE_URL}/classroom/create`, payload);
      setSuccess(`Classroom created! Code: ${res.data.code}`);
      setName("");
      setCode("");
      if (onCreated) onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating classroom");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm w-full max-w-md mx-auto flex flex-col gap-5">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Create Classroom</h2>
      
      <div>
        <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">Classroom Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Science Class 10A"
          className="border border-slate-300 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-slate-900 transition text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">Classroom Code (optional)</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. SCI10A (or leave blank to generate)"
          className="border border-slate-300 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full text-slate-900 transition text-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition duration-200 text-sm shadow-xs cursor-pointer"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating...
          </span>
        ) : "Create"}
      </button>
      {error && <div className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2 mt-2 text-xs font-semibold">{error}</div>}
      {success && <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 mt-2 text-xs font-semibold">{success}</div>}
    </form>
  );
};

export default CreateClassroom;
