import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [fN, setfN] = useState("");
  const [lN, setlN] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [role, setrole] = useState("student");
  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault(); // important if inside form

    console.log("Submit button clicked");
    console.log("Form values:", fN, lN, email, password, role);

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
          const res = await axios.post("http://localhost:3141/api/v1/teacher/signup", teacher);
          console.log("Teacher Signup Success:", res.data);
          localStorage.setItem("teacherToken", res.data.token);
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
          const res = await axios.post("http://localhost:3141/api/v1/student/signup", student);
          console.log("Student Signup Success:", res);
          localStorage.setItem("studentToken", res.data.token);
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
    <div className=''>
      <div className='bg-gray-800 my-10 mx-133 p-10 rounded-2xl'>
        <h1 className='text-gray-300 font-sans font-bold text-3xl text-center mb-5'>Sign Up</h1>
        <form onSubmit={submitHandler} className='px-8 flex flex-col items-center'>
          <div className='text-gray-300 px-2 mt-2'>
            <h2 className='text-md'>First Name:</h2>
            <input type="text" onChange={(e) => setfN(e.target.value)} placeholder='First Name' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
          </div>
          <div className='text-gray-300 px-2 mt-2'>
            <h2 className='text-md'>Last Name:</h2>
            <input type="text" onChange={(e) => setlN(e.target.value)} placeholder='Last Name' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
          </div>
          <div className='text-gray-300 px-2 mt-2'>
            <h2 className='text-md'>Email:</h2>
            <input type="text" onChange={(e) => setemail(e.target.value)} placeholder='Email' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
          </div>
          <div className='text-gray-300 px-2 mt-2'>
            <h2 className='text-md'>Password:</h2>
            <input type="password" onChange={(e) => setpassword(e.target.value)} placeholder='Password' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
          </div>
          <div className='text-gray-300 px-2 mt-4 mb-4 flex flex-col items-center justify-between'>
            <h2 className='text-md'>Sign Up as:</h2>
            <select name="role" value={role} id="role" onChange={(e) => setrole(e.target.value)} className='border-2 border-gray-600 rounded-lg p-2 mt-2'>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          <button type="submit" className='w-55 text-white p-2 mt-4 rounded-lg bg-blue-600 hover:cursor-pointer'>Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
