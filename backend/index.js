import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from "path";
import dotenv from "dotenv";


// Import routes
import teacherRoute from './routes/teacher.js';
import studentRoute from './routes/student.js';

import quizRoutes from './routes/teacher.js';
import classroomRoute from './routes/classroom.js'; 

dotenv.config();
const port = process.env.PORT || 3141;

const app = express();

// Middleware

app.use(express.json());
app.use(cors());
app.use(cors({
   origin: '*',
  // origin: 'https://quizforgeai-generator-24.vercel.app',
  credentials: true
}));


// Routes
app.use("/api/v1/teacher", teacherRoute);
app.use("/api/v1/student", studentRoute);

app.use("/api/v1/teacher/quizzes", quizRoutes);

// Mount classroom routes under both versioned and unversioned paths for backwards compatibility
app.use('/api/v1/classroom', classroomRoute);
app.use('/api/classroom', classroomRoute);

// Optional test route
app.get("/", (req, res) => {
  res.send("Quiz Generator API is running 🚀");
});


// MongoDB connection and server start
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
}

main();
