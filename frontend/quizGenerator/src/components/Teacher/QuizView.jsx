

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from "../../config/api";
import QuizLeaderboardModal from '../Classroom/QuizLeaderboardModal';

const QuizView = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [editQuizMode, setEditQuizMode] = useState(false); 
  const [isRescheduling, setIsRescheduling] = useState(false);
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
        toast.success(isRescheduling ? "Quiz rescheduled successfully!" : "Quiz scheduled successfully!");
        setQuiz(prev => ({ ...prev, scheduleAt: new Date(quizFormData.scheduleAt), isScheduled: true }));
        setQuizFormData(prev => ({ ...prev, isScheduled: true }));
        setIsRescheduling(false);
        setEditQuizMode(false);
    } catch (err) {
        console.error("Failed to schedule quiz:", err);
        toast.error(`Failed to schedule/reschedule quiz: ${err.response?.data?.message || err.message}`);
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-slate-600 text-sm">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
        <button onClick={() => navigate('/teacher/myquizzes')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition">
          Back to My Quizzes
        </button>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-700 mb-4">No quiz data or questions available.</h2>
        <button onClick={() => navigate('/teacher/myquizzes')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition">
          Back to My Quizzes
        </button>
      </div>
    );
  }

  const inputStyle = "w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm";
  const labelStyle = "block text-xs font-bold text-slate-700 mb-1.5";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto fade-in">
      {/* Quiz Details / Edit Form */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        {editQuizMode ? (
          <div className="space-y-4 max-w-xl mx-auto">
            <div>
              <label className={labelStyle}>Quiz Title</label>
              <input type="text" name="title" value={quizFormData.title} onChange={handleQuizInputChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Topic</label>
              <input type="text" name="topic" value={quizFormData.topic} onChange={handleQuizInputChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Duration (minutes)</label>
              <input type="number" name="duration" value={quizFormData.duration} onChange={handleQuizInputChange} placeholder="Duration in minutes" className={inputStyle} />
            </div>
            <div className="pt-2 flex gap-3 justify-end">
              <button onClick={() => setEditQuizMode(false)} className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition text-sm cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveQuizDetails} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{quiz.title}</h1>
            <p className="text-base text-slate-600 font-semibold mb-1">Topic: {quiz.topic}</p>
            <p className="text-xs text-slate-400 font-medium mb-1">Created: {new Date(quiz.createdAt).toLocaleString()}</p>
            {quiz.duration && (<p className="text-xs text-slate-400 font-medium mb-4">Duration: {quiz.duration} minutes</p>)}
            
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm font-semibold">
                Status: {quiz.isScheduled ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold select-none">
                      Scheduled for {new Date(quiz.scheduleAt).toLocaleString()}
                    </span>
                    {!isRescheduling && (
                      <button
                        onClick={() => setIsRescheduling(true)}
                        className="px-3 py-1 border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 font-bold rounded-lg text-xs transition cursor-pointer select-none"
                      >
                        Reschedule Test
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-100 text-xs font-bold select-none">
                    Not Scheduled
                  </span>
                )}
              </div>

              {(!quiz.isScheduled || isRescheduling) && (
                <div className="w-full max-w-xs border border-slate-200 rounded-2xl p-4 bg-slate-50/50 mt-2">
                  <label htmlFor="scheduleAt" className="block text-xs font-bold text-slate-600 mb-2 text-left">
                    {isRescheduling ? "Reschedule Date & Time:" : "Schedule Date & Time:"}
                  </label>
                  <input type="datetime-local" id="scheduleAt" name="scheduleAt" value={quizFormData.scheduleAt} onChange={handleQuizInputChange} className={`${inputStyle} mb-3`} />
                  <div className="flex gap-2">
                    <button onClick={handleScheduleQuiz} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs">
                      {isRescheduling ? "Update Schedule" : "Schedule Quiz"}
                    </button>
                    {isRescheduling && (
                      <button 
                        onClick={() => setIsRescheduling(false)} 
                        className="px-3 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2.5 justify-center mt-3">
                {!quiz.isScheduled && (
                  <button onClick={() => setEditQuizMode(true)} className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl text-sm transition cursor-pointer">
                    Edit Title / Details
                  </button>
                )}
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-800 font-bold rounded-xl text-sm transition cursor-pointer flex items-center gap-1 shadow-2xs select-none"
                >
                  🏆 View Leaderboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assign quiz to classroom */}
      <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-200/85 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Assign Quiz to Classroom</h2>
        {classrooms.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium">
            You don't have any classrooms yet. Create one from your dashboard to assign quizzes.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full sm:w-2/3 p-2.5 rounded-xl bg-white text-slate-900 border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
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
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs cursor-pointer transition"
            >
              Assign Quiz
            </button>
          </div>
        )}
        {assignStatus && (
          <p className={`mt-3 text-sm font-bold ${assignStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {assignStatus.type === 'success' ? '✓' : '⚠'} {assignStatus.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Quiz Questions</h2>
        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">{quiz.questions.length} Items</span>
      </div>

      <div className="space-y-6">
        {quiz.questions.length === 0 ? (
          <p className="text-slate-400 text-center py-6 font-semibold bg-white border border-slate-200 rounded-2xl text-sm">
            No questions found for this quiz yet.
          </p>
        ) : (
          quiz.questions.map((q, index) => (
            <div key={q._id || index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              {editingQuestionId === q._id ? (
                <div className="space-y-4">
                  <div>
                    <label className={labelStyle}>Question Type:</label>
                    <select
                      name="type"
                      value={questionFormData.type}
                      onChange={handleQuestionFormChange}
                      className={inputStyle}
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="one-line">One Line Answer</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Question Text:</label>
                    <textarea
                      name="questionText"
                      value={questionFormData.questionText}
                      onChange={handleQuestionFormChange}
                      className={`${inputStyle} resize-none`}
                      rows="3"
                    />
                  </div>

                  {questionFormData.type === 'mcq' && (
                    <div>
                      <label className={labelStyle}>Options:</label>
                      <div className="space-y-2">
                        {questionFormData.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              name="options"
                              value={option}
                              onChange={(e) => handleQuestionFormChange(e, optIndex)}
                              className="flex-grow bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 outline-none text-sm"
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            />
                            {questionFormData.options.length > 1 && (
                              <button
                                onClick={() => removeOption(optIndex)}
                                className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 p-2 rounded-xl text-xs font-bold"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addOption}
                        className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-xl mt-3 text-xs font-bold cursor-pointer"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  <div>
                    <label className={labelStyle}>Correct Answer:</label>
                    {questionFormData.type === 'mcq' ? (
                      <select
                        name="correctAnswer"
                        value={questionFormData.correctAnswer}
                        onChange={handleQuestionFormChange}
                        className={inputStyle}
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
                        className={inputStyle}
                        placeholder="Enter the correct answer"
                      />
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={handleCancelQuestionEdit}
                      className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveQuestion}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
                    >
                      Save Question
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      Q{index + 1}: {q.questionText}
                    </h3>
                    {!quiz.isScheduled && (
                      <button
                        onClick={() => handleEditQuestionClick(q)}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {q.type === 'mcq' && q.options && q.options.length > 0 && (
                    <ul className="space-y-2">
                      {q.options.map((opt, i) => {
                        const isCorrect = q.correctAnswer === opt;
                        return (
                          <li key={i} className={`px-4 py-2.5 rounded-xl border text-sm transition font-medium ${
                            isCorrect 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {q.type === 'one-line' && (
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-800 text-sm font-semibold">
                      Correct Answer: <span className="underline ml-1 font-bold">{q.correctAnswer}</span>
                    </div>
                  )}

                  {q.type === 'mcq' && (!q.options || q.options.length === 0) && (
                    <p className="text-rose-600 text-xs font-bold">⚠ Warning: No options found for this MCQ.</p>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      <button onClick={() => navigate('/teacher/myquizzes')} className="mt-8 px-6 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-2xs transition cursor-pointer">
        ← Back to My Quizzes
      </button>

      <QuizLeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        quizId={id}
        quizTopic={quiz?.topic}
      />
    </div>
  );
};

export default QuizView;