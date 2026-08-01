import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  const goToDashboard = () => {
    if (user?.role === 'teacher') navigate('/teacher/dashboard');
    else if (user?.role === 'student') navigate('/student/dashboard');
  };

  return (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10 text-white px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1
          onClick={() => navigate('/')}
          className="text-lg font-bold bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent cursor-pointer"
        >
          QuizForge AI
        </h1>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 items-center text-sm font-medium text-gray-300">
          <a href="#home" className="hover:text-white cursor-pointer transition">Home</a>
          <a href="#about" className="hover:text-white cursor-pointer transition">About</a>
          <a href="#footer" className="hover:text-white cursor-pointer transition">Contact</a>

          {user ? (
            /* Logged-in state */
            <div className="flex items-center gap-3">
              <button
                onClick={goToDashboard}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <User size={14} />
                <span className="max-w-[120px] truncate">{user.name}</span>
                <span className="text-xs text-gray-500 capitalize">({user.role})</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 hover:text-red-300 transition"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            /* Guest state */
            <>
              <button
                onClick={() => navigate('/signin')}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg hover:scale-[1.05] transition"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <a href="#home" className="block hover:text-white py-1" onClick={() => setIsOpen(false)}>Home</a>
          <a href="#about" className="block hover:text-white py-1" onClick={() => setIsOpen(false)}>About</a>
          <a href="#footer" className="block hover:text-white py-1" onClick={() => setIsOpen(false)}>Contact</a>

          {user ? (
            <>
              <button
                onClick={() => { goToDashboard(); setIsOpen(false); }}
                className="w-full py-2 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center gap-2"
              >
                <User size={14} /> {user.name}
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate('/signin'); setIsOpen(false); }}
                className="w-full py-2 rounded-lg border border-white/10 bg-white/5"
              >
                Sign In
              </button>
              <button
                onClick={() => { navigate('/signup'); setIsOpen(false); }}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600"
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