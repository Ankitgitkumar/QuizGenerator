import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api';
import { getFriendlyErrorMessage } from '../../utils/auth';

function Signup() {
  const [fN, setfN] = useState("");
  const [lN, setlN] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [role, setrole] = useState("teacher");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Client-side validation before hitting the API
  const validate = () => {
    if (!fN.trim()) { toast.error("First name is required"); return false; }
    if (!lN.trim()) { toast.error("Last name is required"); return false; }
    if (!email.trim()) { toast.error("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid email address"); return false; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    return true;
  };

  async function submitHandler(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const payload = { firstName: fN.trim(), lastName: lN.trim(), email: email.trim(), password };

    try {
      const endpoint = role === "teacher" ? "/teacher/signup" : "/student/signup";
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload, { timeout: 15000 });

      if (role === "teacher") {
        localStorage.setItem("teacherToken", res.data.token);
        if (res.data.teacher) {
          localStorage.setItem("teacherData", JSON.stringify(res.data.teacher));
          localStorage.setItem("teacherName", `${res.data.teacher.firstName} ${res.data.teacher.lastName}`.trim());
        }
        toast.success("Account created! Welcome 🎉");
        navigate("/teacher/dashboard");
      } else {
        localStorage.setItem("studentToken", res.data.token);
        if (res.data.student) {
          localStorage.setItem("studentData", JSON.stringify(res.data.student));
          localStorage.setItem("studentName", `${res.data.student.firstName} ${res.data.student.lastName}`.trim());
        }
        toast.success("Account created! Welcome 🎉");
        navigate("/student/dashboard");
      }
    } catch (error) {
      const msg = getFriendlyErrorMessage(error, 'Sign up failed. Please try again.');
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
          Create Account
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Already have one?{" "}
          <Link to="/signin" className="text-blue-400 hover:underline">Sign in</Link>
        </p>

        <form onSubmit={submitHandler} className="flex flex-col items-center" noValidate>
          <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-gray-300">
                <label className="text-sm font-medium block mb-1">First Name</label>
                <input
                  type="text"
                  value={fN}
                  onChange={(e) => setfN(e.target.value)}
                  placeholder="John"
                  autoComplete="given-name"
                  className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 transition"
                />
              </div>
              <div className="text-gray-300">
                <label className="text-sm font-medium block mb-1">Last Name</label>
                <input
                  type="text"
                  value={lN}
                  onChange={(e) => setlN(e.target.value)}
                  placeholder="Doe"
                  autoComplete="family-name"
                  className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 transition"
                />
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
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 transition"
              />
              {password.length > 0 && password.length < 6 && (
                <p className="text-amber-400 text-xs mt-1">⚠ At least 6 characters required ({password.length}/6)</p>
              )}
            </div>

            <div className="text-gray-300">
              <label className="text-sm font-medium block mb-1">I am a</label>
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:scale-[1.02] hover:shadow-blue-500/25 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;