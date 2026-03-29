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

      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 blur-3xl rounded-full"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-pink-500/10 blur-3xl rounded-full"></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-16 pt-28 pb-16 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto">
            <p className="inline-block px-4 py-1 rounded-full border border-purple-500/40 bg-white/5 text-sm text-purple-300 mb-6 shadow-md">
              AI-Powered Quiz Platform
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              QuizForge AI
            </h1>

            <p className="mt-8 text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed min-h-[60px]">
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
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-purple-500/30 transition duration-300"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 rounded-xl border border-gray-600 bg-white/5 text-gray-200 font-semibold hover:bg-white/10 hover:scale-105 transition duration-300"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-20">
            {/* Teacher Card */}
            <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-xl hover:shadow-purple-500/20 hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-red-500/20 text-red-400 text-2xl mb-5">
                👨‍🏫
              </div>

              <h2 className="text-3xl font-bold text-red-400 mb-4">For Teachers</h2>

              <p className="text-gray-300 text-base leading-7 mb-6">
                Create quizzes in seconds, schedule tests for students, and track
                performance with detailed analytics—all in one place.
              </p>

              <ul className="space-y-3 text-gray-300 text-sm sm:text-base">
                <li>✅ Create tests on any topic instantly</li>
                <li>✅ Schedule quizzes for selected students</li>
                <li>✅ Analyze student performance in real time</li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                >
                  Teacher Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-red-400 text-red-300 font-semibold hover:bg-red-500/10 transition"
                >
                  Teacher Sign Up
                </button>
              </div>
            </div>

            {/* Student Card */}
            <div className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 text-2xl mb-5">
                🎓
              </div>

              <h2 className="text-3xl font-bold text-blue-400 mb-4">For Students</h2>

              <p className="text-gray-300 text-base leading-7 mb-6">
                Join scheduled quizzes, practice anytime, compete on live leaderboards,
                and review past performance to improve continuously.
              </p>

              <ul className="space-y-3 text-gray-300 text-sm sm:text-base">
                <li>✅ Attempt scheduled and practice tests</li>
                <li>✅ View live leaderboard during quizzes</li>
                <li>✅ Track and analyze previous test performance</li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                >
                  Student Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-blue-400 text-blue-300 font-semibold hover:bg-blue-500/10 transition"
                >
                  Student Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Features strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
              <h3 className="text-xl font-bold text-purple-400">AI Quiz Creation</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Generate high-quality quizzes within seconds.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
              <h3 className="text-xl font-bold text-pink-400">Smart Scheduling</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Easily schedule tests for selected groups.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
              <h3 className="text-xl font-bold text-blue-400">Live Leaderboard</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Make learning more engaging and competitive.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
              <h3 className="text-xl font-bold text-green-400">Performance Analytics</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Understand progress through clear insights.
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="mt-24 max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8">
              About QuizForge AI
            </h2>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-10 shadow-xl">
              <p className="text-gray-300 text-base sm:text-lg leading-8 text-left">
                At <span className="font-semibold text-purple-300">QuizForge AI</span>, we’re
                transforming the way tests are created, delivered, and analyzed.
                Built for both teachers and students, our AI-powered platform makes
                quiz generation effortless and intelligent.
                <br /><br />
                Teachers can instantly create customized tests on any topic, schedule
                them for selected students, and monitor real-time performance with
                detailed analytics. No more manual question-setting or paper
                corrections—just smart automation that saves time.
                <br /><br />
                For students, QuizForge AI offers a dynamic testing experience.
                Participate in scheduled tests, practice anytime, and see where you
                stand with a live leaderboard. After the test, dive into detailed
                performance insights and track your progress over time.
                <br /><br />
                Whether you're preparing for exams or simplifying assessments,
                QuizForge AI brings speed, accuracy, and interactivity to the process.
                Designed to empower educators and engage learners, we make testing
                smarter, faster, and more effective for everyone.
                <br /><br />
                <span className="font-bold text-white">
                  QuizForge AI – Forge smarter learning with AI.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Home;