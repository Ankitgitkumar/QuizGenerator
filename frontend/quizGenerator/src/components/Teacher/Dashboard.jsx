
import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import CreateClassroom from "../Classroom/CreateClassroom";
import { API_BASE_URL } from "../../config/api";
import { getFriendlyErrorMessage, logoutUser } from '../../utils/auth';

const Dashboard = () => {
    const navigate = useNavigate();
    const [teacherName, setTeacherName] = useState('Teacher'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const [showClassroomForm, setShowClassroomForm] = useState(false);

    useEffect(() => {
        const fetchTeacherProfile = async () => {
            const token = localStorage.getItem("teacherToken"); 

              if (!token) {
                // If no token, redirect to login (or handle as unauthorized)
                console.error("No teacher token found. Redirecting to login.");
                navigate('/signin');
                return;
            }

            try {
                
                const response = await axios.get(`${API_BASE_URL}/teacher/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setTeacherName(`${response.data.firstName} ${response.data.lastName}`);
                setTeacherId(response.data._id);
                setLoading(false);

            } catch (err) {
                setError(getFriendlyErrorMessage(err, 'Failed to load teacher profile.'));
                setLoading(false);
                
                if (err.response && err.response.status === 401) {
                    logoutUser(navigate, '/signin');
                }
                
            }
        };

        fetchTeacherProfile();
    }, [navigate]); 

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 text-slate-800">
                <div className="flex flex-col items-center gap-3">
                    <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-semibold text-slate-600 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-50 text-red-600 p-6">
                <p className="font-bold text-lg mb-4">{error}</p>
                <button onClick={() => navigate('/signin')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto fade-in">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        Welcome, {teacherName} 👋
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Manage your classrooms, generate AI quizzes, and review quiz results.
                    </p>
                </div>
            </div>            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
                {/* Classroom Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[220px]">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-2">Create Classroom</h2>
                        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                            Set up a new classroom and get a join code for your students.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowClassroomForm(true)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition text-center cursor-pointer"
                    >
                        Create Classroom
                    </button>
                </div>

                {/* Create New Quiz Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[220px]">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-2">Create New Quiz</h2>
                        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                            Use Gemini or upload a PDF to generate AI-powered quizzes.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/teacher/createquiz')} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition text-center cursor-pointer"
                    >
                        Create Quiz
                    </button>
                </div>

                {/* My Quizzes Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[220px]">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-2">My Quizzes</h2>
                        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                            View details, schedule, or delete previously created quizzes.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/teacher/myquizzes')} 
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition text-center cursor-pointer"
                    >
                        View Quizzes
                    </button>
                </div>
            </div>

            {/* Classroom Creation Modal/Card */}
            {showClassroomForm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative border border-slate-100 fade-in">
                        <button
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold p-1 hover:bg-slate-100 rounded-lg transition"
                            onClick={() => setShowClassroomForm(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        {teacherId && <CreateClassroom teacherId={teacherId} onCreated={() => setShowClassroomForm(false)} />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;