
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
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-red-500">
                <p>{error}</p>
                <button onClick={() => navigate('/signin')} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 z-10 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-white z-10 relative">
                        Welcome, {teacherName} 👋
                    </h1>
                    <button
                        onClick={() => logoutUser(navigate, '/')}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 z-10 gap-6">
                    {/* Classroom Card */}
                    <div className="bg-gray-800 rounded-2xl shadow p-6 hover:shadow-md transition duration-300 cursor-pointer" onClick={() => setShowClassroomForm(true)}>
                        <h2 className="text-xl font-semibold text-gray-300 mb-2">Create Classroom</h2>
                        <p className="text-gray-400 mb-4">
                            Set up a new classroom and get a join code for your students.
                        </p>
                        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded">
                            Create Classroom
                        </button>
                    </div>

                  
                    <div className="bg-gray-800 rounded-2xl shadow p-6 hover:shadow-md transition duration-300">
                        <h2 className="text-xl font-semibold text-gray-300 mb-2">Create New Quiz</h2>
                        <p className="text-gray-400 mb-4">
                            Use Gemini or upload a PDF to generate AI-powered quizzes.
                        </p>
                        <button onClick={() => { navigate('/teacher/createquiz') }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                            Create Quiz
                        </button>
                    </div>

                  
                    <div className="bg-gray-800 rounded-2xl shadow p-6 hover:shadow-md transition duration-300">
                        <h2 className="text-xl font-semibold text-gray-300 mb-2">My Quizzes</h2>
                        <p className="text-gray-400 mb-4">
                            View, final results or delete previously created quizzes.
                        </p>
                        <button onClick={() => { navigate('/teacher/myquizzes') }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                            View Quizzes
                        </button>
                    </div>

                  
                    <div className="bg-gray-800 rounded-2xl shadow p-6 hover:shadow-md transition duration-300">
                        <h2 className="text-xl font-semibold text-gray-300 mb-2">Live Leaderboard</h2>
                        <p className="text-gray-400 mb-4">
                            Monitor quiz performance in real-time as students answer.
                        </p>
                        <button onClick={() => {
                            navigate('/teacher/leaderboard'); 
                        }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                            View Leaderboard
                        </button>
                    </div>

                </div>
                                                {/* Classroom Creation Modal/Card */}
                                                {showClassroomForm && (
                                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                                                            <button
                                                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                                                                onClick={() => setShowClassroomForm(false)}
                                                                aria-label="Close"
                                                            >
                                                                &times;
                                                            </button>
                                                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a Classroom</h2>
                                                            {teacherId && <CreateClassroom teacherId={teacherId} onCreated={() => setShowClassroomForm(false)} />}
                                                        </div>
                                                    </div>
                                                )}
                        </div>
                </div>
        );
};

export default Dashboard;