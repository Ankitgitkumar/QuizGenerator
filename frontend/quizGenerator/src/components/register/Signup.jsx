import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// export const API_BASE_URL = "https://quiz-generator-znsi.vercel.app/api/v1";
export const API_BASE_URL = "https://quizgenerator-backend-vafs.onrender.com/api/v1";

function Signup() {
  const [fN, setfN] = useState("");
  const [lN, setlN] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [role, setrole] = useState("student");
  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault();

    console.log("Submit button clicked");
    console.log("Form values:", fN, lN, email, role);

    if (fN.length > 0 && lN.length > 0 && email.length > 0 && password.length > 0) {
      console.log("Selected Role:", role);

      if (role === "teacher") {
        const teacher = {
          firstName: fN,
          lastName: lN,
          email: email,
          password: password,
        };
        try {
          const res = await axios.post(`${API_BASE_URL}/teacher/signup`, teacher);
          console.log("Teacher Signup Success:", res.data);

          localStorage.setItem("teacherToken", res.data.token);
          if (res.data.teacher) {
            localStorage.setItem("teacherData", JSON.stringify(res.data.teacher));
            localStorage.setItem(
              "teacherName",
              `${res.data.teacher.firstName || ""} ${res.data.teacher.lastName || ""}`.trim()
            );
          }

          navigate("/teacher/dashboard");
        } catch (error) {
          console.log("Teacher Signup Error:", error.response?.data || error.message);
        }
      } else if (role === "student") {
        const student = {
          firstName: fN,
          lastName: lN,
          email: email,
          password: password,
        };
        try {
          const res = await axios.post(`${API_BASE_URL}/student/signup`, student);
          console.log("Student Signup Success:", res.data);

          localStorage.setItem("studentToken", res.data.token);
          if (res.data.student) {
            localStorage.setItem("studentData", JSON.stringify(res.data.student));
            localStorage.setItem(
              "studentName",
              `${res.data.student.firstName || ""} ${res.data.student.lastName || ""}`.trim()
            );
          }

          navigate("/student/dashboard");
        } catch (error) {
          console.log("Student Signup Error:", error.response?.data || error.message);
        }
      }
    } else {
      console.log("Please fill all fields.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-gray-100 font-bold text-3xl sm:text-4xl text-center mb-8">
          Sign Up
        </h1>

        <form onSubmit={submitHandler} className="flex flex-col items-center">
          <div className="w-full space-y-5">
            <div className="text-gray-300">
              <h2 className="text-sm sm:text-base mb-2 font-medium">First Name</h2>
              <input
                type="text"
                value={fN}
                onChange={(e) => setfN(e.target.value)}
                placeholder="Enter your first name"
                className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              />
            </div>

            <div className="text-gray-300">
              <h2 className="text-sm sm:text-base mb-2 font-medium">Last Name</h2>
              <input
                type="text"
                value={lN}
                onChange={(e) => setlN(e.target.value)}
                placeholder="Enter your last name"
                className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              />
            </div>

            <div className="text-gray-300">
              <h2 className="text-sm sm:text-base mb-2 font-medium">Email</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              />
            </div>

            <div className="text-gray-300">
              <h2 className="text-sm sm:text-base mb-2 font-medium">Password</h2>
              <input
                type="password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              />
            </div>

            <div className="text-gray-300">
              <h2 className="text-sm sm:text-base mb-2 font-medium">Sign Up as</h2>
              <select
                name="role"
                value={role}
                id="role"
                onChange={(e) => setrole(e.target.value)}
                className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:scale-[1.02] hover:shadow-blue-500/20 transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;