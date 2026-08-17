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
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-8">
        <h1 className="text-slate-900 font-extrabold text-3xl text-center mb-2">
          Sign In
        </h1>
        <p className="text-slate-500 text-center text-sm mb-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline font-semibold">Sign up</Link>
        </p>

        <form onSubmit={submitHandler} className="flex flex-col items-center" noValidate>
          <div className="w-full space-y-5">
            {/* Role Toggle */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Sign in as</label>
              <div className="grid grid-cols-2 gap-3">
                {["teacher", "student"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setrole(r)}
                    className={`py-3 rounded-xl font-bold capitalize transition border-2 text-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === r
                        ? "border-indigo-600 bg-indigo-50/60 text-indigo-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    {r === "teacher" ? "👨‍🏫 Teacher" : "👨‍🎓 Student"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 transition"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-base shadow-sm hover:scale-[1.01] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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