
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GenerateQuiz = () => {
  const [topic, setTopic] = useState('');
  const [pdf, setPdf] = useState(null);
  const [quizGenerated, setQuizGenerated] = useState(false);
   const [loading, setLoading] = useState(false);
const navigate = useNavigate();
   const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();
  formData.append("topic", topic);
  if (pdf) formData.append("pdf", pdf);

  const token = localStorage.getItem("studentToken");

  const res = await fetch("http://localhost:3141/api/v1/student/quizzes/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json(); 

  setLoading(false);

  if (!res.ok) {
    alert(data.error || "Something went wrong");
    return;
  }



  alert("Quiz Created Successfully!");
  navigate(`/student/practice-quiz/attempt/${data.quizId}`); 
  setQuizGenerated(true);
};

 if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Creating Quiz...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  px-6 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Generate Quiz Using AI</h2>

      {!quizGenerated ? (
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-gray-800 p-6 rounded-xl shadow space-y-4"
        >
          <input
            type="text"
            placeholder="Topic (e.g. Photosynthesis)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPdf(e.target.files[0])}
            className="w-full"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate Quiz
          </button>
        </form>
      ) : (
        <div className="max-w-xl mx-auto text-center mt-10">
          <h3 className="text-xl font-semibold text-green-600 mb-4">
            Quiz generated successfully!
          </h3>
          <div className="flex justify-center gap-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
              Start Now
            </button>
            <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
              Attempt Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateQuiz;
