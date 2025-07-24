import { testModel,classModel } from "../db";
import express from "express";
const route = express.Router();

route.post("/create",async(req,res)=>{
        
        const {title,topic,startTime,endTime,duration,classroom}=req.body;

   const classR = await classModel.findOne({name:classroom});
    if(!classId){
        return res.status(404).send("Classroom not found");
    }
    try{
        const test = await testModel.create({
            title,
            topic,
            startTime,
            endTime,
            duration,
            classId:classR._id
        });
        res.status(201).json({ message: "Test created successfully", test });
    } catch (error) {
        res.status(500).send("Error creating test: " + error.message);
    }

})


export default route;