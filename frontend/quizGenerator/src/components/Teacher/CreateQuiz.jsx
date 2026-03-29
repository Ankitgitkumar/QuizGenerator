import React, { useState } from "react";
import { Link } from "react-router-dom";

const CreateQuiz = () => {
  
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(30); // Default duration in minutes


  // Handle form submission
  // This function will send the quiz data to the backend
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();
  formData.append("title", title);
  formData.append("topic", topic);
  formData.append("numberOfQuestions", numQuestions); 
  formData.append("duration",duration);
  formData.append("scheduleAt",startTime);

  if (pdf) formData.append("pdf", pdf);

  const token = localStorage.getItem("teacherToken"); // Get token from localStorage

  const res = await fetch("https://quizgenerator-backend-vafs.onrender.com/api/v1/teacher/quizzes/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const contentType = res.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await res.json() : await res.text();

  setLoading(false);

  if (!res.ok) {
    alert(data.error || data || "Something went wrong");
    return;
  }

  alert("Quiz Created Successfully!");
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Creating Quiz...</div>
      </div>
    );
  }



  return (
        <>
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">  
        <div className="absolute top-4 right-4">
    <Link 
      to="/teacher/dashboard" 
      className="text-sm bg-gray-200 text-black font-semibold px-3 py-1 rounded hover:bg-gray-300"
    >
      Dashboard
    </Link>
  </div>
    <div className="max-w-2xl mx-auto p-8 rounded-xl mt-10 z-10 text-white  bg-gray-800 shadow-lg border-gray-500 ">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Create New Quiz</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Topic (used by AI)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Number of Questions"
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <input
          type="datetime-local"
          placeholder="Start Time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
         type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
         placeholder="Duration in minutes"
         className="w-full p-2 border rounded"
        required
        />

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setPdf(e.target.files[0])}

          className="w-full"
        />
        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: loading ? "#4A5568" : "#2B6C2F" }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Quiz
        </button>
      </form>
    </div>
    </div>
    </>
  );
};

export default CreateQuiz;
