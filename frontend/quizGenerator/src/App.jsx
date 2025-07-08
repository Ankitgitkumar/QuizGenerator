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
import Footer from './components/Footer/Footer.jsx'
import Signup from './components/register/Signup.jsx'
import Signin from './components/register/Signin.jsx'

function App() {
  return(
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/createquiz" element={<CreateQuiz />} />
      <Route path="/myquizzes" element={<MyQuizzes />} />
      <Route path="/quiz/:id" element={<QuizView />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/finalresults" element={<FinalResult />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
    </Routes>
    <Footer/>
    </>


  )
}

export default App
