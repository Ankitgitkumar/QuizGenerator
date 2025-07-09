
import React, { useState } from 'react';

const GenerateQuiz = () => {
  const [topic, setTopic] = useState('');
  const [pdf, setPdf] = useState(null);
  const [quizGenerated, setQuizGenerated] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();

    if (!topic && !pdf) {
      alert("Enter topic or upload PDF");
      return;
    }

    // Simulate AI generation
    setTimeout(() => {
      setQuizGenerated(true);
    }, 1000); // simulate delay
  };

  return (
    <div className="min-h-screen  px-6 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Generate Quiz Using AI</h2>

      {!quizGenerated ? (
        <form
          onSubmit={handleGenerate}
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
