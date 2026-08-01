import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem("teacherToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/teacher/quiz/${id}/results`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setResults(res.data.results || []);
      } catch (err) {
        console.error("Error fetching quiz results:", err);
        setError(err.response?.data?.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate]);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => navigate("/teacher/myquizzes")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Back to My Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="absolute top-4 right-4">
        <Link
          to="/teacher/myquizzes"
          className="text-sm bg-gray-200 text-black font-semibold px-3 py-1 rounded hover:bg-gray-300"
        >
          Back to Quizzes
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-white mb-6">Quiz Results</h1>

      {results.length === 0 ? (
        <p className="text-gray-400">No submissions yet for this quiz.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-xl shadow">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="py-3 px-6 text-left">#</th>
                <th className="py-3 px-6 text-left">Student</th>
                <th className="py-3 px-6 text-left">Score</th>
                <th className="py-3 px-6 text-left">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, idx) => {
                const student = item.studentId || {};
                const name = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email || "Unknown";
                return (
                  <tr key={item._id || idx} className="border-t text-gray-200 hover:bg-gray-700">
                    <td className="py-3 px-6">{idx + 1}</td>
                    <td className="py-3 px-6">{name}</td>
                    <td className="py-3 px-6 font-semibold text-green-400">{item.score}</td>
                    <td className="py-3 px-6">{new Date(item.attemptedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuizResults;
