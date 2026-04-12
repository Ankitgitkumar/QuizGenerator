import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import models from "../db.js";
const teacherModel = models.teacherModel;
const JWT_TEACHER_PASSWORD = "teacher_password_jwt";
import { updateQuestion } from "../controllers/questionController.js";
import {getTeacherProfile} from "../controllers/teacherController.js";

import express from "express";

const route = express.Router();

import {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  getQuizResults,
  scheduleQuiz,
  editQuiz,
  deleteQuiz,

} from "../controllers/quizController.js";
import teacherMiddleware from "../middlewares/teacher.js";
import upload from "../middlewares/multer.js";



route.post("/signup", async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

   await teacherModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
    })

    // Fetch the newly created teacher so we can return a token and basic profile
    const teacher = await teacherModel.findOne({ email });
    const token = jwt.sign({ teacherId: teacher._id.toString() }, JWT_TEACHER_PASSWORD);
    const teacherData = {
      _id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
    };

    res.status(201).json({ message: 'Teacher signed up', token, teacher: teacherData });
}
catch(e){
    if (e.code === 11000) {
        return res.status(400).json({ message: 'Email already exists. Please use a different email or sign in.' });
    }
    res.status(500).json({ message: "Error signing up user: " + e.message });
}
})

route.post('/signin', async (req,res)=> {
    try {
        const {email,password}=req.body;
        const teacher =await teacherModel.findOne({email});
        if(!teacher){
            return res.status(404).send("User Not Found");
        }
        const isPasswordCorrect = await bcrypt.compare(password, teacher.password);
        if(!isPasswordCorrect){
            return res.status(401).send("Incorrect Password");
        }
        const token = jwt.sign(
            { teacherId: teacher._id.toString() },
            JWT_TEACHER_PASSWORD
        );

        // Return a small teacher object along with the token to avoid immediate /me call from the client
        const teacherData = {
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
        };

        res.status(200).json({ message: "Teacher signed in", token, teacher: teacherData });

    } catch (error) {
        res.status(500).send("Error signing in user: " + error.message);
    }
})


route.get("/me",teacherMiddleware, getTeacherProfile);

route.post("/create", teacherMiddleware, upload.single("pdf"), createQuiz);
route.get("/quizzes", teacherMiddleware, getMyQuizzes);

route.patch("/quiz/:id/schedule", teacherMiddleware, scheduleQuiz); // Schedule quiz
route.patch("/quiz/:id", teacherMiddleware, editQuiz);              // Edit quiz
route.delete("/quiz/:id", teacherMiddleware, deleteQuiz);  // Delete quiz
route.patch("/question/:id",teacherMiddleware, updateQuestion);

route.get("/quiz/:id/results", teacherMiddleware, getQuizResults);

//Keep dynamic :id route at the bottom
route.get("/:id", teacherMiddleware, getQuizById);




export default route; 