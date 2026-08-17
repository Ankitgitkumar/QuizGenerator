import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

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
      if (role === "teacher") url = `${API_BASE_URL}/classroom/teacher/${userId}`;
      else url = `${API_BASE_URL}/classroom/student/${userId}`;
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

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold text-sm">
        <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block mr-2" />
        Loading classrooms...
      </div>
    );
  }
  if (error) return <div className="text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2 mt-2 text-xs font-semibold">{error}</div>;
  if (!classrooms.length) return <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 font-semibold text-sm">No classrooms found.</div>;

  return (
    <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm max-w-lg mx-auto flex flex-col gap-4">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">My Classrooms</h2>
      <ul className="space-y-3">
        {classrooms.map((c) => (
          <li key={c._id} className="border border-slate-200 bg-white p-4 rounded-2xl shadow-2xs hover:shadow-xs transition duration-150">
            <div className="font-bold text-slate-900">{c.name}</div>
            <div className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-mono border border-slate-200 mt-1.5 font-bold">
              Code: {c.code || c._id}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassroomList;
