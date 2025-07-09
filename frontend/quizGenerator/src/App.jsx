import Navbar from './components/Navbar/Navbar'
import Home from './components/Home/Home'
import React, { useState } from 'react'

import { Routes, Route } from 'react-router-dom'

import './App.css'
import './index.css'

import Dashboard from './components/Teacher/Dashboard.jsx'
import MyQuizzes from './components/Teacher/MyQuizzes.jsx'
import QuizView from './components/Teacher/QuizView.jsx'
import Leaderboard from './components/Teacher/Leaderboard.jsx'
import FinalResult from './components/Teacher/FinalResult.jsx'
import CreateQuiz from './components/Teacher/CreateQuiz.jsx'
import StudentDashboard from './components/Student/Dashboard.jsx'
import JoinClassroom from './components/Student/JoinClassroom.jsx'
import PracticeQuiz from './components/Student/PracticeQuiz.jsx'
import GenerateQuiz from './components/Student/GenerateQuiz.jsx'
import AvailableQuizzes from './components/Student/AvailableQuizzes.jsx'
import PreviousAttempts from './components/Student/PreviousAttempts.jsx'
import PracticeQuizAttempt from './components/Student/PracticeQuizAttempt.jsx'
import PracticeQuizReview from './components/Student/PracticeQuizReview.jsx'



function App() {
  return(
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/createquiz" element={<CreateQuiz />} />
      <Route path="/myquizzes" element={<MyQuizzes />} />
      <Route path="/quiz/:id" element={<QuizView />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/finalresults" element={<FinalResult />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/join-classroom" element={<JoinClassroom />} />
      <Route path="/student/practice-quiz" element={<PracticeQuiz />} />
      <Route path="/student/practice-quiz/generate-quiz" element={<GenerateQuiz />} />
      <Route path="/student/practice-quiz/available-quizzes" element={<AvailableQuizzes />} />
      <Route path="/student/practice-quiz/history" element={<PreviousAttempts />} />
      <Route path={'/student/practice-quiz/attempt/:id'} element={<PracticeQuizAttempt />} />
      <Route path="/student/practice-quiz/attempt/:id/review" element={<PracticeQuizReview />} />

    </Routes>


  )
}

export default App
