// import React from 'react'
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// // export const API_BASE_URL = "https://quiz-generator-znsi.vercel.app/api/v1";
// export const API_BASE_URL = "http://localhost:3141/api/v1";

//  function Signin() {
//       const [email, setemail] = useState("");
//       const [password, setpassword] = useState("");
//       const [role, setrole] = useState("student");
//       const navigate = useNavigate();

//       async function submitHandler(e) {
//         e.preventDefault(); // important if inside form
    
//   console.log("Submit button clicked");
//   console.log("Form values:" ,email, role); // Do not log password
    
//         if ( email.length > 0 && password.length > 0) {
//             console.log("Selected Role:", role);
    
//           if (role === "teacher") {
//             const teacher = {
            
//               email: email,
//               password: password,
//             };
//             try {
//               const res = await axios.post(`${API_BASE_URL}/teacher/signin`, teacher);
//               console.log("Teacher Signin Success:", res.data);
//               localStorage.setItem("teacherToken", res.data.token);
//               navigate("/teacher/dashboard");
//             } catch (error) {
//               console.log("Teacher Signup Error:", error.response?.data || error.message);
//             }
//           } else if (role === "student") {
//             const student = {
//               email: email,
//               password: password,
//             };
//             try {
//               const res = await axios.post(`${API_BASE_URL}/student/signin`, student);
//               console.log("Student Signin Success:", res.data);
//               localStorage.setItem("studentToken", res.data.token);
//               navigate("/student/dashboard");
//             } catch (error) {
//               console.log("Student Signup Error:", error.response?.data || error.message);
//             }
//           }
//         } else {
//           console.log("Please fill all fields.");
//         }
//       }
    


//   return (
//     <div>
//       <div className=' bg-gray-800 my-10 mx-133 p-10 rounded-2xl'>
//         <h1 className='text-gray-300 font-sans font-bold text-3xl text-center mb-5'>Sign in</h1>
//         <div className='px-8 flex flex-col items-center'>
//           <div>

//           <div className='text-gray-300 px-2 mt-2'>
//             <h2 className='text-md'>Email:</h2>
//             <input type="text" onChange={(e)=>setemail(e.target.value)} placeholder='Email' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
//           </div>
//           <div className='text-gray-300 px-2 mt-2'>
//             <h2 className='text-md'>Password:</h2>
//             <input type="password" onChange={(e)=>setpassword(e.target.value)} placeholder='Password' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
//           </div>
//           <div className='text-gray-300 px-2 mt-2 mb-4 '>
//             <h2 className='text-md'>Sign in as:</h2>
//             <select name="role" id="role" value={role} onChange={(e)=>setrole(e.target.value)} className=' border-2 border-gray-600 rounded-lg p-2 mt-2 '>
//               <option value="teacher">Teacher</option>
//               <option value="student">Student</option>
//             </select>
//           </div>
//           </div>
//           <button onClick={submitHandler} className=' w-55 text-white p-2 mt-5 rounded-lg bg-blue-600 hover:cursor-pointer '>Sign in</button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Signin
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const API_BASE_URL = "http://localhost:3141/api/v1";

function Signin() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [role, setrole] = useState("student");
  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault();

    console.log("Submit button clicked");
    console.log("Form values:", email, role);

    if (!email || !password) {
      console.log("Please fill all fields.");
      return;
    }

    try {
      if (role === "teacher") {
        const teacher = {
          email,
          password,
        };

        const res = await axios.post(`${API_BASE_URL}/teacher/signin`, teacher);
        console.log("Teacher Signin Success:", res.data);

        const token = res.data.token || res.data.teacherToken || res.data.jwt;

        if (!token) {
          console.error("Teacher token not found in backend response");
          alert("Teacher token not received from server");
          return;
        }

        localStorage.setItem("teacherToken", token);
        console.log("Saved teacherToken:", localStorage.getItem("teacherToken"));

        navigate("/teacher/dashboard");
      } else if (role === "student") {
        const student = {
          email,
          password,
        };

        const res = await axios.post(`${API_BASE_URL}/student/signin`, student);
        console.log("Student Signin Success:", res.data);

        const token = res.data.token || res.data.studentToken || res.data.jwt;

        if (!token) {
          console.error("Student token not found in backend response");
          alert("Student token not received from server");
          return;
        }

        localStorage.setItem("studentToken", token);
        localStorage.setItem("studentData", JSON.stringify(res.data.student));

        console.log("Saved studentToken:", localStorage.getItem("studentToken"));
        console.log("Saved studentData:", localStorage.getItem("studentData"));

        navigate("/student/dashboard");
      }
    } catch (error) {
      console.log("Signin Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Signin failed");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-gray-100 font-bold text-3xl sm:text-4xl text-center mb-8">
          Sign in
        </h1>

        <div className="flex flex-col items-center">
          <div className="w-full space-y-5">
            <div className="text-gray-300">
              <h2 className="text-sm sm:text-base mb-2 font-medium">Email</h2>
              <input
                type="text"
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
              <h2 className="text-sm sm:text-base mb-2 font-medium">Sign in as</h2>
              <select
                name="role"
                id="role"
                value={role}
                onChange={(e) => setrole(e.target.value)}
                className="w-full bg-gray-900/70 text-white border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          <button
            onClick={submitHandler}
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:scale-[1.02] hover:shadow-blue-500/20 transition duration-300"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signin;