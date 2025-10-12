
import { response } from "express";
import mongoose, { Schema } from "mongoose";
import { type } from "os";

const { ObjectId } = mongoose.Types;

const previousQuizSchema = new Schema({
  studentId: { type:ObjectId, ref: "Student", required: true },
  quizId: { type: ObjectId, ref: "Quiz"},
  responses: {
    type: Map,
    of: String, 
    required: true,
  },
  questions: [
    {
      questionText: { type: String, required: true },
      type: { type: String, enum: ["mcq", "one-line"], required: true },
      options: { type: [String], default: [] },
      correctAnswer: { type: String, required: true },
    },
  ],
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
  score: { type: Number, required: true },
});

   



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
  code: { type: String, required: true, unique: true },
  teacher: { type: ObjectId, ref: "Teacher", required: true },
});



// Model Export

const studentModel = mongoose.model("Student", studentSchema);

const teacherModel = mongoose.model("Teacher", teacherSchema);

const quizModel = mongoose.model("Quiz", quizSchema);

const questionModel = mongoose.model("Question", questionSchema); 

const classModel = mongoose.model("Classroom", classSchema);

const previousQuizModel = mongoose.model("PreviousQuiz", previousQuizSchema);

export default {

studentModel,

teacherModel,

quizModel,

questionModel, 

classModel,

previousQuizModel

};
