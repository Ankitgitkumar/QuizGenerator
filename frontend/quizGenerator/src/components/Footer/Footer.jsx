import React from 'react'

function Footer() {
  return (
    <div>
      <footer class="bg-gray-900 text-white py-8 mt-10">
  <div class="max-w-5xl mx-auto px-4">
    <h2 class="text-3xl font-bold font-sans text-violet-500 underline decoration-4 decoration-gray-500 text-center mb-8">Connect With Us !</h2>

    <div class="flex items-center justify-center gap-80 text-center p-10">
      {/* <!-- Person 1 --> */}
      <div>
        <h3 class="text-xl text-gray-300 font-semibold mb-2">Ankit Kumar</h3>
        <ul class="space-y-1 text-gray-400">
          <li>
            <a href="https://www.linkedin.com/in/your-link" target="_blank" class="hover:text-white">🔗 LinkedIn</a>
          </li>
          <li>
            <a href="https://github.com/your-github" target="_blank" class="hover:text-white">💻 GitHub</a>
          </li>
          <li>
            <a href="mailto:youremail@example.com" class="hover:text-white">📧 ankitkumar26125@gmail.com</a>
          </li>
        </ul>
      </div>

      {/* <!-- Person 2 --> */}
      <div>
        <h3 class="text-xl text-gray-300 font-semibold mb-2">Akhand Awasthi</h3>
        <ul class="space-y-1 text-gray-400">
          <li>
            <a href="https://www.linkedin.com/in/teammate-link" target="_blank" class="hover:text-white">🔗 LinkedIn</a>
          </li>
          <li>
            <a href="https://github.com/teammate-github" target="_blank" class="hover:text-white">💻 GitHub</a>
          </li>
          <li>
            <a href="mailto:teammate@example.com" class="hover:text-white">📧 2004akhand@gmail.com</a>
          </li>
        </ul>
      </div>
    </div>

    {/* <!-- Bottom Note --> */}
    <div class="mt-10 text-center text-gray-500 text-sm">
      &copy; 2025 QuizForge AI — Built with ❤️ by Akhand & Ankit
    </div>
  </div>
</footer>

    </div>
  )
}

export default Footer
