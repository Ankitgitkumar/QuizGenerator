

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from "../../config/api";

const QuizView = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editQuizMode, setEditQuizMode] = useState(false); 
  const [editingQuestionId, setEditingQuestionId] = useState(null); 
  const [questionFormData, setQuestionFormData] = useState({ 
    questionText: '',
    type: 'mcq',
    options: [''], 
    correctAnswer: '',
  });

  const [quizFormData, setQuizFormData] = useState({ 
    title: '',
    topic: '',
    duration: '',
    scheduleAt: '',
    isScheduled: false,
  });

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [assignStatus, setAssignStatus] = useState(null);

  const token = localStorage.getItem("teacherToken");

  
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("Authentication token not found. Redirecting to login.");
        navigate('/signin');
        return;
      }
      if (!id) {
        setError("No quiz ID provided.");
        setLoading(false);
        return;
      }

      try {
        // Fetch quiz details
        const res = await axios.get(`${API_BASE_URL}/teacher/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedQuiz = res.data.quiz;
        setQuiz(fetchedQuiz);

        setQuizFormData({
          title: fetchedQuiz.title,
          topic: fetchedQuiz.topic,
          duration: fetchedQuiz.duration || '',
          scheduleAt: fetchedQuiz.scheduleAt ? new Date(fetchedQuiz.scheduleAt).toISOString().slice(0, 16) : '',
          isScheduled: fetchedQuiz.isScheduled,
        });

        setEditQuizMode(!fetchedQuiz.isScheduled);

        // Fetch teacher classrooms for assignment
        const meRes = await axios.get(`${API_BASE_URL}/teacher/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const teacherId = meRes.data._id;
        const classroomRes = await axios.get(`${API_BASE_URL}/classroom/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClassrooms(classroomRes.data || []);
      } catch (err) {
        console.error('Error fetching quiz or classrooms:', err);
        setLoading(false);
        if (err.response) {
          if (err.response.status === 404) setError("Quiz not found.");
          else if (err.response.status === 401) {
            setError("Unauthorized to view this quiz. Please log in.");
            localStorage.removeItem("teacherToken");
            navigate('/teacher/login');
          } else setError(`Failed to load quiz: ${err.response.status} ${err.response.statusText}`);
        } else setError("Network error or server unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, navigate]);

  
  const handleQuizInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveQuizDetails = async () => {
    if (!token) { toast.error("Please log in to save changes."); navigate('/signin'); return; }
    if (quiz.isScheduled) { toast.error("Cannot edit quiz details once it has been scheduled."); return; }

    try {
      const updateData = {
        title: quizFormData.title,
        topic: quizFormData.topic,
        duration: parseInt(quizFormData.duration),
      };
      await axios.patch(`${API_BASE_URL}/teacher/quiz/${id}`, updateData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Quiz details updated successfully!");
      setQuiz(prev => ({ ...prev, ...updateData }));
      setEditQuizMode(false);
    } catch (err) {
      console.error("Failed to update quiz details:", err);
      toast.error(`Failed to update quiz details: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAssignQuiz = async () => {
    if (!token) { toast.error("Please log in to assign quizzes."); navigate('/signin'); return; }
    if (!selectedClassroom) { toast.error("Select a classroom first."); return; }

    try {
      await axios.post(
        `${API_BASE_URL}/classroom/assign-quiz`,
        { classroomId: selectedClassroom, quizId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAssignStatus({ type: 'success', message: 'Quiz assigned successfully!' });
    } catch (err) {
      console.error('Failed to assign quiz:', err);
      setAssignStatus({ type: 'error', message: err.response?.data?.message || 'Failed to assign quiz' });
    }
  };

  const handleScheduleQuiz = async () => {
    if (!token) { toast.error("Please log in to schedule the quiz."); navigate('/signin'); return; }
    if (!quizFormData.scheduleAt) { toast.error("Please select a date and time to schedule the quiz."); return; }

    try {
        await axios.patch(`${API_BASE_URL}/teacher/quiz/${id}/schedule`, { scheduleAt: quizFormData.scheduleAt }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Quiz scheduled successfully!");
        setQuiz(prev => ({ ...prev, scheduleAt: new Date(quizFormData.scheduleAt), isScheduled: true }));
        setQuizFormData(prev => ({ ...prev, isScheduled: true }));
        setEditQuizMode(false);
    } catch (err) {
        console.error("Failed to schedule quiz:", err);
        toast.error(`Failed to schedule quiz: ${err.response?.data?.message || err.message}`);
    }
  };



  const handleEditQuestionClick = (questionToEdit) => {
    setEditingQuestionId(questionToEdit._id);
    setQuestionFormData({
      questionText: questionToEdit.questionText,
      type: questionToEdit.type,
      options: questionToEdit.options && questionToEdit.options.length > 0 ? [...questionToEdit.options] : [''],
      correctAnswer: questionToEdit.correctAnswer,
    });
  };

  const handleQuestionFormChange = (e, index = null) => {
    const { name, value, type } = e.target;

    if (name === 'options') {
      const newOptions = [...questionFormData.options];
      newOptions[index] = value;
      setQuestionFormData(prev => ({ ...prev, options: newOptions }));
    } else {
      setQuestionFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addOption = () => {
    setQuestionFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (indexToRemove) => {
    setQuestionFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSaveQuestion = async () => {
    if (!token) { toast.error("Please log in to save question."); navigate('/signin'); return; }
    if (!editingQuestionId) { toast.error("No question selected for editing."); return; }

    try {
        const dataToSend = {
            ...questionFormData,
            quizId: id, // Pass quizId for backend authorization check
        };

        // Basic validation before sending
        if (dataToSend.type === 'mcq') {
            if (dataToSend.options.length < 2 || dataToSend.options.some(opt => opt.trim() === '')) {
                toast.error("MCQ questions must have at least two non-empty options.");
                return;
            }
            if (!dataToSend.options.includes(dataToSend.correctAnswer)) {
                toast.error("Correct answer for MCQ must be one of the provided options.");
                return;
            }
        } else if (dataToSend.type === 'one-line') {
            if (dataToSend.correctAnswer.trim() === '') {
                toast.error("One-line questions must have a correct answer.");
                return;
            }
        }

        const res = await axios.patch(`${API_BASE_URL}/teacher/question/${editingQuestionId}`, dataToSend, {
            headers: { Authorization: `Bearer ${token}` }
        });

        toast.success("Question updated successfully!");
        // Update the quiz state with the modified question
        setQuiz(prevQuiz => ({
            ...prevQuiz,
            questions: prevQuiz.questions.map(q =>
                q._id === editingQuestionId ? { ...q, ...res.data.question } : q // Use res.data.question for updated data
            ),
        }));
        setEditingQuestionId(null); // Exit edit mode for this question
    } catch (err) {
        console.error("Failed to update question:", err);
        toast.error(`Failed to update question: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestionId(null); // Exit edit mode
    setQuestionFormData({ // Reset form data
      questionText: '',
      type: 'mcq',
      options: [''],
      correctAnswer: '',
    });
  };

  if (loading) return <div className="p-10 text-white text-center text-xl">Loading quiz...</div>;
  if (error) {
    return (
      <div className="p-10 bg-gray-900 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl text-red-500 mb-4">{error}</h2>
        <button onClick={() => navigate('/teacher/myquizzes')} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300">Back to My Quizzes</button>
      </div>
    );
  }
  if (!quiz || !quiz.questions) {
      return (
          <div className="p-10 bg-gray-900 min-h-screen text-white text-center text-xl">
              No quiz data or questions available.
              <button onClick={() => navigate('/teacher/myquizzes')} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300">Back to My Quizzes</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-900 text-white">
      {/* Quiz Details / Edit Form */}
      <div className="mb-8 text-center">
        {editQuizMode ? (
            <>
                <input type="text" name="title" value={quizFormData.title} onChange={handleQuizInputChange} className="text-4xl font-extrabold mb-2 bg-gray-700 text-white p-2 rounded w-full max-w-lg" />
                <input type="text" name="topic" value={quizFormData.topic} onChange={handleQuizInputChange} className="text-xl text-gray-400 bg-gray-700 p-2 rounded w-full max-w-lg mt-2" />
                 <input type="number" name="duration" value={quizFormData.duration} onChange={handleQuizInputChange} placeholder="Duration in minutes" className="text-md text-gray-500 bg-gray-700 p-2 rounded w-full max-w-xs mt-2" />
                <div className="mt-4">
                    <button onClick={handleSaveQuizDetails} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300 mr-2">Save Changes</button>
                    <button onClick={() => setEditQuizMode(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-300">Cancel</button>
                </div>
            </>
        ) : (
            <>
                <h1 className="text-4xl font-extrabold mb-2">{quiz.title}</h1>
                <p className="text-xl text-gray-400">Topic: {quiz.topic}</p>
                <p className="text-md text-gray-500">Created: {new Date(quiz.createdAt).toLocaleString()}</p>
                {quiz.duration && (<p className="text-md text-gray-500">Duration: {quiz.duration} minutes</p>)}
                <p className="text-md text-gray-500 mt-2">
                    Status: {quiz.isScheduled ? (
                        <span className="text-green-400">Scheduled for {new Date(quiz.scheduleAt).toLocaleString()}</span>
                    ) : (
                        <span className="text-red-400">Not Scheduled</span>
                    )}
                </p>
                {!quiz.isScheduled && (
                    <div className="mt-4 flex flex-col items-center">
                        <label htmlFor="scheduleAt" className="mb-2 text-gray-300">Schedule Date & Time:</label>
                        <input type="datetime-local" id="scheduleAt" name="scheduleAt" value={quizFormData.scheduleAt} onChange={handleQuizInputChange} className="p-2 rounded bg-gray-700 text-white mb-3" />
                        <button onClick={handleScheduleQuiz} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300">Schedule Quiz</button>
                    </div>
                )}
                {!quiz.isScheduled && (
                    <button onClick={() => setEditQuizMode(true)} className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-md transition duration-300">Edit Details</button>
                )}
            </>
        )}
      </div>

      {/* Assign quiz to classroom */}
      <div className="mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-3">Assign this quiz to a classroom</h2>
        {classrooms.length === 0 ? (
          <p className="text-gray-400 mb-3">
            You don't have any classrooms yet. Create one from your dashboard to assign quizzes.
          </p>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full md:w-2/3 p-2 rounded bg-gray-700 text-white border border-gray-600"
            >
              <option value="">Select a classroom</option>
              {classrooms.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.code ? `(${c.code})` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignQuiz}
              className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              Assign Quiz
            </button>
          </div>
        )}
        {assignStatus && (
          <p className={`mt-3 ${assignStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {assignStatus.message}
          </p>
        )}
      </div>

      <h2 className="text-3xl font-bold mb-6 text-white text-center">Questions</h2>
      <div className="space-y-8">
        {quiz.questions.length === 0 ? (
            <p className="text-gray-400 text-center text-lg">No questions found for this quiz yet.</p>
        ) : (
            quiz.questions.map((q, index) => (
                <div key={q._id || index} className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                    
                    {editingQuestionId === q._id ? (
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">Question Type:</label>
                                <select
                                    name="type"
                                    value={questionFormData.type}
                                    onChange={handleQuestionFormChange}
                                    className="block w-full p-2 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="mcq">Multiple Choice</option>
                                    <option value="one-line">One Line Answer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">Question Text:</label>
                                <textarea
                                    name="questionText"
                                    value={questionFormData.questionText}
                                    onChange={handleQuestionFormChange}
                                    className="block w-full p-2 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                />
                            </div>

                            {questionFormData.type === 'mcq' && (
                                <div>
                                    <label className="block text-gray-300 text-sm font-bold mb-2">Options:</label>
                                    {questionFormData.options.map((option, optIndex) => (
                                        <div key={optIndex} className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                name="options"
                                                value={option}
                                                onChange={(e) => handleQuestionFormChange(e, optIndex)}
                                                className="flex-grow p-2 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mr-2"
                                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                            />
                                            {questionFormData.options.length > 1 && (
                                                <button
                                                    onClick={() => removeOption(optIndex)}
                                                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={addOption}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md mt-2"
                                    >
                                        Add Option
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">Correct Answer:</label>
                                {questionFormData.type === 'mcq' ? (
                                    <select
                                        name="correctAnswer"
                                        value={questionFormData.correctAnswer}
                                        onChange={handleQuestionFormChange}
                                        className="block w-full p-2 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Correct Option</option>
                                        {questionFormData.options.map((option, optIndex) => (
                                            <option key={optIndex} value={option}>{String.fromCharCode(65 + optIndex)}. {option}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        name="correctAnswer"
                                        value={questionFormData.correctAnswer}
                                        onChange={handleQuestionFormChange}
                                        className="block w-full p-2 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter the correct answer"
                                    />
                                )}
                            </div>

                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    onClick={handleSaveQuestion}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
                                >
                                    Save Question
                                </button>
                                <button
                                    onClick={handleCancelQuestionEdit}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        
                        <>
                            <h3 className="text-xl font-semibold text-blue-400 mb-4 flex justify-between items-center">
                                <span>Q{index + 1}: {q.questionText}</span>
                                {/* Edit Button - only if quiz is NOT scheduled */}
                                {!quiz.isScheduled && (
                                    <button
                                        onClick={() => handleEditQuestionClick(q)}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm ml-4"
                                    >
                                        Edit
                                    </button>
                                )}
                            </h3>

                            {q.type === 'mcq' && q.options && q.options.length > 0 && (
                                <ul className="space-y-3 text-white">
                                    {q.options.map((opt, i) => (
                                        <li key={i} className={`px-4 py-2 rounded-lg border-2 ${q.correctAnswer === opt ? 'bg-green-700 border-green-500 text-white font-medium' : 'border-gray-600 hover:bg-gray-700'}`}>
                                            {String.fromCharCode(65 + i)}. {opt}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {q.type === 'one-line' && (
                                <div className="mt-4 p-4 rounded-lg border-2 border-green-500 bg-green-900 bg-opacity-30 text-white">
                                    <p className="font-semibold text-lg">Correct Answer:</p>
                                    <p className="ml-2">{q.correctAnswer}</p>
                                </div>
                            )}
                            {q.type === 'mcq' && (!q.options || q.options.length === 0) && (
                                <p className="text-red-400">Warning: No options found for this MCQ.</p>
                            )}
                        </>
                    )}
                </div>
            ))
        )}
      </div>

      <button onClick={() => navigate('/teacher/myquizzes')} className="mt-10 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-300">Back to My Quizzes</button>
    </div>
  );
};

export default QuizView;