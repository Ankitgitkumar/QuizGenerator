import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import models from "../db.js";
import logger from "../utils/logger.js";

import { updateQuestion } from "../controllers/questionController.js";
import { getTeacherProfile } from "../controllers/teacherController.js";
import {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  getQuizResults,
  scheduleQuiz,
  editQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import { uploadKnowledgeDocument } from "../controllers/knowledgeBaseController.js";
import teacherMiddleware from "../middlewares/teacher.js";
import upload from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import { aiGenerationLimiter, authLimiter } from "../middlewares/rateLimiter.js";
import { fetchVectors } from "../utils/vectorStore.js";
import {
  signupSchema,
  signinSchema,
  createQuizSchema,
  scheduleQuizSchema,
} from "../schemas/quizSchemas.js";

const teacherModel = models.teacherModel;
const JWT_TEACHER_PASSWORD = process.env.JWT_TEACHER_PASSWORD || "teacher_password_jwt";

const route = express.Router();

// ─── Auth Routes ──────────────────────────────────────────────────────────────

route.post("/signup", authLimiter, validate(signupSchema), async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    await teacherModel.create({ email, password: hashedPassword, firstName, lastName });

    const teacher = await teacherModel.findOne({ email });
    const token = jwt.sign({ teacherId: teacher._id.toString() }, JWT_TEACHER_PASSWORD);
    const teacherData = {
      _id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
    };

    logger.info("Teacher signed up", { email });
    res.status(201).json({ message: "Teacher signed up", token, teacher: teacherData });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: "Email already exists. Please use a different email or sign in." });
    }
    logger.error("Teacher signup error", { error: e.message });
    res.status(500).json({ message: "Error signing up user: " + e.message });
  }
});

route.post("/signin", authLimiter, validate(signinSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await teacherModel.findOne({ email });

    if (!teacher) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, teacher.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ teacherId: teacher._id.toString() }, JWT_TEACHER_PASSWORD);
    const teacherData = {
      _id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
    };

    logger.info("Teacher signed in", { email });
    res.status(200).json({ message: "Teacher signed in", token, teacher: teacherData });
  } catch (error) {
    logger.error("Teacher signin error", { error: error.message });
    res.status(500).json({ message: "Error signing in user: " + error.message });
  }
});

// ─── Profile ──────────────────────────────────────────────────────────────────

route.get("/me", teacherMiddleware, getTeacherProfile);

// ─── Quiz Routes ──────────────────────────────────────────────────────────────

// AI generation endpoint — strict rate limiter applied; Zod validation
// is skipped here because multer (multipart/form-data) populates req.body
// after parsing, and coercion is handled inside createQuiz via the schema.
route.post(
  "/create",
  teacherMiddleware,
  aiGenerationLimiter,
  upload.single("pdf"),
  createQuiz
);

route.get("/quizzes", teacherMiddleware, getMyQuizzes);
route.get("/quiz/:id/results", teacherMiddleware, getQuizResults);

// ─── Quiz Status Polling (for async RAG jobs) ─────────────────────────────────
// Frontend polls this every 2-3s after receiving a 202 from /create
route.get("/quiz/:id/status", teacherMiddleware, async (req, res) => {
  try {
    const quiz = await models.quizModel.findById(req.params.id).select("status title topic");
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    return res.status(200).json({
      quizId: quiz._id,
      status: quiz.status,   // 'processing' | 'ready' | 'failed'
      title:  quiz.title,
      topic:  quiz.topic,
    });
  } catch (err) {
    logger.error("Quiz status check failed", { error: err.message });
    return res.status(500).json({ error: "Failed to check quiz status" });
  }
});

route.patch("/quiz/:id/schedule", teacherMiddleware, validate(scheduleQuizSchema), scheduleQuiz);
route.patch("/quiz/:id", teacherMiddleware, editQuiz);
route.delete("/quiz/:id", teacherMiddleware, deleteQuiz);
route.patch("/question/:id", teacherMiddleware, updateQuestion);

// ─── Knowledge Base ───────────────────────────────────────────────────────────

route.post(
  "/knowledge-base/upload",
  teacherMiddleware,
  aiGenerationLimiter,
  upload.single("document"),
  uploadKnowledgeDocument
);

// ─── Debug / RAG Vectors ──────────────────────────────────────────────────────

route.get("/rag/vectors", teacherMiddleware, async (req, res) => {
  try {
    const idsParam = req.query.ids;
    if (!idsParam) {
      return res.status(400).json({ message: "Provide ids query param, comma-separated" });
    }

    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!ids.length) {
      return res.status(400).json({ message: "No valid ids provided" });
    }

    const fetchResponse = await fetchVectors(ids);
    return res.json({ vectors: fetchResponse });
  } catch (error) {
    logger.error("Fetch vectors debug failed", { error: error.message });
    return res.status(500).json({ message: error.message || "Failed to fetch vector data" });
  }
});

// Keep dynamic :id route at the bottom (catches /teacher/:id)
route.get("/:id", teacherMiddleware, getQuizById);

export default route;