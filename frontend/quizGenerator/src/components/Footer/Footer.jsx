import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer
      id="footer"
      className="bg-gradient-to-t from-black via-gray-950 to-gray-900 text-white py-12 mt-16 border-t border-white/10"
    >
      {/* glow line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent mb-10"></div>

      <div className="max-w-6xl mx-auto px-4">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
          Connect With Us
        </h2>

        {/* People */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-center">

          {/* Ankit */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-violet-400/20 transition">
            <h3 className="text-xl font-semibold text-white mb-4">Ankit Kumar</h3>

            <div className="flex justify-center gap-6 text-xl text-gray-400">

              <a
                href="https://www.linkedin.com/in/ankit-kumar-ab625b2b9"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 transition"
              >
                <FaLinkedin />
              </a>

              <a
                href="https://github.com/Ankitgitkumar"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                <FaGithub />
              </a>

              <a
                href="mailto:ankitkumar26125@gmail.com"
                className="hover:text-red-400 transition"
              >
                <FaEnvelope />
              </a>

            </div>
          </div>

          {/* Akhand */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-cyan-400/20 transition">
            <h3 className="text-xl font-semibold text-white mb-4">Akhand Awasthi</h3>

            <div className="flex justify-center gap-6 text-xl text-gray-400">

              <a
                href="https://www.linkedin.com/in/teammate-link"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 transition"
              >
                <FaLinkedin />
              </a>

              <a
                href="https://github.com/teammate-github"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                <FaGithub />
              </a>

              <a
                href="mailto:2004akhand@gmail.com"
                className="hover:text-red-400 transition"
              >
                <FaEnvelope />
              </a>

            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} QuizForge AI — Built with ❤️ by Ankit & Akhand
        </div>
      </div>
    </footer>
  );
}

export default Footer;