import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className='bg-black md:bg-[#12151f] text-white py-4 px-6'>
      <div className='flex justify-between items-center'>
        {/* Logo */}
        <h1 className='text-lg font-poppins text-purple-500 font-bold'>QuizForge AI</h1>

        {/* Desktop Menu */}
        <div className='hidden md:flex gap-6 items-center '>
          <div className='text-lg  font-semibold hover:text-purple-400 cursor-pointer'>Home</div>
          <div className='text-lg font-semibold hover:text-purple-400 cursor-pointer'>About</div>
          <div className='text-lg font-semibold hover:text-purple-400 cursor-pointer'>Contact</div>
          <button onClick={()=>navigate("/signin")} className='bg-gray-400 px-3 py-1 text-black rounded-lg font-bold'>Sign in</button>
          <button onClick={()=>navigate("/signup")} className='bg-gray-400 px-3 py-1 text-black rounded-lg font-bold'>Sign up</button>
        </div>

        {/* Mobile Menu Button */}
        <div className='md:hidden'>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className='md:hidden mt-4 space-y-3'>
          <div className='block text-lg font-semibold hover:text-purple-400'>Home</div>
          <div className='block text-lg font-semibold hover:text-purple-400'>About</div>
          <div className='block text-lg font-semibold hover:text-purple-400'>Contact</div>
          <button onClick={()=>navigate("/signin")} className=' bg-gray-400 px-3 mr-3 py-2 text-black rounded-lg font-bold'>Sign in</button>
          <button onClick={()=>navigate("/signup")} className=' bg-gray-400 px-3 mx-3 py-2 text-black rounded-lg font-bold'>Sign up</button>
        </div>
      )}
    </div>
  );
}

export default Navbar;
