



import React from 'react';
import { useNavigate } from 'react-router-dom';

const JoinClassroom = () => {
  const navigate = useNavigate();
  const classrooms = [
    { id: 'abc123', name: 'Math by Mr. Sharma' },
    { id: 'xyz789', name: 'Science by Ms. Kapoor' },
  ];

  const handleJoin = (e) => {
    e.preventDefault();
    const code = e.target.elements.classroomCode.value;
    const classroom = classrooms.find((c) => c.id === code);
    if (classroom) {
      navigate(`/student/myclassrooms/${classroom.id}/tests`);
    } else {
      alert('Classroom not found');
    }
  };

  return (
    <div className="min-h-screen  px-4 py-20 flex justify-center items-start">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">Join a Classroom</h2>
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            name="classroomCode"
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
