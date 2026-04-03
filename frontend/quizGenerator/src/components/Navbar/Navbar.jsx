import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10 text-white px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1
          onClick={() => navigate("/")}
          className="text-lg font-bold bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent cursor-pointer"
        >
          QuizForge AI
        </h1>

        <div className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-300">
          <a href="#home" className="hover:text-white cursor-pointer transition">Home</a>
          <a href="#about" className="hover:text-white cursor-pointer transition">About</a>
          <a href="#footer" className="hover:text-white cursor-pointer transition">Contact</a>

          <button
            onClick={() => navigate("/signin")}
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg hover:scale-[1.05] transition"
          >
            Get Started
          </button>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 space-y-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <a href="#home" className="block hover:text-white" onClick={() => setIsOpen(false)}>Home</a>
          <a href="#about" className="block hover:text-white" onClick={() => setIsOpen(false)}>About</a>
          <a href="#footer" className="block hover:text-white" onClick={() => setIsOpen(false)}>Contact</a>

          <button
            onClick={() => navigate("/signin")}
            className="w-full py-2 rounded-lg border border-white/10 bg-white/5"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600"
          >
            Get Started
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;