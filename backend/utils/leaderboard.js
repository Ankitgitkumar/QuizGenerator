// utils/leaderboard.js — Redis Sorted Set leaderboard helpers
//
// Key layout:
//   leaderboard:global           → all-time global sorted set  (score → studentId)
//   leaderboard:class:<classId>  → per-classroom sorted set
//
// Redis commands used:
//   ZINCRBY  – atomically increment a member's score (no race condition)
//   ZREVRANK – 0-indexed rank from top (0 = #1)
//   ZSCORE   – raw score for a member
//   ZREVRANGE WITHSCORES – top-N slice

import { getRedisClient } from './redisClient.js';
import logger from './logger.js';

const GLOBAL_KEY = 'leaderboard:global';
const classKey   = (classId) => `leaderboard:class:${classId}`;
const quizKey    = (quizId) => `leaderboard:quiz:${quizId}`;

/**
 * Add `points` to a student's leaderboard score.
 * Updates the classroom board and the quiz-specific board.
 *
 * @param {string} studentId
 * @param {number} points         - positive integer (quiz score)
 * @param {string|null} [classId] - optional classroom to also update
 * @param {string|null} [quizId]  - optional quiz ID to update
 */
export async function addScore(studentId, points, classId = null, quizId = null) {
  const client = await getRedisClient();
  if (!client) {
    logger.warn('[leaderboard] Redis unavailable – score not recorded', { studentId, points });
    return;
  }

  try {
    const pipeline = client.pipeline();
    // Global leaderboard is disabled as per requirements
    if (classId) pipeline.zincrby(classKey(classId), points, studentId);
    if (quizId) {
      // Set the student's score for this specific quiz (overwrite with latest attempt score)
      pipeline.zadd(quizKey(quizId), points, studentId);
    }
    await pipeline.exec();

    logger.debug('[leaderboard] Score added', { studentId, points, classId, quizId });
  } catch (err) {
    logger.error('[leaderboard] addScore failed', { error: err.message, studentId });
  }
}

/**
 * Get top-N students from a board, enriched with their name from MongoDB.
 *
 * @param {'global'|string} scope - 'global' or a classId string
 * @param {number}          limit - default 10
 * @param {import('mongoose').Model} studentModel
 * @returns {Promise<Array<{rank, studentId, name, score}>>}
 */
export async function getTopStudents(scope, limit = 10, studentModel) {
  const client = await getRedisClient();
  if (!client) return [];

  try {
    // If global is requested but disabled, we fallback to empty or class key
    const key = scope === 'global' ? GLOBAL_KEY : classKey(scope);
    const raw = await client.zrevrange(key, 0, limit - 1, 'WITHSCORES');

    const entries = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({ studentId: raw[i], score: parseFloat(raw[i + 1]) });
    }

    if (entries.length === 0) return [];

    const ids = entries.map((e) => e.studentId);
    const students = await studentModel
      .find({ _id: { $in: ids } })
      .select('firstName lastName email')
      .lean();

    const nameMap = {};
    for (const s of students) nameMap[s._id.toString()] = s;

    return entries.map((e, idx) => {
      const s = nameMap[e.studentId];
      return {
        rank:      idx + 1,
        studentId: e.studentId,
        name:      s ? `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || s.email : 'Unknown',
        score:     e.score,
      };
    });
  } catch (err) {
    logger.error('[leaderboard] getTopStudents failed', { error: err.message });
    return [];
  }
}

/**
 * Get top-N students for a specific quiz.
 *
 * @param {string} quizId
 * @param {number} limit
 * @param {import('mongoose').Model} studentModel
 * @returns {Promise<Array<{rank, studentId, name, score}>>}
 */
export async function getQuizTopStudents(quizId, limit = 100, studentModel) {
  const client = await getRedisClient();
  if (!client) return [];

  try {
    const key = quizKey(quizId);
    const raw = await client.zrevrange(key, 0, limit - 1, 'WITHSCORES');

    const entries = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({ studentId: raw[i], score: parseFloat(raw[i + 1]) });
    }

    if (entries.length === 0) return [];

    const ids = entries.map((e) => e.studentId);
    const students = await studentModel
      .find({ _id: { $in: ids } })
      .select('firstName lastName email')
      .lean();

    const nameMap = {};
    for (const s of students) nameMap[s._id.toString()] = s;

    return entries.map((e, idx) => {
      const s = nameMap[e.studentId];
      return {
        rank:      idx + 1,
        studentId: e.studentId,
        name:      s ? `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || s.email : 'Unknown',
        score:     e.score,
      };
    });
  } catch (err) {
    logger.error('[leaderboard] getQuizTopStudents failed', { error: err.message, quizId });
    return [];
  }
}

/**
 * Get a single student's rank and score.
 * Rank is 1-indexed (1 = top).
 *
 * @param {string} studentId
 * @param {'global'|string} scope
 * @returns {Promise<{rank: number|null, score: number}>}
 */
export async function getStudentRank(studentId, scope = 'global') {
  const client = await getRedisClient();
  if (!client) return { rank: null, score: 0 };

  try {
    const key = scope === 'global' ? GLOBAL_KEY : classKey(scope);

    const [rankRaw, scoreRaw] = await Promise.all([
      client.zrevrank(key, studentId),   // 0-indexed, null if not present
      client.zscore(key, studentId),     // string or null
    ]);

    return {
      rank:  rankRaw !== null ? rankRaw + 1 : null,   // convert to 1-indexed
      score: scoreRaw !== null ? parseFloat(scoreRaw) : 0,
    };
  } catch (err) {
    logger.error('[leaderboard] getStudentRank failed', { error: err.message, studentId });
    return { rank: null, score: 0 };
  }
}
