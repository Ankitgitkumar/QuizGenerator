import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app=express();
app.use(express.json());
app.use(cors()); 

import teacherRoute from './routes/teacher.js';
import studentRoute from './routes/student.js';
import classroomRoute from './routes/classroom.js';
import testRoute from './routes/test.js';

app.use("/api/v1/teacher",teacherRoute)
app.use("/api/v1/student",studentRoute)
app.use("/api/v1/classroom",classroomRoute)
app.use("/api/v1/test",testRoute)


async function  main(){

 await mongoose.connect("mongodb+srv://quizforgeai:aiquizgenerator24@quizai.xhijqdh.mongodb.net/quizforge")
app.listen(3141, () => {
    console.log(`Server running at http://localhost:3141`);
  });
  console.log("Connected to MongoDB");
}

main();