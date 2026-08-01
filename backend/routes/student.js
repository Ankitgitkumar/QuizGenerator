import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pdfParse from "pdf-parse";
import express from "express";
import models from "../db.js";
import { generateQuizFromText } from "../utils/gemini.js";
import { getCache, setCache, invalidateCache } from "../utils/cache.js";
import upload from "../middlewares/multer.js";
import studentMiddleware from "../middlewares/student.js";
import { validate } from "../middlewares/validate.js";
import { aiGenerationLimiter, authLimiter } from "../middlewares/rateLimiter.js";
import {
  signupSchema,
  signinSchema,
  studentGenerateQuizSchema,
  submitQuizSchema,
  joinClassroomSchema,
} from "../schemas/quizSchemas.js";
import logger from "../utils/logger.js";
import { addScore } from "../utils/leaderboard.js";

const { studentModel, quizModel, classModel, questionModel: Question, previousQuizModel: PreviousQuiz } = models;
const JWT_STUDENT_PASSWORD = process.env.JWT_STUDENT_PASSWORD || "student_password_jwt";

const route = express.Router();

// Cache key helpers
const practiceQuizListKey = (studentId) => `quiz:practice:list:${studentId}`;
const aiGenerationCacheKey = (topic) =>
  `quiz:ai:student:${crypto.createHash("md5").update(topic.trim().toLowerCase()).digest("hex")}`;

// ─── Auth ─────────────────────────────────────────────────────────────────────

route.post("/signup", authLimiter, validate(signupSchema), async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await studentModel.create({ email, password: hashedPassword, firstName, lastName });
    const token = jwt.sign({ studentId: student._id }, JWT_STUDENT_PASSWORD);
    logger.info("Student signed up", { email });
    res.status(201).json({ message: "Student signed up", token, student });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: "Email already exists. Please use a different email or sign in." });
    }
    logger.error("Student signup error", { error: e.message });
    res.status(500).json({ message: "Error signing up user: " + e.message });
  }
});

route.post("/signin", authLimiter, validate(signinSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await studentModel.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const isPasswordCorrect = await bcrypt.compare(password, student.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ studentId: student._id }, JWT_STUDENT_PASSWORD);
    logger.info("Student signed in", { email });
    res.status(200).json({ message: "Student signed in", token, student });
  } catch (error) {
    logger.error("Student signin error", { error: error.message });
    res.status(500).json({ message: "Error signing in user: " + error.message });
  }
});

// ─── Classroom ────────────────────────────────────────────────────────────────

route.post("/joinclassroom", studentMiddleware, validate(joinClassroomSchema), async (req, res) => {
  const { code } = req.body;

  const existingClass = await classModel.findOne({ code });
  if (!existingClass) return res.status(404).json({ error: "Classroom not found" });

  if (!existingClass.students.includes(req.studentId)) {
    existingClass.students.push(req.studentId);
    await existingClass.save();
  }
  await studentModel.findByIdAndUpdate(req.studentId, { classId: existingClass._id });

  logger.info("Student joined classroom", { studentId: req.studentId, code });
  res.status(200).json({ message: "Student joined classroom successfully" });
});

// ─── Generate Practice Quiz (with caching) ────────────────────────────────────

