import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Types;

// ─── PreviousQuiz Schema ──────────────────────────────────────────────────────

const previousQuizSchema = new Schema({
  studentId: { type: ObjectId, ref: "Student", required: true },
  quizId: { type: ObjectId, ref: "Quiz", required: true },
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
  disqualified: { type: Boolean, default: false },
});

// Index: fetch all attempts by a student quickly, sorted by most recent
previousQuizSchema.index({ studentId: 1, attemptedAt: -1 });
// Index: fetch all results for a quiz (teacher view)
previousQuizSchema.index({ quizId: 1 });

// ─── Student Schema ───────────────────────────────────────────────────────────

const studentSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  classId: { type: ObjectId, ref: "Classroom" },
});

// Index: look up all students in a classroom
studentSchema.index({ classId: 1 });

// ─── Teacher Schema ───────────────────────────────────────────────────────────

const teacherSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
});

// ─── Question Schema ──────────────────────────────────────────────────────────

const questionSchema = new Schema({
  quiz: { type: ObjectId, ref: "Quiz", required: true },
  questionText: { type: String, required: true },
  type: { type: String, enum: ["mcq", "one-line"], required: true },
  options: { type: [String], default: [] },
  correctAnswer: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  createdAt: { type: Date, default: Date.now },
});

// Index: find all questions belonging to a quiz
questionSchema.index({ quiz: 1 });

// ─── Quiz Schema ──────────────────────────────────────────────────────────────

const quizSchema = new Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [{ type: ObjectId, ref: "Question" }],
  createdBy: { type: ObjectId, ref: "Teacher", required: true },
  createdAt: { type: Date, default: Date.now },
  scheduleAt: { type: Date, default: null },
  isScheduled: { type: Boolean, default: false },
  pdf: String,
  duration: Number, // in minutes
  numberOfQuestions: Number,
  // 'processing' → background RAG job running
  // 'ready'      → questions saved, quiz usable
  // 'failed'     → RAG job failed
  status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'ready' },
});

// Compound index: teacher's quiz list sorted by newest first
quizSchema.index({ createdBy: 1, createdAt: -1 });
// Index: scheduled quizzes (for availability checks)
quizSchema.index({ isScheduled: 1, scheduleAt: 1 });

// ─── Classroom Schema ─────────────────────────────────────────────────────────

const classSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  teacher: { type: ObjectId, ref: "Teacher", required: true },
  quizzes: [{ type: ObjectId, ref: "Quiz" }],
  students: [{ type: ObjectId, ref: "Student" }],
});

// Index: find all classrooms for a teacher
classSchema.index({ teacher: 1 });

// ─── Model Exports ────────────────────────────────────────────────────────────

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
  previousQuizModel,
};
