import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api';

const JoinClassroom = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      toast.error('Please enter a classroom code');
      return;
    }

    const token = localStorage.getItem('studentToken');
    if (!token) {
      toast.error('Please sign in as a student first');
      navigate('/signin');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/classroom/join`,
        { code: trimmedCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('🎉 Joined classroom successfully!');
      setTimeout(() => navigate('/student/classroom'), 800);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error;

      if (status === 401) {
        toast.error('Session expired. Please sign in again.');
        localStorage.removeItem('studentToken');
        navigate('/signin');
      } else if (status === 404) {
        toast.error('Classroom not found. Check the code and try again.');
      } else if (status === 429) {
        toast.error('Too many attempts. Please wait a moment.');
      } else {
        toast.error(msg || 'Failed to join classroom. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/student/dashboard"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-8">
          {/* Icon */}
          <div className="text-5xl text-center mb-4">🏫</div>
          <h1 className="text-white text-3xl font-bold text-center mb-2">Join a Classroom</h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            Ask your teacher for the classroom code
          </p>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Classroom Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={10}
                autoComplete="off"
                autoCapitalize="characters"
                className="w-full bg-gray-900 text-white text-center text-2xl font-bold tracking-[0.4em] border border-gray-700 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-600 placeholder:text-base placeholder:tracking-normal transition"
              />
              <p className="text-gray-600 text-xs mt-2 text-center">
                Codes are case-insensitive
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:scale-[1.01] hover:shadow-blue-500/25 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Classroom'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinClassroom;