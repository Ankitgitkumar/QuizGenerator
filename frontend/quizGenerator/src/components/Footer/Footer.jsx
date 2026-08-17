import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer
      id="footer"
      className="bg-slate-50 border-t border-slate-200 text-slate-600 py-12 mt-16"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
          Connect With Us
        </h2>

        {/* People */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center max-w-3xl mx-auto">

          {/* Ankit */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-indigo-300 transition duration-300">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Ankit Kumar</h3>

            <div className="flex justify-center gap-6 text-xl text-slate-400">
              <a
                href="https://www.linkedin.com/in/ankit-kumar-ab625b2b9"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 transition"
              >
                <FaLinkedin />
              </a>

              <a
                href="https://github.com/Ankitgitkumar"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-800 transition"
              >
                <FaGithub />
              </a>

              <a
                href="mailto:ankitkumar26125@gmail.com"
                className="hover:text-red-500 transition"
              >
                <FaEnvelope />
              </a>
            </div>
          </div>

          {/* Akhand */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-indigo-300 transition duration-300">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Akhand Awasthi</h3>

            <div className="flex justify-center gap-6 text-xl text-slate-400">
              <a
                href="https://www.linkedin.com/in/teammate-link"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 transition"
              >
                <FaLinkedin />
              </a>

              <a
                href="https://github.com/teammate-github"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-800 transition"
              >
                <FaGithub />
              </a>

              <a
                href="mailto:2004akhand@gmail.com"
                className="hover:text-red-500 transition"
              >
                <FaEnvelope />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 text-center text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} QuizForge AI — Built with ❤️ by Ankit & Akhand
        </div>
      </div>
    </footer>
  );
}

export default Footer;