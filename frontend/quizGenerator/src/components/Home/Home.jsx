import React from 'react'
import TypeIt from 'typeit-react'
function Home() {
  return (
    <div className='bg-gradient-to-br from-black via-zinc-800 to-zinc-900 w-full h-screen'>

    <div className='flex flex-col justify-center items-center'>
      <h1 className='text-center text-5xl font-poppins text-gray-200 font-extrabold pt-20 '>
       QuizForge AI

      </h1>
      <p className=' text-lg font-sans text-gray-400  mt-10'>

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
