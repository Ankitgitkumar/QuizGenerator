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



const studentModel =Mongoose.model("User",studentSchema)
const teacherModel = Mongoose.model("Admin", teacherSchema);
const classModel = Mongoose.model("Course", classSchema);

export { studentModel, teacherModel, classModel };