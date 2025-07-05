import React, { useState } from "react";
import { Link } from "react-router-dom";

const CreateQuiz = () => {
  

  return (
        <>
    
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">  
        <div className="absolute top-4 right-4">
    <Link 
      to="/dashboard" 
      className="text-sm bg-gray-200 text-black font-semibold px-3 py-1 rounded hover:bg-gray-300"
    >
      Dashboard
    </Link>
  </div>
    <div className="max-w-2xl mx-auto p-8 rounded-xl mt-10 z-10 text-white  bg-gray-800 shadow-lg border-gray-500 ">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Create New Quiz</h2>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Quiz Title"
          
          
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Topic (used by AI)"
          
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          accept=".pdf"
          
          className="w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Quiz
        </button>
      </form>
    </div>
    </div>
    </>
  );
};

export default CreateQuiz;
