import React from 'react'

function Signin() {
  return (
    <div>
      <div className=' bg-gray-800 my-10 mx-133 p-10 rounded-2xl'>
        <h1 className='text-gray-300 font-sans font-bold text-3xl text-center mb-5'>Sign in</h1>
        <div className='px-8 flex flex-col items-center'>
          <div>

          <div className='text-gray-300 px-2 mt-2'>
            <h2 className='text-md'>Email:</h2>
            <input type="text" placeholder='Email' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
          </div>
          <div className='text-gray-300 px-2 mt-2'>
            <h2 className='text-md'>Password:</h2>
            <input type="password" placeholder='Password' className='w-80 border-2 border-gray-600 rounded-lg p-2 mt-2' />
          </div>
          <div className='text-gray-300 px-2 mt-2 mb-4 '>
            <h2 className='text-md'>Sign in as:</h2>
            <select name="role" id="role" className=' border-2 border-gray-600 rounded-lg p-2 mt-2 '>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          </div>
          <button  className=' w-55 text-white p-2 mt-5 rounded-lg bg-blue-600 hover:cursor-pointer '>Sign in</button>
        </div>
      </div>
    </div>
  )
}

export default Signin
