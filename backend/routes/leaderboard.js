// routes/leaderboard.js — Leaderboard API routes
//
// Endpoints:
//   POST /api/v1/leaderboard/score          → award points  (student auth)
//   GET  /api/v1/leaderboard                → top-N leaders (any auth)
//   GET  /api/v1/leaderboard/:studentId/rank → student rank  (any auth)

import express from 'express';
import studentMiddleware from '../middlewares/student.js';
import { validate } from '../middlewares/validate.js';
import { addScoreSchema } from '../schemas/leaderboardSchemas.js';
import {
  awardScore,
  getLeaderboard,
  getStudentRankHandler,
} from '../controllers/leaderboardController.js';

const route = express.Router();

// ─── Award points to the authenticated student ────────────────────────────────
route.post('/score', studentMiddleware, validate(addScoreSchema), awardScore);

// ─── Get top-N leaderboard entries ───────────────────────────────────────────
// Open to both student and teacher tokens; studentMiddleware used here for
// consistency — swap to a shared auth middleware if you add teacher support.
route.get('/', studentMiddleware, getLeaderboard);

// ─── Get a specific student's rank ───────────────────────────────────────────
// :studentId can be 'me' (replaced by middleware) or any valid ObjectId.
route.get('/:studentId/rank', studentMiddleware, getStudentRankHandler);

export default route;