route.post(
  "/quizzes/create",
  studentMiddleware,
  aiGenerationLimiter,
  upload.single("pdf"),
  async (req, res) => {
    const { topic } = req.body;
    const studentId = req.studentId;
    const numberOfQuestions = 10;

    let content = topic;

    if (req.file && fs.existsSync(req.file.path)) {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
      fs.unlinkSync(req.file.path);
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "No content provided for quiz generation (either topic or PDF)." });
    }
    if (!topic || topic.trim() === "") {
      return res.status(400).json({ error: "Topic is required." });
    }

    // ── Cache check (topic-only, not PDF) ──
    let generatedQuestions = null;
    let cacheKey = null;
    let fromCache = false;

    if (!req.file && topic.trim()) {
      cacheKey = aiGenerationCacheKey(topic);
      const cached = await getCache(cacheKey);
      if (cached) {
        logger.info("Cache HIT: student AI generation", { topic });
        generatedQuestions = cached;
        fromCache = true;
      }
    }

    if (!generatedQuestions) {
      logger.info("Generating student practice quiz", { topic, numberOfQuestions });
      generatedQuestions = await generateQuizFromText(content, numberOfQuestions);

      if (cacheKey && generatedQuestions?.length > 0) {
        await setCache(cacheKey, generatedQuestions, 86400); // 24h TTL
      }
    }

    if (!generatedQuestions || !Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      return res.status(500).json({ error: "AI failed to generate valid quiz questions. Please try again." });
    }

    const newQuiz = new quizModel({
      title: "Practice Quiz",
      topic,
      createdBy: studentId,
      duration: 30,
      numberOfQuestions,
    });
    await newQuiz.save();

    const questionIds = [];
    for (let q of generatedQuestions) {
      const question = new Question({
        quiz: newQuiz._id,
        type: q.type,
        questionText: q.question,
        options: q.type === "mcq" ? (q.options || []) : [],
        correctAnswer: q.correctAnswer,
      });
      await question.save();
      questionIds.push(question._id);
    }

    newQuiz.questions = questionIds;
    await newQuiz.save();

    // Invalidate student's practice quiz list cache
    await invalidateCache(practiceQuizListKey(studentId));

    res.status(201).json({ message: "Quiz created successfully", quizId: newQuiz._id, fromCache });
  }
);

// ─── Attempt Quiz (classroom) ─────────────────────────────────────────────────

route.post("/quizzes/attempt", studentMiddleware, async (req, res) => {
  try {
    const { quizId } = req.body;

    const student = await studentModel.findById(req.studentId);
    if (!student || !student.classId) return res.status(403).json({ error: "Student not in a classroom" });

    const classroom = await classModel.findById(student.classId);
    if (!classroom || !classroom.quizzes?.some((id) => id.toString() === quizId)) {
      return res.status(403).json({ error: "Quiz not assigned to your classroom" });
    }

    const quiz = await quizModel.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const now = new Date();
    if (!quiz.isScheduled || !quiz.scheduleAt || new Date(quiz.scheduleAt) > now) {
      return res.status(403).json({ error: "Quiz is not yet available" });
    }

    const Questions = await Promise.all(
      quiz.questions.map(async (questionId) => {
        const question = await Question.findById(questionId);
        if (!question) throw new Error(`Question ${questionId} not found`);
        return {
          _id: question._id,
          questionText: question.questionText,
          type: question.type,
          options: question.options,
        };
      })
    );

    res.status(200).json({ Questions });
  } catch (error) {
    logger.error("Error fetching quiz attempt", { error: error.message });
    res.status(500).json({ error: "Error fetching quiz attempt: " + error.message });
  }
});

// ─── Attempt Practice Quiz ────────────────────────────────────────────────────

route.post("/quizzes/practice/attempt", studentMiddleware, async (req, res) => {
  try {
    const { quizId } = req.body;
    if (!quizId) return res.status(400).json({ error: "quizId is required" });

    const quiz = await quizModel.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    if (quiz.createdBy.toString() !== req.studentId) {
      return res.status(403).json({ error: "You can only access your own practice quiz" });
    }

    const Questions = await Promise.all(
      quiz.questions.map(async (questionId) => {
        const question = await Question.findById(questionId);
        if (!question) throw new Error(`Question ${questionId} not found`);
        return {
          _id: question._id,
          questionText: question.questionText,
          type: question.type,
          options: question.options,
        };
      })
    );

    return res.status(200).json({ Questions });
  } catch (error) {
    logger.error("Error fetching practice quiz", { error: error.message });
    return res.status(500).json({ error: "Error fetching practice quiz: " + error.message });
  }
});

// ─── Submit Quiz ──────────────────────────────────────────────────────────────

