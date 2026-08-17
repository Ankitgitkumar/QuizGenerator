import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api';

const JoinClassroom = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkClassroom = async () => {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/classroom/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.classroom) {
          // Already in a classroom, redirect directly to classroom page
          navigate('/student/classroom', { replace: true });
        } else {
          setChecking(false);
        }
      } catch (err) {
        setChecking(false);
      }
    };

    checkClassroom();
  }, [navigate]);

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
      setTimeout(() => navigate('/student/classroom'), 850);
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

  if (checking) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-4 border-indigo-605 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-slate-600 text-sm">Checking classroom membership...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center px-4 py-10 fade-in">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/student/dashboard"
          className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-semibold text-sm mb-6 transition"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-8">
          {/* Icon */}
          <div className="text-4xl text-center mb-4 select-none">🏫</div>
          <h1 className="text-slate-900 text-3xl font-extrabold text-center mb-2">Join a Classroom</h1>
          <p className="text-slate-500 text-center text-xs font-semibold mb-8">
            Ask your teacher for the classroom code
          </p>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Classroom Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={20}
                autoComplete="off"
                autoCapitalize="characters"
                className="w-full bg-white text-slate-900 text-center text-2xl font-bold tracking-[0.4em] border border-slate-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300 placeholder:text-base placeholder:tracking-normal transition"
              />
              <p className="text-slate-400 text-[11px] mt-2 text-center font-medium">
                Codes are case-insensitive
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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