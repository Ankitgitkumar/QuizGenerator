import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, BookOpen, GraduationCap, Sparkles, FileText, BarChart } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // { name, role }
  const navigate = useNavigate();
  const location = useLocation();

  // Detect logged-in user from localStorage on every route change
  useEffect(() => {
    const teacherToken = localStorage.getItem('teacherToken');
    const studentToken = localStorage.getItem('studentToken');
    if (teacherToken) {
      const name = localStorage.getItem('teacherName') || 'Teacher';
      setUser({ name, role: 'teacher' });
    } else if (studentToken) {
      const name = localStorage.getItem('studentName') || 'Student';
      setUser({ name, role: 'student' });
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherData');
    localStorage.removeItem('teacherName');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    localStorage.removeItem('studentName');
    setUser(null);
    setIsOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isAttemptingQuiz = location.pathname.includes('/quiz/attempt/') && !location.pathname.includes('/review');

  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `hover:text-indigo-600 cursor-pointer transition font-semibold text-sm ${
      isActive ? 'text-indigo-600' : 'text-slate-600'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 text-slate-800 px-6 py-4 shadow-xs">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div
          onClick={() => {
            if (!isAttemptingQuiz) navigate('/');
          }}
          className={`flex items-center gap-2 cursor-pointer select-none`}
        >
          <BookOpen className="text-indigo-600 w-6 h-6 stroke-[2.5]" />
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            QuizForge<span className="text-indigo-600 font-extrabold">AI</span>
          </span>
        </div>

        {isAttemptingQuiz ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Quiz In Progress
          </div>
        ) : (
          <>
            {/* Desktop Nav */}
            <div className="hidden md:flex gap-8 items-center">
              {user ? (
                <>
                  {user.role === 'teacher' ? (
                    <>
                      <Link to="/teacher/dashboard" className={navLinkClass('/teacher/dashboard')}>Dashboard</Link>
                      <Link to="/teacher/createquiz" className={navLinkClass('/teacher/createquiz')}>Create Quiz</Link>
                      <Link to="/teacher/myquizzes" className={navLinkClass('/teacher/myquizzes')}>My Quizzes</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/student/dashboard" className={navLinkClass('/student/dashboard')}>Dashboard</Link>
                      <Link to="/student/join-classroom" className={navLinkClass('/student/join-classroom')}>Join Classroom</Link>
                      <Link to="/student/practice-quiz" className={navLinkClass('/student/practice-quiz')}>Practice Quiz</Link>
                    </>
                  )}
                  <div className="h-4 w-px bg-slate-200 mx-2" />
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold">
                      <User size={14} className="text-slate-500" />
                      <span className="max-w-[100px] truncate">{user.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize bg-slate-200/50 px-1.5 py-0.5 rounded">
                        {user.role}
                      </span>
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 transition font-semibold text-sm"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <a href="/#home" className="text-slate-600 hover:text-indigo-600 transition font-semibold text-sm">Home</a>
                  <a href="/#features" className="text-slate-600 hover:text-indigo-600 transition font-semibold text-sm">Features</a>
                  <a href="/#about" className="text-slate-600 hover:text-indigo-600 transition font-semibold text-sm">About</a>
                  <div className="h-4 w-px bg-slate-200 mx-2" />
                  <button
                    onClick={() => navigate('/signin')}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition font-semibold text-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-700"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {isOpen && !isAttemptingQuiz && (
        <div className="md:hidden mt-4 space-y-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-lg fade-in">
          {user ? (
            <>
              {user.role === 'teacher' ? (
                <>
                  <Link to="/teacher/dashboard" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  <Link to="/teacher/createquiz" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" onClick={() => setIsOpen(false)}>Create Quiz</Link>
                  <Link to="/teacher/myquizzes" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" onClick={() => setIsOpen(false)}>My Quizzes</Link>
                </>
              ) : (
                <>
                  <Link to="/student/dashboard" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  <Link to="/student/join-classroom" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" onClick={() => setIsOpen(false)}>Join Classroom</Link>
                  <Link to="/student/practice-quiz" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" onClick={() => setIsOpen(false)}>Practice Quiz</Link>
                </>
              )}
              <div className="h-px bg-slate-100 my-2" />
              <div className="px-3 py-2 flex items-center justify-between text-slate-700 text-sm font-semibold">
                <span className="truncate max-w-[150px]">{user.name}</span>
                <span className="text-[10px] text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition font-semibold text-sm flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <a href="/#home" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" onClick={() => setIsOpen(false)}>Home</a>
              <a href="/#features" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" onClick={() => setIsOpen(false)}>Features</a>
              <a href="/#about" className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold" onClick={() => setIsOpen(false)}>About</a>
              <div className="h-px bg-slate-100 my-2" />
              <button
                onClick={() => { navigate('/signin'); setIsOpen(false); }}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => { navigate('/signup'); setIsOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;