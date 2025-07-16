import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { teacherModel ,classModel} from "../db.js";
import express from "express";
import teacherMiddleware from "../middlewares/teacher.js";
const route = express.Router();
const JWT_TEACHER_PASSWORD="teacher_password_jwt"

route.post("/signup",async (req,res)=> {
    try{
    const {email,password,firstName,lastName}=req.body;
    
    const hashedPassword= await bcrypt.hash(password,10);

   await teacherModel.create({
        email,
        password:hashedPassword,
        firstName,
        lastName,
    })

    res.send("teacher signed up");
}
catch(e){
    res.send("Error signing up user: " + e.message);
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
        const token=jwt.sign(
            {
                teacherId:teacher._id,
             
            },JWT_TEACHER_PASSWORD
        )

        res.status(200).json({ message: "Teacher signed in", token });

    } catch (error) {
        res.status(500).send("Error signing in user: " + error.message);
    }
})

route.post("/create-classroom",teacherMiddleware, async (req,res)=>{
    const {name}=req.body;

    const newclassroom= await classModel.create({
        name,
        creatorId:req.Id
    });

    if(!newclassroom){
        return res.status(500).send("Error creating classroom");
    }
    res.status(201).json({ message: "Classroom created successfully", classroom: newclassroom });
    
})

export default route; 