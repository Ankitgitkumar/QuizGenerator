import Navbar from './components/Navbar/Navbar'
import Home from './components/Home/Home'
import React, { useState } from 'react'
import CreateQuiz from './Components/teacher/CreateQuiz'
import { Routes, Route } from 'react-router-dom'

import './App.css'
import './index.css'
import Dashboard from './Components/teacher/Dashboard'
import MyQuizzes from './components/Teacher/MyQuizzes.jsx'
import QuizView from './components/Teacher/QuizView.jsx'
import Leaderboard from './components/Teacher/Leaderboard.jsx'
import FinalResult from './components/Teacher/FinalResult.jsx'

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
    </Routes>
  )
}

export default App
