import React from "react";
import { useNavigate } from "react-router-dom";

const mockTests = [
  {
    id: 1,
    title: "Physics - Motion",
    scheduled: "2025-07-15T10:00:00",
    duration: 30,
    completed: false,
  },
  {
    id: 2,
    title: "Chemistry - Reactions",
    scheduled: "2025-07-10T14:00:00",
    duration: 45,
    completed: false,
  },
];
const classrooms = [
    { id: 'abc123', name: 'Math by Mr. Sharma' },
    { id: 'xyz789', name: 'Science by Ms. Kapoor' },
  ];
const ClassroomTestList = () => {
  const navigate = useNavigate();
  const now = new Date();

  return (
    <div className="min-h-screen  py-10 px-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Tests in Your Classroom
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockTests.map((test) => {
          const testTime = new Date(test.scheduled);
          const isAvailable = now >= testTime;
          const status = test.completed
            ? "Completed"
            : isAvailable
            ? "Available"
            : "Scheduled";

          return (
            <div key={test.id} className="bg-gray-800 shadow rounded p-5">
              <h2 className="text-xl font-semibold text-white">
                {test.title}
              </h2>
              <p className="text-gray-400">
                Scheduled: {testTime.toLocaleString()}
              </p>
              <p className="text-gray-400">Duration: {test.duration} mins</p>
              <p className="mt-2 text-sm text-gray-400">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    status === "Completed"
                      ? "text-green-600"
                      : status === "Available"
                      ? "text-blue-600"
                      : "text-yellow-600"
                  }`}
                >
                  {status}
                </span>
              </p>
              {status === "Available" && !test.completed && (
                <button
                  onClick={() => navigate(`/student/myclassrooms/${classrooms.find(c => c.id === 'abc123'?'abc123':'xyz789')}/attempt/${test.id}`)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Start Test
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassroomTestList;
