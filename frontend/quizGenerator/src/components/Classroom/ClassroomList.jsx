import React, { useEffect, useState } from "react";
import axios from "axios";

const ClassroomList = ({ userId, role }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClassrooms = async () => {
      setLoading(true);
      setError("");
      try {
        let url = "";
      if (role === "teacher") url = `/api/v1/classroom/teacher/${userId}`;
      else url = `/api/v1/classroom/student/${userId}`;
      const res = await axios.get(url);
        setClassrooms(Array.isArray(res.data) ? res.data : [res.data]);
      } catch (err) {
        setError(err.response?.data?.message || "Error loading classrooms");
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, [userId, role]);

  if (loading) return <div>Loading classrooms...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!classrooms.length) return <div>No classrooms found.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">My Classrooms</h2>
      <ul className="space-y-2">
        {classrooms.map((c) => (
          <li key={c._id} className="border p-2 rounded">
            <div className="font-semibold">{c.name}</div>
            <div>Code: {c.code || c._id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassroomList;
