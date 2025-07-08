import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signin() {
      const [email, setemail] = useState("");
      const [password, setpassword] = useState("");
      const [role, setrole] = useState("student");
      const navigate = useNavigate();

      async function submitHandler(e) {
        e.preventDefault(); // important if inside form
    
        console.log("Submit button clicked");
        console.log("Form values:" ,email, password, role);
    
        if ( email.length > 0 && password.length > 0) {
            console.log("Selected Role:", role);
    
          if (role === "teacher") {
            const teacher = {
            
              email: email,
              password: password,
            };
            try {
              const res = await axios.post("http://localhost:3141/api/v1/teacher/signin", teacher);
              console.log("Teacher Signin Success:", res.data);
              navigate("/teacher/dashboard");
            } catch (error) {
              console.log("Teacher Signup Error:", error.response?.data || error.message);
            }
          } else if (role === "student") {
            const student = {
                
              email: email,
              password: password,
            };
            try {
              const res = await axios.post("http://localhost:3141/api/v1/student/signin", student);
              console.log("Student Signin Success:", res);
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
    <div>
      <div className=' bg-gray-800 my-10 mx-133 p-10 rounded-2xl'>
        <h1 className='text-gray-300 font-sans font-bold text-3xl text-center mb-5'>Sign in</h1>
        <div className='px-8 flex flex-col items-center'>
          <div>

          <div className='text-gray-300 px-2 mt-2'>
            <h2 className='text-md'>Email:</h2>
            <input type="text" onChange={(e)=>setemail(e.target.value)} placeholder='Email' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
          </div>
          <div className='text-gray-300 px-2 mt-2'>
            <h2 className='text-md'>Password:</h2>
            <input type="password" onChange={(e)=>setpassword(e.target.value)} placeholder='Password' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
          </div>
          <div className='text-gray-300 px-2 mt-2 mb-4 '>
            <h2 className='text-md'>Sign in as:</h2>
            <select name="role" id="role" value={role} onChange={(e)=>setrole(e.target.value)} className=' border-2 border-gray-600 rounded-lg p-2 mt-2 '>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          </div>
          <button onClick={submitHandler} className=' w-55 text-white p-2 mt-5 rounded-lg bg-blue-600 hover:cursor-pointer '>Sign in</button>
        </div>
      </div>
    </div>
  )
}

export default Signin
