import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { studentModel } from "../db";


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