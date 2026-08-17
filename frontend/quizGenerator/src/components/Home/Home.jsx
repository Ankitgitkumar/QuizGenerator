import React from 'react';
import TypeIt from 'typeit-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import { Sparkles } from 'lucide-react'; // Let's use clean text/icons where appropriate

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 relative">
        <div className="relative z-10 px-4 sm:px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto fade-in">
          <div id="home" className="text-center max-w-3xl mx-auto">
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/60 text-sm font-semibold text-indigo-700 mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              AI-Powered Quiz Platform
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
              QuizForge <span className="text-indigo-600">AI</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed min-h-[60px] font-medium">
              <TypeIt
                options={{ speed: 40 }}
                getBeforeInit={(instance) => {
                  instance.type(
                    'Smarter quizzes, instantly generated. Powered by AI. Driven by curiosity.'
                  );
                  return instance;
                }}
              />
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/signin')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 hover:scale-[1.01] transition duration-200 text-base"
              >
                Get Started
              </button>

              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.01] transition duration-200 text-base"
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-20">
            {/* For Teachers Card */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-indigo-200/80 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-2xl mb-6 select-none">
                  👨‍🏫
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">For Teachers</h2>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Create quizzes in seconds, schedule tests with ease, and monitor
                  student performance through clean, real-time analytics.
                </p>

                <ul className="space-y-3.5 text-slate-600 text-sm sm:text-base">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Create topic-based tests instantly
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Schedule quizzes for selected students
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Track results with detailed insights
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-sm"
                >
                  Teacher Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition text-sm"
                >
                  Teacher Sign Up
                </button>
              </div>
            </div>

            {/* For Students Card */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-indigo-200/80 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-2xl mb-6 select-none">
                  🎓
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">For Students</h2>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Join scheduled quizzes, practice anytime, compete on leaderboards,
                  and improve continuously with clear performance feedback.
                </p>

                <ul className="space-y-3.5 text-slate-600 text-sm sm:text-base">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Attempt scheduled and practice quizzes
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    View live leaderboard performance
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Review and analyze past attempts
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-sm"
                >
                  Student Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition text-sm"
                >
                  Student Sign Up
                </button>
              </div>
            </div>
          </div>

          <div
            id="features"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          >
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-indigo-200 transition">
              <h3 className="text-base font-bold text-slate-800">AI Quiz Creation</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Generate high-quality quizzes within seconds.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-indigo-200 transition">
              <h3 className="text-base font-bold text-slate-800">Smart Scheduling</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Organize tests efficiently for your learners.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-indigo-200 transition">
              <h3 className="text-base font-bold text-slate-800">Live Leaderboard</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Make learning engaging and competitive.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs hover:border-indigo-200 transition">
              <h3 className="text-base font-bold text-slate-800">Performance Analytics</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Track progress through simple insights.
              </p>
            </div>
          </div>

          <div id="about" className="mt-24 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-8">
              About QuizForge AI
            </h2>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-left">
              <p className="text-slate-600 text-sm sm:text-base leading-8">
                At <span className="font-bold text-indigo-600">QuizForge AI</span>, we
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