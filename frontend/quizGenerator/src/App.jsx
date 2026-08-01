import Navbar from './components/Navbar/Navbar'
import Home from './components/Home/Home'
import React from 'react'

import { Routes, Route } from 'react-router-dom'

import './App.css'
import './index.css'

import Dashboard from './components/Teacher/Dashboard.jsx'
import MyQuizzes from './components/Teacher/MyQuizzes.jsx'
import QuizView from './components/Teacher/QuizView.jsx'
import Leaderboard from './components/Teacher/Leaderboard.jsx'
import FinalResult from './components/Teacher/FinalResult.jsx'
import QuizResults from './components/Teacher/QuizResults.jsx'
import CreateQuiz from './components/Teacher/CreateQuiz.jsx'

import StudentDashboard from './components/Student/Dashboard.jsx'
import JoinClassroom from './components/Student/JoinClassroom.jsx'
import StudentClassroom from './components/Student/StudentClassroom.jsx'

import PracticeQuiz from './components/Student/PracticeQuiz.jsx'
import GenerateQuiz from './components/Student/GenerateQuiz.jsx'
import AvailableQuizzes from './components/Student/AvailableQuizzes.jsx'
import PreviousAttempts from './components/Student/PreviousAttempts.jsx'
import QuizAttempt from './components/Student/PracticeQuizAttempt.jsx'
import PracticeQuizReview from './components/Student/PracticeQuizReview.jsx'
import StudentLeaderboard from './components/Student/StudentLeaderboard.jsx'

import Footer from './components/Footer/Footer.jsx'
import Signup from './components/register/Signup.jsx'
import Signin from './components/register/Signin.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/teacher/dashboard" element={<Dashboard />} />
        <Route path="/teacher/createquiz" element={<CreateQuiz />} />
        <Route path="/teacher/myquizzes" element={<MyQuizzes />} />
        <Route path="/teacher/quiz/:id" element={<QuizView />} />
        <Route path="/teacher/leaderboard" element={<Leaderboard />} />
        <Route path="/teacher/quiz/:id/results" element={<QuizResults />} />
        <Route path="/teacher/finalresults" element={<FinalResult />} />

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/join-classroom" element={<JoinClassroom />} />
        <Route path="/student/classroom" element={<StudentClassroom />} />

        <Route path="/student/practice-quiz" element={<PracticeQuiz />} />
        <Route path="/student/practice-quiz/generate-quiz" element={<GenerateQuiz />} />
        <Route path="/student/practice-quiz/available-quizzes" element={<AvailableQuizzes />} />
        <Route path="/student/practice-quiz/history" element={<PreviousAttempts />} />

        <Route path="/student/quiz/attempt/:quizid" element={<QuizAttempt />} />
        <Route path="/student/quiz/attempt/:quizid/review" element={<PracticeQuizReview />} />
        <Route path="/student/leaderboard" element={<StudentLeaderboard />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </>
  )
}

export default App