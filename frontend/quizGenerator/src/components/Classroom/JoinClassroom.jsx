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
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Join Classroom</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Classroom Code"
        className="border p-2 w-full mb-2"
        required
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Joining..." : "Join"}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </form>
  );
};

export default JoinClassroom;
