// schemas/leaderboardSchemas.js — Zod schemas for leaderboard API inputs

import { z } from 'zod';

/**
 * POST /api/v1/leaderboard/score
 * Body: { points: number }
 * Called internally after quiz submit; also exposed for manual award if needed.
 */
export const addScoreSchema = z.object({
  points: z
    .number({ invalid_type_error: 'points must be a number' })
    .int('points must be a whole number')
    .min(0, 'points cannot be negative')
    .max(10000, 'points value too large'),
});

/**
 * GET /api/v1/leaderboard  →  query: { scope?, limit? }
 * scope: 'global' (default) or a classId
 * limit: 1–50, default 10
 */
export const getLeaderboardSchema = z.object({
  scope: z.string().optional().default('global'),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(
      z
        .number()
        .int()
        .min(1, 'limit must be ≥ 1')
        .max(50, 'limit must be ≤ 50')
    ),
});
