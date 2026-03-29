
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const JoinClassroom = () => {
//   const navigate = useNavigate();
//   const [error, setError] = useState(null);

//   const handleJoin = async (e) => {
//     e.preventDefault();
//     setError(null);

//     const code = e.target.elements.classroomCode.value.trim();
//     if (!code) return;

//     try {
//       const token = localStorage.getItem('studentToken');
//       if (!token) {
//         alert('Please sign in as a student first.');
//         navigate('/signin');
//         return;
//       }

//       await axios.post(
//         'http://localhost:3141/api/v1/classroom/join',
//         { code },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // After joining, go to the classroom view where quizzes show up.
//       navigate('/student/classroom');
//     } catch (err) {
//       console.error('Failed to join classroom:', err);
//       const msg = err.response?.data?.message || 'Failed to join classroom';
//       setError(msg);
//     }
//   };
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JoinClassroom = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');

    const code = e.target.elements.classroomCode.value.trim();

    if (!code) {
      setError('Please enter classroom code');
      return;
    }

    try {
      const token = localStorage.getItem('studentToken');
      console.log('studentToken:', token);

      if (!token) {
        setError('Please sign in as a student first.');
        navigate('/signin');
        return;
      }

      if (token.split('.').length !== 3) {
        setError('Invalid token. Please sign in again.');
        localStorage.removeItem('studentToken');
        navigate('/signin');
        return;
      }

      const res = await axios.post(
        'http://localhost:3141/api/v1/classroom/join',
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Join response:', res.data);
      navigate('/student/classroom');
    } catch (err) {
      console.error('Failed to join classroom:', err);
      console.error('Backend response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to join classroom');
    }
  };

  return (
    <div className="min-h-screen px-4 py-20 flex justify-center items-start">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">
          Join a Classroom
        </h2>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            name="classroomCode"
            placeholder="Enter Classroom Code"
            required
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Join Classroom
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinClassroom;