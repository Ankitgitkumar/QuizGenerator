
import mongoose, { Schema } from "mongoose";

<<<<<<< HEAD
const { ObjectId } = mongoose.Types;
=======
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
    creatorId:ObjectId,
    students:[{ type: ObjectId, ref: 'Student' }],

})
>>>>>>> f7b7c122fc0c616b74c22333f8d4368e5848870f

const testSchema =new Schema({
    title:String,
    topic:String,
    startTime: {
        type: Date,
        required: true,
      },
    endTime: {
        type: Date,
        required: true,
      },
    duration:Number,  //in minutes
     classId:ObjectId,
})



<<<<<<< HEAD
// Student Schema

const studentSchema = new Schema({

email: { type: String, unique: true, required: true },

password: { type: String, required: true },

firstName: String,

lastName: String,

classId: { type: ObjectId, ref: "Classroom" },

});



// Teacher Schema

const teacherSchema = new Schema({

email: { type: String, unique: true, required: true },

password: { type: String, required: true },

firstName: String,

lastName: String,

});



// Question Schema 

const questionSchema = new Schema({

quiz: { type: ObjectId, ref: "Quiz", required: true }, 

questionText: { type: String, required: true }, 

type: { type: String, enum: ["mcq", "one-line"], required: true }, 

options: { type: [String], default: [] }, 

correctAnswer: { type: String, required: true },

createdAt: { type: Date, default: Date.now } 

});



// Quiz Schema 

const quizSchema = new Schema({

title: { type: String, required: true },

topic: { type: String, required: true },

questions: [{ type: ObjectId, ref: "Question" }], 

createdBy: { type: ObjectId, ref: "Teacher", required: true },

createdAt: { type: Date, default: Date.now },

scheduleAt: {

type: Date,

default: null,

},

isScheduled: {

type: Boolean,

default: false,

},

pdf: String, 

duration: Number, // in minutes

});



// Class Schema

const classSchema = new Schema({

name: { type: String, required: true },

creatorId: { type: ObjectId, ref: "Teacher", required: true },

});



// Model Export

const studentModel = mongoose.model("Student", studentSchema);

const teacherModel = mongoose.model("Teacher", teacherSchema);

const quizModel = mongoose.model("Quiz", quizSchema);

const questionModel = mongoose.model("Question", questionSchema); 

const classModel = mongoose.model("Classroom", classSchema);



export default {

studentModel,

teacherModel,

quizModel,

questionModel, 

classModel,

};
=======
const studentModel =Mongoose.model("Student",studentSchema)
const teacherModel = Mongoose.model("Teacher", teacherSchema);
const classModel = Mongoose.model("Classroom", classSchema);
const testModel = Mongoose.model("Test", testSchema);

export { studentModel, teacherModel, classModel, testModel };
>>>>>>> f7b7c122fc0c616b74c22333f8d4368e5848870f