route.post("/quizzes/submit", studentMiddleware, validate(submitQuizSchema), async (req, res) => {
  try {
    const { quizId, responses } = req.body;
    const studentId = req.studentId;

    const quiz = await quizModel.findById(quizId).populate("questions");
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    let correctCount = 0;
    const attemptedQuestions = [];

    for (const question of quiz.questions) {
      const answer = responses[question._id];
      const normalizedAnswer = typeof answer === "string" ? answer.trim().toLowerCase() : "";
      const correctNormalized = String(question.correctAnswer || "").trim().toLowerCase();

      if (normalizedAnswer === correctNormalized) correctCount += 1;

      attemptedQuestions.push({
        _id: question._id,
        questionText: question.questionText,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
      });
    }

    const score = correctCount;

    await PreviousQuiz.create({
      studentId,
      quizId,
      questions: attemptedQuestions,
      responses,
      score,
      attemptedAt: new Date(),
    });

    // ── Update leaderboard (fire-and-forget — never blocks the response) ──
    const student = await studentModel.findById(studentId).select('classId').lean();
    addScore(studentId, score, student?.classId?.toString() ?? null).catch((err) =>
      logger.warn('[leaderboard] Background score update failed', { error: err.message })
    );

    logger.info("Quiz submitted", { studentId, quizId, score, total: quiz.questions.length });

    res.status(200).json({
      message: "Quiz submitted",
      score,
      total: quiz.questions.length,
      questions: attemptedQuestions,
    });
  } catch (e) {
    logger.error("Failed to submit quiz", { error: e.message });
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

// ─── Previous Attempts ────────────────────────────────────────────────────────

route.get("/quizzes/previous", studentMiddleware, async (req, res) => {
  try {
    const attempts = await PreviousQuiz.find({ studentId: req.studentId })
      .populate("quizId")
      .sort({ attemptedAt: -1 });
    res.status(200).json(attempts);
  } catch (e) {
    logger.error("Failed to fetch attempts", { error: e.message });
    res.status(500).json({ error: "Failed to fetch attempts" });
  }
});

// ─── Available Quizzes (classroom) ────────────────────────────────────────────

route.get("/quizzes/available", studentMiddleware, async (req, res) => {
  try {
    const student = await studentModel.findById(req.studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (!student.classId) return res.status(404).json({ error: "Student is not in a classroom" });

    const classroom = await classModel
      .findById(student.classId)
      .populate({ path: "quizzes", model: "Quiz" });

    if (!classroom || !classroom.quizzes || classroom.quizzes.length === 0) {
      return res.status(404).json({ error: "No quizzes available for this classroom" });
    }

    const now = new Date();
    const quizzesWithStatus = classroom.quizzes.map((quiz) => {
      let status = "unscheduled";
      if (quiz.isScheduled) {
        if (!quiz.scheduleAt) status = "unscheduled";
        else if (new Date(quiz.scheduleAt) > now) status = "upcoming";
        else status = "available";
      }
      return { ...quiz.toObject(), status };
    });

    res.status(200).json(quizzesWithStatus);
  } catch (error) {
    logger.error("Error fetching available quizzes", { error: error.message });
    res.status(500).json({ error: "Error fetching quizzes: " + error.message });
  }
});

// ─── Practice Quiz List (with cache) ─────────────────────────────────────────

route.get("/quizzes/practice", studentMiddleware, async (req, res) => {
  try {
    const cacheKey = practiceQuizListKey(req.studentId);
    const cached = await getCache(cacheKey);

    if (cached) {
      logger.debug("Cache HIT: student practice quiz list", { studentId: req.studentId });
      return res.status(200).json(cached);
    }

    const quizzes = await quizModel.find({ createdBy: req.studentId }).sort({ createdAt: -1 });

    // Cache for 5 minutes
    await setCache(cacheKey, quizzes, 300);

    return res.status(200).json(quizzes);
  } catch (error) {
    logger.error("Failed to fetch practice quizzes", { error: error.message });
    return res.status(500).json({ error: "Failed to fetch practice quizzes" });
  }
});

export default route;