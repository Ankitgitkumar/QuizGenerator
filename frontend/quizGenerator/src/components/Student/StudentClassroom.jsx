import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const StudentClassroom = () => {
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      } catch (err) {
        console.error("Error fetching classroom:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load classroom.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [navigate]);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading classroom...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <p className="text-red-400 mb-4">{error}</p>
        <Link
          to="/student/join-classroom"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Join a Classroom
        </Link>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <p className="text-gray-300 mb-4">No classroom found.</p>
        <Link
          to="/student/join-classroom"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Join a Classroom
        </Link>
      </div>
    );
  }

  const now = new Date();

  const quizzes = (classroom.quizzes || []).map((quiz) => {
    const scheduleDate = quiz.scheduleAt ? new Date(quiz.scheduleAt) : null;
    let status = "unscheduled";

    if (quiz.isScheduled) {
      if (!scheduleDate) status = "unscheduled";
      else if (scheduleDate > now) status = "upcoming";
      else status = "available";
    }

    return { ...quiz, status, scheduleDate };
  });

  const handleAttempt = (quizId) => {
    navigate(`/student/quiz/attempt/${quizId}`, {
      state: { type: "classroom" },
    });
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{classroom.name}</h1>
          <p className="text-gray-400">Code: {classroom.code}</p>
        </div>

        <Link
          to="/student/practice-quiz/available-quizzes"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          View Available Quizzes
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-gray-400">No quizzes assigned to this classroom yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-200">{quiz.topic}</h2>

              <p className="text-gray-400">
                Created: {new Date(quiz.createdAt).toLocaleString()}
              </p>

              <p className="text-gray-400">
                Scheduled: {quiz.scheduleDate ? quiz.scheduleDate.toLocaleString() : "Not scheduled"}
              </p>

              <p className="mt-2 text-sm">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    quiz.status === "available"
                      ? "text-green-400"
                      : quiz.status === "upcoming"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {quiz.status}
                </span>
              </p>

              <button
                onClick={() => handleAttempt(quiz._id)}
                disabled={quiz.status !== "available"}
                className={`mt-4 px-4 py-2 rounded text-white ${
                  quiz.status === "available"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-500 cursor-not-allowed"
                }`}
              >
                {quiz.status === "available" ? "Attempt Quiz" : "Not Available"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClassroom;