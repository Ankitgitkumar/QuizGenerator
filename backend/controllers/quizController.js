import crypto from "crypto";
import fs from "fs";
import pdfParse from "pdf-parse";
import models from "../db.js";
import { generateQuizFromText } from "../utils/gemini.js";
import { ingestDocument } from "../utils/knowledgeBase.js";
import { embedText } from "../utils/embeddings.js";
import { queryVectors } from "../utils/vectorStore.js";
import { getCache, setCache, invalidateCache, invalidateCacheByPrefix } from "../utils/cache.js";
import { getRagQueue, isRedisAvailable } from "../utils/ragQueue.js";
import logger from "../utils/logger.js";

const Quiz = models.quizModel;
const Question = models.questionModel;
const PreviousQuiz = models.previousQuizModel;

// ─── Cache key helpers ────────────────────────────────────────────────────────

const quizCacheKey = (quizId) => `quiz:detail:${quizId}`;
const teacherQuizListKey = (teacherId) => `quiz:list:teacher:${teacherId}`;

/**
 * Creates a deterministic MD5 cache key for a topic-based AI generation request.
 * PDF-based quizzes are never cached (content is unique per upload).
 */
const aiGenerationCacheKey = (topic, numberOfQuestions) =>
  `quiz:ai:${crypto
    .createHash("md5")
    .update(`${topic.trim().toLowerCase()}|${numberOfQuestions}`)
    .digest("hex")}`;

// ─── RAG helper ───────────────────────────────────────────────────────────────

const buildRagGenerationContent = async ({ content, query, teacherId, sourceId, restrictToSource }) => {
  const searchText = (query && query.trim()) || content.slice(0, 1000);
  const queryEmbedding = await embedText(searchText);

  const filter = restrictToSource
    ? { teacherId: { $eq: teacherId }, sourceId: { $eq: sourceId } }
    : { teacherId: { $eq: teacherId } };

  const matches = await queryVectors(queryEmbedding, 5, filter);
  const retrievedChunks = matches.map((m) => m.metadata?.text).filter(Boolean);

  if (!retrievedChunks.length) {
    logger.warn("RAG retrieval returned no chunks. Falling back to original content.");
    return content;
  }

  return `Use the retrieved document context below to generate the quiz. Prefer facts from this retrieved context only.\n\nUser query/topic:\n${searchText}\n\nRetrieved context:\n${retrievedChunks.join("\n\n---\n\n")}`;
};

// ─── Create Quiz ──────────────────────────────────────────────────────────────

export const createQuiz = async (req, res) => {
  try {
    const { title, topic, numberOfQuestions, duration, scheduleAt } = req.body;
    const teacherId = req.teacherId;

    let content = topic;
    let hasUploadedDocument = false;

    if (req.file && fs.existsSync(req.file.path)) {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
      hasUploadedDocument = true;
      fs.unlinkSync(req.file.path);
    }

    const useRag =
      String(req.body.useRag || (hasUploadedDocument ? "true" : "false")).toLowerCase() === "true";

    // ── Cache check (only for topic-based, non-RAG quizzes) ──
    let generatedQuestions = null;
    let cacheKey = null;
    let fromCache = false;

    if (!hasUploadedDocument && !useRag && topic && topic.trim()) {
      cacheKey = aiGenerationCacheKey(topic, numberOfQuestions);
      const cached = await getCache(cacheKey);
      if (cached) {
        logger.info("Cache HIT for AI quiz generation", { topic, numberOfQuestions });
        generatedQuestions = cached;
        fromCache = true;
      }
    }

    // ── RAG path (PDF upload) — ASYNC via BullMQ if Redis is available ────────
    if (useRag && hasUploadedDocument) {
      const redisUp = await isRedisAvailable();

      if (redisUp) {
        // ── ASYNC path: Redis is running → queue the job, respond instantly ──
        let parsedScheduleAt = null;
        if (scheduleAt && String(scheduleAt).trim()) {
          const d = new Date(scheduleAt);
          parsedScheduleAt = isNaN(d.getTime()) ? null : d;
        }

        const newQuiz = new Quiz({
          title,
          topic: topic || "From PDF",
          createdBy: teacherId,
          duration,
          scheduleAt: parsedScheduleAt,
          numberOfQuestions,
          status: 'processing',
        });
        await newQuiz.save();
        await invalidateCache(teacherQuizListKey(teacherId));

        await getRagQueue().add('ingest', {
          text: content,
          topic,
          title,
          teacherId,
          quizId: newQuiz._id.toString(),
          numberOfQuestions,
        });

        logger.info("RAG quiz job queued (async)", { quizId: newQuiz._id, teacherId });

        return res.status(202).json({
          message: "Quiz is being generated. Poll /quiz/:id/status for updates.",
          quizId: newQuiz._id,
          status: 'processing',
        });
      }

      // ── SYNC fallback: Redis offline → process inline (slower but works) ──
      logger.warn("Redis unavailable — processing RAG quiz synchronously", { teacherId });

      const sourceId = `quiz-${Date.now()}`;
      logger.info("Starting RAG document ingestion (sync fallback)...");
      await ingestDocument(content, { id: sourceId, sourceId, topic, title, teacherId });

      logger.info("Retrieving relevant context for RAG quiz generation (sync fallback)...");
      const ragContent = await buildRagGenerationContent({
        content,
        query: topic || title,
        teacherId,
        sourceId,
        restrictToSource: true,
      });

      logger.info("Generating RAG quiz questions (sync fallback)...");
      generatedQuestions = await generateQuizFromText(ragContent, numberOfQuestions);

      // Fall through to the persist block below with status 'ready'
    }

    // ── Non-RAG / topic-only path — stays SYNCHRONOUS ────────────────────────
    if (!generatedQuestions) {
      logger.info("Starting quiz question generation...", { topic, numberOfQuestions, useRag });
      generatedQuestions = await generateQuizFromText(content, numberOfQuestions);
      logger.info("Quiz questions generated successfully", { count: generatedQuestions?.length });

      // Cache the result for topic-based quizzes (not PDF/RAG — those are unique)
      if (cacheKey && generatedQuestions?.length > 0) {
        await setCache(cacheKey, generatedQuestions, 86400); // 24 hours
        logger.info("AI generation result cached", { cacheKey, ttl: "24h" });
      }
    }

    if (!generatedQuestions || !Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      logger.warn("Gemini generated no questions or an invalid format.");
      return res.status(500).json({ error: "AI failed to generate valid quiz questions. Please try again." });
    }

    // Sanitize scheduleAt — convert to a valid Date or null to avoid Mongoose cast errors
    let parsedScheduleAt = null;
    if (scheduleAt && String(scheduleAt).trim()) {
      const d = new Date(scheduleAt);
      parsedScheduleAt = isNaN(d.getTime()) ? null : d;
    }

    // ── Persist to MongoDB ──
    const newQuiz = new Quiz({
      title,
      topic: topic || "From PDF",
      createdBy: teacherId,
      duration,
      scheduleAt: parsedScheduleAt,
      numberOfQuestions,
      status: 'ready',
    });
    await newQuiz.save();

    const questionsToInsert = generatedQuestions.map((q) => ({
      quiz: newQuiz._id,
      type: q.type,
      questionText: q.question,
      options: q.type === "mcq" ? (q.options || []) : [],
      correctAnswer: q.correctAnswer,
    }));
    const insertedDocs = await Question.insertMany(questionsToInsert);
    const questionIds = insertedDocs.map((doc) => doc._id);

    newQuiz.questions = questionIds;
    await newQuiz.save();

    // Invalidate the teacher's quiz list cache (it's now stale)
    await invalidateCache(teacherQuizListKey(teacherId));
    logger.info("Teacher quiz list cache invalidated", { teacherId });

    res.status(201).json({
      message: "Quiz created successfully",
      quizId: newQuiz._id,
      usedRag: false,
      fromCache,
    });
  } catch (error) {
    logger.error("Quiz creation error", { error: error.message, stack: error.stack });

    if (error.message.includes("Failed to generate quiz from AI")) {
      return res.status(502).json({ error: "AI failed to generate quiz. " + error.message });
    } else if (error.message.includes("validation failed")) {
      return res.status(400).json({ error: "Validation error: " + error.message });
    }
    res.status(500).json({ error: "Failed to create quiz: " + error.message });
  }
};

// ─── Get My Quizzes (with cache) ──────────────────────────────────────────────

export const getMyQuizzes = async (req, res) => {
  try {
    const teacherId = req.teacherId;
    const cacheKey = teacherQuizListKey(teacherId);

    const cached = await getCache(cacheKey);
    if (cached) {
      logger.debug("Cache HIT: teacher quiz list", { teacherId });
      return res.status(200).json(cached);
    }

    const quizzes = await Quiz.find({ createdBy: teacherId }).sort({ createdAt: -1 });

    // Cache for 5 minutes
    await setCache(cacheKey, quizzes, 300);
    logger.debug("Cache SET: teacher quiz list", { teacherId, count: quizzes.length });

    res.status(200).json(quizzes);
  } catch (err) {
    logger.error("Error fetching quizzes", { error: err.message });
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

// ─── Get Quiz By ID (with cache) ─────────────────────────────────────────────

export const getQuizById = async (req, res) => {
  try {
    const cacheKey = quizCacheKey(req.params.id);

    const cached = await getCache(cacheKey);
    if (cached) {
      logger.debug("Cache HIT: quiz detail", { quizId: req.params.id });
      return res.status(200).json(cached);
    }

    const quiz = await Quiz.findById(req.params.id).populate("questions");
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const payload = { quiz, questions: quiz.questions };

    // Cache for 10 minutes
    await setCache(cacheKey, payload, 600);

    res.status(200).json(payload);
  } catch (err) {
    logger.error("Error fetching quiz by ID", { error: err.message, quizId: req.params.id });
    res.status(500).json({ error: "Error fetching quiz" });
  }
};

// ─── Get Quiz Results ─────────────────────────────────────────────────────────

export const getQuizResults = async (req, res) => {
  try {
    const { id } = req.params;
    const results = await PreviousQuiz.find({ quizId: id }).populate("studentId", "firstName lastName email");
    res.status(200).json({ quizId: id, results });
  } catch (err) {
    logger.error("Error fetching quiz results", { error: err.message, quizId: req.params.id });
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
};

// ─── Schedule Quiz ────────────────────────────────────────────────────────────

export const scheduleQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleAt } = req.body;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      { scheduleAt: new Date(scheduleAt), isScheduled: true },
      { new: true }
    );

    if (!updatedQuiz) return res.status(404).json({ message: "Quiz not found" });

    // Invalidate cached quiz detail
    await invalidateCache(quizCacheKey(id));
    await invalidateCache(teacherQuizListKey(req.teacherId));

    logger.info("Quiz scheduled", { quizId: id, scheduleAt });
    res.status(200).json(updatedQuiz);
  } catch (error) {
    logger.error("Schedule Quiz Error", { error: error.message });
    res.status(500).json({ message: "Failed to schedule quiz" });
  }
};

// ─── Edit Quiz ────────────────────────────────────────────────────────────────

export const editQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.isScheduled) {
      return res.status(400).json({ message: "Scheduled quiz cannot be edited" });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(id, req.body, { new: true });

    // Invalidate stale caches
    await invalidateCache(quizCacheKey(id));
    await invalidateCache(teacherQuizListKey(req.teacherId));

    logger.info("Quiz edited", { quizId: id });
    res.status(200).json(updatedQuiz);
  } catch (error) {
    logger.error("Edit Quiz Error", { error: error.message });
    res.status(500).json({ message: "Failed to edit quiz" });
  }
};

// ─── Delete Quiz ──────────────────────────────────────────────────────────────

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Quiz.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Quiz not found" });

    // Invalidate stale caches
    await invalidateCache(quizCacheKey(id));
    await invalidateCache(teacherQuizListKey(req.teacherId));

    logger.info("Quiz deleted", { quizId: id });
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    logger.error("Delete Quiz Error", { error: error.message });
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};
