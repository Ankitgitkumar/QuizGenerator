
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinClassroom = () => {
  
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    navigate('/student/myclassrooms'); // Redirect to MyClassrooms after joining
  };

  return (
    <div className="min-h-screen  px-4 py-20 flex justify-center items-start">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">Join a Classroom</h2>
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Classroom Code"
            required
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
