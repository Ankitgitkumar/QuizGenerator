import React from 'react';
import TypeIt from 'typeit-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-gray-950 to-black text-white overflow-hidden relative">
        <div className="absolute top-16 left-10 w-72 h-72 bg-violet-600/10 blur-3xl rounded-full"></div>
        <div className="absolute top-24 right-10 w-80 h-80 bg-sky-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-400/5 blur-3xl rounded-full"></div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px] opacity-20"></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-16 pt-28 pb-20 max-w-7xl mx-auto">
          <div id="home" className="text-center max-w-4xl mx-auto">
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-400/20 bg-white/5 text-sm text-violet-200 mb-6 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              AI-Powered Quiz Platform
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-violet-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              QuizForge AI
            </h1>

            <p className="mt-8 text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed min-h-[64px]">
              <TypeIt
                options={{ speed: 45 }}
                getBeforeInit={(instance) => {
                  instance.type(
                    'Smarter quizzes, instantly generated. Powered by AI. Driven by curiosity.'
                  );
                  return instance;
                }}
              />
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/signin')}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold shadow-lg shadow-violet-900/30 hover:scale-[1.03] hover:shadow-violet-700/30 transition duration-300"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 font-semibold backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition duration-300"
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-20">
            <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl hover:-translate-y-1.5 hover:border-violet-400/20 hover:shadow-violet-900/20 transition duration-300">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-400/20 text-violet-300 text-2xl mb-5">
                👨‍🏫
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">For Teachers</h2>

              <p className="text-gray-300 text-base leading-7 mb-6">
                Create quizzes in seconds, schedule tests with ease, and monitor
                student performance through clean, real-time analytics.
              </p>

              <ul className="space-y-3 text-gray-300 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">✓</span>
                  Create topic-based tests instantly
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">✓</span>
                  Schedule quizzes for selected students
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">✓</span>
                  Track results with detailed insights
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition"
                >
                  Teacher Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-violet-400/20 bg-violet-500/5 text-violet-200 font-semibold hover:bg-violet-500/10 transition"
                >
                  Teacher Sign Up
                </button>
              </div>
            </div>

            <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl hover:-translate-y-1.5 hover:border-sky-400/20 hover:shadow-sky-900/20 transition duration-300">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-400/20 text-sky-300 text-2xl mb-5">
                🎓
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">For Students</h2>

              <p className="text-gray-300 text-base leading-7 mb-6">
                Join scheduled quizzes, practice anytime, compete on leaderboards,
                and improve continuously with clear performance feedback.
              </p>

              <ul className="space-y-3 text-gray-300 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">✓</span>
                  Attempt scheduled and practice quizzes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">✓</span>
                  View live leaderboard performance
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">✓</span>
                  Review and analyze past attempts
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition"
                >
                  Student Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-sky-400/20 bg-sky-500/5 text-sky-200 font-semibold hover:bg-sky-500/10 transition"
                >
                  Student Sign Up
                </button>
              </div>
            </div>
          </div>

          <div
            id="features"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
          >
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center backdrop-blur-md hover:border-violet-400/20 transition">
              <h3 className="text-lg font-semibold text-white">AI Quiz Creation</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Generate high-quality quizzes within seconds.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center backdrop-blur-md hover:border-blue-400/20 transition">
              <h3 className="text-lg font-semibold text-white">Smart Scheduling</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Organize tests efficiently for your learners.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center backdrop-blur-md hover:border-cyan-400/20 transition">
              <h3 className="text-lg font-semibold text-white">Live Leaderboard</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Make learning engaging and competitive.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center backdrop-blur-md hover:border-emerald-400/20 transition">
              <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Track progress through simple insights.
              </p>
            </div>
          </div>

          <div id="about" className="mt-24 max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent mb-8">
              About QuizForge AI
            </h2>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
              <p className="text-gray-300 text-base sm:text-lg leading-8 text-left">
                At <span className="font-semibold text-violet-200">QuizForge AI</span>, we
                make quiz creation, delivery, and evaluation smarter and faster.
                Built for both teachers and students, the platform simplifies the
                full testing experience with AI-powered workflows.
                <br /><br />
                Teachers can create customized quizzes in seconds, schedule them
                easily, and monitor results through clean analytics. Students can
                practice anytime, join scheduled tests, and track their progress with
                meaningful feedback.
                <br /><br />
                Whether for classrooms, preparation, or daily assessment workflows,
                QuizForge AI helps make learning more interactive, efficient, and
                professional.
                <br /><br />
                <span className="font-bold text-white">
                  QuizForge AI — smarter learning, powered by AI.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer id="footer" />
    </>
  );
}

export default Home;