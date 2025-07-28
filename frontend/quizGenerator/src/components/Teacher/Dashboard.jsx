
import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

const Dashboard = () => {
    const navigate = useNavigate();
    const [teacherName, setTeacherName] = useState('Teacher'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                
                const response = await axios.get('/api/v1/teacher/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setTeacherName(`${response.data.firstName} ${response.data.lastName}`);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching teacher profile:", err);
                setError("Failed to load teacher profile.");
                setLoading(false);
                
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("teacherToken"); 
                    navigate('/teacher/login'); 
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
                <button onClick={() => navigate('/teacher/login')} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 z-10 relative">
                <h1 className="text-3xl font-bold text-white z-10 relative mb-8 ">
                    Welcome, {teacherName} 👋
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 z-10 gap-6">

                  
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
            </div>
        </div>
    );
};

export default Dashboard;