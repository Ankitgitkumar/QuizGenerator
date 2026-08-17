// controllers/leaderboardController.js — Leaderboard endpoint handlers

import models from '../db.js';
import logger from '../utils/logger.js';
import { addScore, getTopStudents, getStudentRank, getQuizTopStudents } from '../utils/leaderboard.js';

const { studentModel, classModel, quizModel } = models;

// ─── POST /api/v1/leaderboard/score ──────────────────────────────────────────
// Manually award points to the authenticated student.
// (In practice the quiz submit route calls addScore directly; this endpoint
//  allows teachers or future admin tooling to award bonus points.)

export async function awardScore(req, res) {
  try {
    const studentId = req.studentId;
    const { points } = req.body;

    // Look up the student's classroom so we update the class board too
    const student = await studentModel.findById(studentId).select('classId').lean();
    const classId = student?.classId?.toString() ?? null;

    await addScore(studentId, points, classId);

    logger.info('[leaderboard] Score awarded', { studentId, points, classId });
    return res.status(200).json({ message: 'Score updated', points });
  } catch (err) {
    logger.error('[leaderboard] awardScore error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update leaderboard score' });
  }
}

// ─── GET /api/v1/leaderboard ─────────────────────────────────────────────────
// Returns top-N students.
// Query params: scope ('global' | <classId>), limit (1-50, default 10)

export async function getLeaderboard(req, res) {
  try {
    const scope = req.query.scope ?? 'global';
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? '10', 10), 1), 50);

    // If a classId scope was requested, verify the classroom exists
    if (scope !== 'global') {
      const classroom = await classModel.findById(scope).select('_id').lean();
      if (!classroom) {
        return res.status(404).json({ error: 'Classroom not found' });
      }
    }

    const leaders = await getTopStudents(scope, limit, studentModel);

    return res.status(200).json({ scope, limit, leaders });
  } catch (err) {
    logger.error('[leaderboard] getLeaderboard error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

// ─── GET /api/v1/leaderboard/:studentId/rank ─────────────────────────────────
// Returns rank + score for any student.
// Query param: scope ('global' | <classId>), default 'global'

export async function getStudentRankHandler(req, res) {
  try {
    const { studentId } = req.params;
    const scope = req.query.scope ?? 'global';

    // Verify student exists
    const student = await studentModel
      .findById(studentId)
      .select('firstName lastName')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { rank, score } = await getStudentRank(studentId, scope);

    return res.status(200).json({
      studentId,
      name: `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim(),
      scope,
      rank,    // null if the student has no score yet
      score,
    });
  } catch (err) {
    logger.error('[leaderboard] getStudentRank error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch student rank' });
  }
}

// ─── GET /api/v1/leaderboard/quiz/:quizId ────────────────────────────────────
// Returns ranking scores of students specifically for this quiz.
export async function getQuizLeaderboard(req, res) {
  try {
    const { quizId } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? '50', 10), 1), 100);

    // Verify quiz exists
    const quiz = await quizModel.findById(quizId).select('_id').lean();
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const leaders = await getQuizTopStudents(quizId, limit, studentModel);
    return res.status(200).json({ quizId, limit, leaders });
  } catch (err) {
    logger.error('[leaderboard] getQuizLeaderboard error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch quiz leaderboard' });
  }
}
