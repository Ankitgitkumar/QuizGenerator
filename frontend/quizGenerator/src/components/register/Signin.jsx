import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api';
import { getFriendlyErrorMessage } from '../../utils/auth';

function Signin() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [role, setrole] = useState("teacher");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    if (!password) { toast.error("Please enter your password"); return; }

    setLoading(true);
    try {
      const endpoint = role === "teacher" ? "/teacher/signin" : "/student/signin";
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, { email: email.trim(), password }, { timeout: 15000 });

      const token = res.data.token;
      if (!token) { toast.error("No token received. Please try again."); return; }

      if (role === "teacher") {
        localStorage.setItem("teacherToken", token);
        if (res.data.teacher) {
          localStorage.setItem("teacherData", JSON.stringify(res.data.teacher));
          localStorage.setItem("teacherName", `${res.data.teacher.firstName} ${res.data.teacher.lastName}`.trim());
        }
        toast.success("Welcome back! 👋");
        navigate("/teacher/dashboard");
      } else {
        localStorage.setItem("studentToken", token);
        if (res.data.student) {
          localStorage.setItem("studentData", JSON.stringify(res.data.student));
          localStorage.setItem("studentName", `${res.data.student.firstName} ${res.data.student.lastName}`.trim());
        }
        toast.success("Welcome back! 👋");
        navigate("/student/dashboard");
      }
    } catch (error) {
      const msg = getFriendlyErrorMessage(error, 'Sign in failed. Please try again.');
      if (msg.includes('\n')) {
        msg.split('\n').forEach((line) => line && toast.error(line, { duration: 5000 }));
      } else {
        toast.error(msg, { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-gray-100 font-bold text-3xl sm:text-4xl text-center mb-2">
          Sign In
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">Sign up</Link>
        </p>

        <form onSubmit={submitHandler} className="flex flex-col items-center" noValidate>
          <div className="w-full space-y-4">
            {/* Role Toggle */}
            <div className="text-gray-300">
              <label className="text-sm font-medium block mb-2">Sign in as</label>
              <div className="grid grid-cols-2 gap-3">
                {["teacher", "student"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setrole(r)}
                    className={`py-3 rounded-xl font-medium capitalize transition border-2 ${
                      role === r
                        ? "border-blue-500 bg-blue-500/20 text-blue-300"
                        : "border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {r === "teacher" ? "👨‍🏫 Teacher" : "👨‍🎓 Student"}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-gray-300">
              <label className="text-sm font-medium block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 transition"
              />
            </div>

            <div className="text-gray-300">
              <label className="text-sm font-medium block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:scale-[1.02] hover:shadow-blue-500/25 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signin;