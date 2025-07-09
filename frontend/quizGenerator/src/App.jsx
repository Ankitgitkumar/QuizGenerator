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
<<<<<<< HEAD
import CreateQuiz from './components/Teacher/CreateQuiz.jsx'
import StudentDashboard from './components/Student/Dashboard.jsx'
import JoinClassroom from './components/Student/JoinClassroom.jsx'
import PracticeQuiz from './components/Student/PracticeQuiz.jsx'
import GenerateQuiz from './components/Student/GenerateQuiz.jsx'
import AvailableQuizzes from './components/Student/AvailableQuizzes.jsx'
import PreviousAttempts from './components/Student/PreviousAttempts.jsx'
import PracticeQuizAttempt from './components/Student/PracticeQuizAttempt.jsx'
import PracticeQuizReview from './components/Student/PracticeQuizReview.jsx'


=======
import Footer from './components/Footer/Footer.jsx'
import Signup from './components/register/Signup.jsx'
import Signin from './components/register/Signin.jsx'
>>>>>>> c51667835e8b7f9aab9ef694f351c55b27e0ab76

function App() {
  return(
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/teacher/dashboard" element={<Dashboard />} />
      <Route path="/createquiz" element={<CreateQuiz />} />
<<<<<<< HEAD
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

=======
      <Route path="/teacher/myquizzes" element={<MyQuizzes />} />
      <Route path="/teacher/quiz/:id" element={<QuizView />} />
      <Route path="/teacher/leaderboard" element={<Leaderboard />} />
      <Route path="/teacher/finalresults" element={<FinalResult />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
>>>>>>> c51667835e8b7f9aab9ef694f351c55b27e0ab76
    </Routes>
    <Footer/>
    </>


  )
}

export default App
