import mongoose from "mongoose";
import Mongoose, { Schema } from "mongoose";
const { ObjectId } = Mongoose.Types;


const studentSchema=new Schema(
    {
        email:{type:String,unique:true},
        password:String,
        firstName:String,
        lastName:String,
        classId:ObjectId
    }
)

const teacherSchema=new Schema({
    email:{type:String,unique:true},
    password:String,
    firstName:String,
    lastName:String,
})

const classSchema =new Schema({
    name:String,
    creatorId:ObjectId

})



const studentModel =Mongoose.model("Student",studentSchema)
const teacherModel = Mongoose.model("Teacher", teacherSchema);
const classModel = Mongoose.model("Classroom", classSchema);

export { studentModel, teacherModel, classModel };