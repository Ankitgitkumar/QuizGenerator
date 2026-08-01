
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
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md mx-auto flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Create Classroom</h2>
      <label className="text-gray-700 font-medium">Classroom Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter classroom name"
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
        required
      />
      <label className="text-gray-700 font-medium">Classroom Code (optional)</label>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter code or leave blank to auto-generate"
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition duration-200"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            Creating...
          </span>
        ) : "Create"}
      </button>
      {error && <div className="text-red-600 bg-red-100 rounded px-3 py-2 mt-2 text-sm">{error}</div>}
      {success && <div className="text-green-600 bg-green-100 rounded px-3 py-2 mt-2 text-sm">{success}</div>}
    </form>
  );
};

export default CreateClassroom;
