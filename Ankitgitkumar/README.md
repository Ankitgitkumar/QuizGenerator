# 👋 Hi, I'm Ankit Kumar! 🚀

### **B.Tech Undergraduate in Electronics & Communication Engineering @ BIT Mesra**
*Full-Stack Developer & GenAI Enthusiast | Passionate about building scalable applications and agentic workflows.*

<p align="left">
  <a href="https://linkedin.com/in/ankit-kumar-ab625b2b9" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="mailto:ankitkumar26125@gmail.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />
  </a>
  <a href="https://leetcode.com/u/Ankit_7530/" target="_blank">
    <img src="https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=black" alt="Leetcode" />
  </a>
</p>

---

### 💫 About Me
- 🎓 Pursuing my **B.Tech at Birla Institute of Technology, Mesra** (Batch of 2023 - 2027) with a current **CGPA of 8.15**.
- 🛠️ Developing production-grade full-stack web applications using the **MERN stack**, combined with caching (Redis), task queues (BullMQ), and cloud deployments.
- 🤖 Building intelligent applications powered by **Gemini AI**, using **Retrieval-Augmented Generation (RAG)** and **Agentic Workflows** to solve real-world problems.
- 🏆 Passionate about problem-solving, active in competitive programming, and a hackathon enthusiast.

---

### 🛠️ Tech Stack & Skills

<table>
  <tr>
    <td align="center" width="20%"><strong>Languages</strong></td>
    <td align="left">
      <img src="https://img.shields.io/badge/C++-00599C?style=flat-square&logo=c%2B%2B&logoColor=white" alt="C++" />
      <img src="https://img.shields.io/badge/C-A8B9CC?style=flat-square&logo=c&logoColor=black" alt="C" />
      <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
      <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Web Dev</strong></td>
    <td align="left">
      <img src="https://img.shields.io/badge/React.js-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
      <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node" />
      <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
      <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
      <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
      <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white" alt="Bootstrap" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Data & Cache</strong></td>
    <td align="left">
      <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
      <img src="https://img.shields.io/badge/BullMQ-FF3366?style=flat-square&logo=fastapi&logoColor=white" alt="BullMQ" />
      <img src="https://img.shields.io/badge/Pinecone-000000?style=flat-square&logoColor=white" alt="Pinecone DB" />
      <img src="https://img.shields.io/badge/SQL-4479A1?style=flat-square&logo=postgresql&logoColor=white" alt="SQL" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>AI & GenAI</strong></td>
    <td align="left">
      <img src="https://img.shields.io/badge/Gemini%20AI-1A73E8?style=flat-square&logo=google-gemini&logoColor=white" alt="Gemini" />
      <img src="https://img.shields.io/badge/RAG%20Pipeline-FF6F61?style=flat-square" alt="RAG" />
      <img src="https://img.shields.io/badge/Agentic%20AI-8A2BE2?style=flat-square" alt="Agentic AI" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Tools & Cloud</strong></td>
    <td align="left">
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
      <img src="https://img.shields.io/badge/AWS%20EC2-FF9900?style=flat-square&logo=amazon-ec2&logoColor=white" alt="AWS EC2" />
      <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white" alt="Git" />
      <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
      <img src="https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white" alt="Postman" />
    </td>
  </tr>
</table>

---

### 📂 Featured Projects

#### 🎓 [QuizForge AI](https://github.com/Ankitgitkumar/QuizGenerator)
> **AI-Powered Quiz Generation Platform** 
> *React, Node.js, Express, MongoDB, Gemini 2.5 Flash, Pinecone, Redis, BullMQ, Docker*
- Engineered an AI-powered quiz platform utilizing a **RAG (Retrieval-Augmented Generation)** pipeline to ingest and parse multi-page PDFs, chunking and embedding documents into 3072-dimensional vectors for semantic context search using **Pinecone**.
- Decoupled PDF ingestion and vectorization using **BullMQ & Redis** asynchronous background workers, keeping the main Express event loop non-blocking and highly responsive.
- Designed a caching architecture with **Redis** to eliminate redundant GenAI API calls, reducing response latency to **<10ms** (cache hits).
- Implemented real-time classroom and global leaderboards using **Redis Sorted Sets (ZSET)**, updating student scores and ranks in **O(log N)** complexity.
- Hardened API endpoints with role-based JWT auth, custom rate limiting, and structured logging, establishing a **GitHub Actions CI/CD pipeline** running automated **Jest** tests.

#### 💬 [PocketBuddy AI](https://github.com/Ankitgitkumar/PocketBuddyAI)
> **Agentic Financial & Wellness Companion for College Students**
> *React, Node.js, Express, MongoDB, Gemini AI, Google Fit API, Chart.js*
- Built a student financial/wellness platform, designing an **Agentic Analytics Workflow** using **Gemini AI** to synthesize expense history, sleep, stress, and mood data to compute real-time burnout-risk assessments.
- Integrated **Google Fit API** to automate real-time synchronization of student health metrics (activity, sleep data), pipeline-enriching wellness insights, and Google Gemini AI for automated OCR transaction extraction from UPI screenshots.
- Structured flexible schemas using **MongoDB** and optimized historical query execution speeds using composite database indexes on student finance data and wellness history.

#### 🌐 [E-Summit '25 Website](https://github.com/Ankitgitkumar/e-summit-25)
> **Official Website for BIT Mesra's Flagship Entrepreneurship Event**
> *React.js, Tailwind CSS, OpenAPI*
- Developed responsive components including the Sponsors, Contact, and Footer modules.
- Managed live technical issues and resolved 100+ critical queries in real-time.
- Contributed to a **40% increase** in online registrations and a **27% boost** in overall event participation.

---

### 🏆 Achievements
- **Top 300 / 30,000+ Teams** — HackOn with Amazon 6.0 (Passed coding assessment and qualified for the 48-hour Virtual Hackathon).
- **2nd Rank** — Lead 5.0 (Technical and leadership challenge organized by IEEE Student Branch, BIT Mesra).

---

### 📊 GitHub Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=Ankitgitkumar&show_icons=true&theme=tokyonight&count_private=true" alt="Ankit's GitHub Stats" height="195" />
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=Ankitgitkumar&layout=compact&theme=tokyonight" alt="Top Langs" height="195" />
</p>

<p align="center">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=Ankitgitkumar&theme=tokyonight" alt="GitHub Streak" />
</p>

---

### 📫 Connect With Me
- 📧 Email: **ankitkumar26125@gmail.com**
- 💼 LinkedIn: [linkedin.com/in/ankit-kumar-ab625b2b9](https://linkedin.com/in/ankit-kumar-ab625b2b9)
- 📝 LeetCode: [leetcode.com/u/Ankit_7530/](https://leetcode.com/u/Ankit_7530/)

*“Always building, always learning.”*
