import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const quizData = {
  1: {
    title: 'Math Quiz',
    topic: 'Algebra',
    questions: [
      {
        question: 'What is 2 + 2?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2,
      },
      {
        question: 'Solve: x + 3 = 5. Find x.',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1,
      },
    ],
  },
  2: {
    title: 'Science Quiz',
    topic: 'Physics',
    questions: [
      {
        question: 'What is the unit of force?',
        options: ['Watt', 'Newton', 'Joule', 'Pascal'],
        correctAnswer: 1,
      },
    ],
  },
};

const QuizView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const quiz = quizData[id];

  if (!quiz) {
    return (
      <div className="p-10">
        <h2 className="text-xl text-red-500">Quiz not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen  px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{quiz.title}</h1>
        <p className="text-white text-lg">Topic: {quiz.topic}</p>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, index) => (
          <div key={index} className="border-2 border-gray-500  bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Q{index + 1}: {q.question}
            </h3>
            <ul className="space-y-2 text-white">
              {q.options.map((opt, i) => (
                <li
                  key={i}
                  className={`px-4 py-2 rounded border ${
                    i === q.correctAnswer ? ' bg-gray-900 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/myquizzes')}
        className="mt-8 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Back to My Quizzes
      </button>
    </div>
  );
};

export default QuizView;
