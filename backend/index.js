import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from "path";
import dotenv from "dotenv";

// Import routes
import teacherRoute from './routes/teacher.js';
import studentRoute from './routes/student.js';

import quizRoutes from './routes/teacher.js'; 

dotenv.config();

const app = express();

// Middleware

app.use(express.json());
app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));





app.use("/api/v1/teacher",teacherRoute)
app.use("/api/v1/student",studentRoute)





// Routes
app.use("/api/v1/teacher", teacherRoute);
app.use("/api/v1/student", studentRoute);

app.use("/api/v1/teacher/quizzes", quizRoutes);

// Optional test route
app.get("/", (req, res) => {
  res.send("Quiz Generator API is running 🚀");
});


// MongoDB connection and server start
async function main() {
  try {
    await mongoose.connect("mongodb+srv://quizforgeai:aiquizgenerator24@quizai.xhijqdh.mongodb.net/quizforge");
    console.log("Connected to MongoDB");

    app.listen(3141, () => {
      console.log(`Server running at http://localhost:3141`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
}

main();
