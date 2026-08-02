// workers/ragWorker.js — Background worker for async RAG quiz generation
//
// Job data shape:
// {
//   text: string,           // extracted PDF text
//   topic: string,          // quiz topic / title
//   teacherId: string,
//   quizId: string,         // MongoDB Quiz _id (already saved as 'processing')
//   numberOfQuestions: number,
//   title: string,
// }

import { Worker } from 'bullmq';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import models from '../db.js';
import { ingestDocument } from '../utils/knowledgeBase.js';
import { embedText } from '../utils/embeddings.js';
import { queryVectors } from '../utils/vectorStore.js';
import { generateQuizFromText } from '../utils/gemini.js';
import { invalidateCache } from '../utils/cache.js';
import { getRedisConfig } from '../utils/ragQueue.js';
import logger from '../utils/logger.js';

dotenv.config();

const Quiz     = models.quizModel;
const Question = models.questionModel;

// ─── RAG helper (same logic as quizController but self-contained) ─────────────

const buildRagContent = async ({ text, query, teacherId, sourceId }) => {
  const searchText = (query && query.trim()) || text.slice(0, 1000);
  const queryEmbedding = await embedText(searchText);

  const filter = {
    teacherId: { $eq: teacherId },
    sourceId:  { $eq: sourceId  },
  };

  const matches = await queryVectors(queryEmbedding, 5, filter);
  const chunks  = matches.map((m) => m.metadata?.text).filter(Boolean);

  if (!chunks.length) {
    logger.warn('[ragWorker] RAG retrieval returned no chunks — using raw text', { teacherId });
    return text;
  }

  return `Use the retrieved document context below to generate the quiz.\n\nUser query/topic:\n${searchText}\n\nRetrieved context:\n${chunks.join('\n\n---\n\n')}`;
};

// ─── Worker processor ────────────────────────────────────────────────────────

const processor = async (job) => {
  const { text, topic, title, teacherId, quizId, numberOfQuestions } = job.data;

  logger.info('[ragWorker] Job started', { jobId: job.id, quizId });

  // Ensure Mongoose is connected (worker may start before the main app connects)
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('[ragWorker] MongoDB connected');
  }

  try {
    // ── Step 1: Ingest document into Pinecone ──
    const sourceId = `quiz-${quizId}`;
    logger.info('[ragWorker] Ingesting document...', { quizId });
    await ingestDocument(text, { id: sourceId, sourceId, topic, title, teacherId });

    // ── Step 2: Retrieve relevant context + generate questions ──
    logger.info('[ragWorker] Retrieving RAG context...', { quizId });
    const generationContent = await buildRagContent({ text, query: topic || title, teacherId, sourceId });

    logger.info('[ragWorker] Generating quiz questions...', { quizId, numberOfQuestions });
    const generatedQuestions = await generateQuizFromText(generationContent, numberOfQuestions);

    if (!generatedQuestions?.length) {
      throw new Error('AI returned no questions');
    }

    // ── Step 3: Save questions to MongoDB ──
    const questionIds = [];
    for (const q of generatedQuestions) {
      const question = new Question({
        quiz:         quizId,
        type:         q.type,
        questionText: q.question,
        options:      q.type === 'mcq' ? (q.options || []) : [],
        correctAnswer: q.correctAnswer,
      });
      await question.save();
      questionIds.push(question._id);
    }

    // ── Step 4: Mark quiz as ready ──
    await Quiz.findByIdAndUpdate(quizId, {
      questions: questionIds,
      status: 'ready',
    });

    // ── Step 5: Invalidate teacher's quiz list cache (now stale) ──
    await invalidateCache(`quiz:list:teacher:${teacherId}`);
    await invalidateCache(`quiz:detail:${quizId}`);

    logger.info('[ragWorker] Job completed ✅', { jobId: job.id, quizId, questionCount: questionIds.length });
  } catch (err) {
    // Mark quiz as failed so the teacher sees an error instead of a spinner forever
    await Quiz.findByIdAndUpdate(quizId, { status: 'failed' }).catch(() => {});
    logger.error('[ragWorker] Job failed ❌', { jobId: job.id, quizId, error: err.message });
    throw err; // re-throw so BullMQ records the failure + retries
  }
};

// ─── Start the worker ─────────────────────────────────────────────────────────

export async function startRagWorker() {
  // ── Ping Redis before starting the worker so we don't spam errors ──
  const conn = getRedisConfig();
  try {
    const testClient = new Redis({
      ...conn,   // spreads host, port, and tls:{} when using rediss://
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      connectTimeout: 3000,
    });
    // MUST silence error event before connecting — prevents Node.js crash
    testClient.on('error', () => {});
    await testClient.connect();
    await testClient.ping();
    testClient.removeAllListeners();
    await testClient.disconnect();
  } catch (err) {
    logger.warn(
      '[ragWorker] Redis not available — RAG worker disabled. ' +
      'Run Redis to enable async PDF processing. ' +
      'Quick start: docker run -d -p 6379:6379 redis:7-alpine',
      { error: err.message }
    );
    return null;  // worker not started — no repeated errors
  }

  const worker = new Worker('rag-ingestion', processor, {
    connection: conn,
    concurrency: 2, // process up to 2 PDF jobs at the same time
  });

  worker.on('completed', (job) => {
    logger.info('[ragWorker] Worker completed job', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('[ragWorker] Worker job failed', { jobId: job?.id, error: err.message });
  });

  worker.on('error', (err) => {
    logger.error('[ragWorker] Worker error', { error: err.message });
  });

  logger.info('[ragWorker] RAG worker started ✅ (concurrency: 2)');
  return worker;
}
