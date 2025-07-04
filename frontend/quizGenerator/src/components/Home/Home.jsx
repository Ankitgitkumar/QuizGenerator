import React from 'react'
import TypeIt from 'typeit-react'
function Home() {
  return (
    <div className=''>

 
    
    <h1 className='gradient-text text-center text-5xl font-poppins font-extrabold pt-8 mt-20 text-white-400 z-10'>
       QuizForge AI

      </h1>
      <p className=' text-center text-lg font-sans text-gray-400  mt-10'>

      <TypeIt
              options={{ speed: 50,  }}
              getBeforeInit={(instance) => {
                instance
                .type("Smarter Quizzes, Instantly Generated. Powered by AI. Driven by Curiosity.")
                
                
                return instance;
              }}
              />
                </p>

      
    
    <div className='grid grid-cols-2 gap-30 mt-20 z-10'>
            <div className='flex flex-col items-center text-center border-2 border-gray-500 rounded-2xl p-5 ml-80 bg-gray-800 '>
              <div>
              <h1 className='text-red-500 font-bold text-3xl z-10 '>For Teachers</h1>
              <ul className='text-gray-400 text-lg text-left  font-sans list-disc ml-5 p-8'>
                <li>Able to create test on any topic you want.</li>
                <li>Schedule the test for selected students.</li>
                <li>Analyze the students based on their live test performance.</li>
              </ul>
              </div>
              <div className='flex  gap-15 mt-13 p-5 '> 
                <button className='bg-gray-400 p-2  text-black rounded-lg font-bold text-lg'>Sign in</button>
                <button className='bg-gray-400 p-2  text-black rounded-lg font-bold text-lg'>Sign up</button>
              </div>
            </div>
            <div className='text-center border-2 border-gray-500 rounded-2xl p-5 mr-80 bg-gray-800 '>
              <h1 className='text-blue-600 font-bold text-3xl '>For Students</h1>
              <ul className='text-gray-400 text-lg text-left  font-sans list-disc ml-5 p-8'>
                <li>Able to give test as per scheduled by teacher and can also practice for test.</li>
                <li>Able to view live leaderboard during the test.</li>
                <li>Able to view the previous attempted tests and analyze your performance.</li>
              </ul>

              <div className='flex justify-evenly gap-10 p-5 mr-5'> 
                <button className='bg-gray-400 p-2  text-black rounded-lg font-bold text-lg'>Sign in</button>
                <button className='bg-gray-400 p-2  text-black rounded-lg font-bold text-lg'>Sign up</button>
              </div>
            </div>
    </div>
    <div className=' text-center z-10 mt-35' >
      <h1 className='underline decoration-4 decoration-gray-700 text-4xl text-purple-500 font-bold font-sans '>About</h1>
     <p className='text-gray-400 px-40 py-10 text-lg text-left'>At QuizForge AI, we’re transforming the way tests are created, delivered, and analyzed. Built for both teachers and students, our AI-powered platform makes quiz generation effortless and intelligent. Teachers can instantly create customized tests on any topic, schedule them for selected students, and monitor real-time performance with detailed analytics. No more manual question-setting or paper corrections—just smart automation that saves time.

For students, QuizForge AI offers a dynamic testing experience. Participate in scheduled tests, practice anytime, and see where you stand with a live leaderboard. After the test, dive into detailed performance insights and track your progress over time.

Whether you're preparing for exams or simplifying assessments, QuizForge AI brings speed, accuracy, and interactivity to the process. Designed to empower educators and engage learners, we’re here to make testing smarter, faster, and more effective for everyone.

QuizForge AI – Forge smarter learning with AI.</p> 
    </div>
              </div>
    
  )
}

export default Home
