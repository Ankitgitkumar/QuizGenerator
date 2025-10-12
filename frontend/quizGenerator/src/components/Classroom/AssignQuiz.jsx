import React, { useState } from "react";
import axios from "axios";

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
  await axios.post("http://localhost:3141/api/classroom/assign-quiz", { classroomId, quizId: selectedQuiz });
      setSuccess("Quiz assigned!");
      if (onAssigned) onAssigned(selectedQuiz);
    } catch (err) {
      setError(err.response?.data?.message || "Error assigning quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAssign} className="p-4 bg-white rounded shadow w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Assign Quiz to Classroom</h2>
      <select
        value={selectedQuiz}
        onChange={(e) => setSelectedQuiz(e.target.value)}
        className="border p-2 w-full mb-2"
        required
      >
        <option value="">Select a quiz</option>
        {quizzes.map((q) => (
          <option key={q._id} value={q._id}>{q.title}</option>
        ))}
      </select>
      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Assigning..." : "Assign"}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </form>
  );
};

export default AssignQuiz;
