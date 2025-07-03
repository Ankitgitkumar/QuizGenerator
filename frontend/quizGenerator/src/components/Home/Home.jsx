import React from 'react'
import TypeIt from 'typeit-react'
function Home() {
  return (
    <div className='bg-grid'>

    <div className=' items-center flex flex-col justify-center'>         
      <h1 className='gradient-text text-center text-5xl font-poppins font-extrabold pt-8 text-white-400 z-10'>
       QuizForge AI

      </h1>
      <p className='text-lg font-sans text-gray-100 mt-10 z-10'>

      <TypeIt
              options={{ speed: 50,  }}
              getBeforeInit={(instance) => {
                  instance
                  .type("Smarter Quizzes, Instantly Generated. Powered by AI. Driven by Curiosity.")
                  
                  
                  return instance;
                }}
                />
                </p>
    </div>
    </div>
  )
}

export default Home
