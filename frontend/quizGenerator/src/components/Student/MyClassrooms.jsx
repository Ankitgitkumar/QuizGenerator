import React from 'react';
import { Link } from 'react-router-dom';

const MyClassrooms = () => {
  // Later: fetch from backend
  const classrooms = [
    { id: 'abc123', name: 'Math by Mr. Sharma' },
    { id: 'xyz789', name: 'Science by Ms. Kapoor' },
  ];
  return (
    <div className="min-h-screen px-6 py-10  text-white">
    <div className="max-w-4xl  mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">My Classrooms</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {classrooms.map((c) => (
          <div key={c.id} className="bg-gray-800 p-5 shadow rounded">
            <h3 className="text-xl font-semibold mb-2">{c.name}</h3>
            <Link
              to={`/student/myclassrooms/${c.id === 'abc123' ? 'abc123' : 'xyz789'}/tests`}
              className="text-blue-600 hover:underline"
            >
              View Tests
            </Link>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default MyClassrooms;
