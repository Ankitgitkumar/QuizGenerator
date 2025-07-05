import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-10">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold font-sans text-violet-500 underline decoration-4 decoration-gray-500 text-center mb-8">
          Connect With Us!
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-40 text-center px-4">
          {/* Person 1 */}
          <div>
            <h3 className="text-xl text-gray-300 font-semibold mb-2">Ankit Kumar</h3>
            <ul className="space-y-1 text-gray-400">
              <li>
                <a href="https://www.linkedin.com/in/your-link" target="_blank" className="hover:text-white">🔗 LinkedIn</a>
              </li>
              <li>
                <a href="https://github.com/your-github" target="_blank" className="hover:text-white">💻 GitHub</a>
              </li>
              <li>
                <a href="mailto:ankitkumar26125@gmail.com" className="hover:text-white">📧 ankitkumar26125@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Person 2 */}
          <div>
            <h3 className="text-xl text-gray-300 font-semibold mb-2">Akhand Awasthi</h3>
            <ul className="space-y-1 text-gray-400">
              <li>
                <a href="https://www.linkedin.com/in/teammate-link" target="_blank" className="hover:text-white">🔗 LinkedIn</a>
              </li>
              <li>
                <a href="https://github.com/teammate-github" target="_blank" className="hover:text-white">💻 GitHub</a>
              </li>
              <li>
                <a href="mailto:2004akhand@gmail.com" className="hover:text-white">📧 2004akhand@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          &copy; 2025 QuizForge AI — Built with ❤️ by Akhand & Ankit
        </div>
      </div>
    </footer>
  );
}

export default Footer;
