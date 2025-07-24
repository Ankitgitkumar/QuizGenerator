import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
<<<<<<< HEAD
import models from "../db.js";
const studentModel = models.studentModel;

=======
import { studentModel,classModel } from "../db.js";
>>>>>>> f7b7c122fc0c616b74c22333f8d4368e5848870f
import express from "express"
import studentMiddleware from "../middlewares/student.js";
const route = express.Router();
const JWT_STUDENT_PASSWORD="student_password_jwt"

route.post("/signup",async (req,res)=> {
    try{
    const {email,password,firstName,lastName}=req.body;
    
    const hashedPassword= await bcrypt.hash(password,10);

   await studentModel.create({
        email,
        password:hashedPassword,
        firstName,
        lastName,
    })

    res.send("Student signed up");
}
catch(e){
    res.send("Error signing up user: " + e.message);
}
})

route.post('/signin', async (req,res)=> {
    try {
        const {email,password}=req.body;
        const student =await studentModel.findOne({email});
        if(!student){
            return res.status(404).send("Student Not Found");
        }
        const isPasswordCorrect = await bcrypt.compare(password, student.password);
        if(!isPasswordCorrect){
            return res.status(401).send("Incorrect Password");
        }
        const token=jwt.sign(
            {
                studentId:student._id,
             
            },JWT_STUDENT_PASSWORD
        )

        res.status(200).json({ message: "Student signed in", token });

    } catch (error) {
        res.status(500).send("Error signing in user: " + error.message);
    }
})

route.post("/joinclassroom",studentMiddleware, async (req,res)=>{
    const {classroomCode}=req.body;
    
    const existingClass = await classModel.findOne({ _id:classroomCode})

    if(!existingClass){
        return res.status(404).send("Classroom Not found");
    }

   const student=await existingClass.students.push(req.id);
   if(!student){
        return res.status(404).send("Student not found in classroom");
   }
   await existingClass.save();

    res.status(200).send("Student joined classroom successfully");

   

})

export default route;