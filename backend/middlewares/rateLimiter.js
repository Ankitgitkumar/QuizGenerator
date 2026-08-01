// middlewares/rateLimiter.js — Rate limiting for AI-intensive endpoints
// Protects Gemini API endpoints from abuse and cost overruns.

import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

/**
 * Strict limiter for AI quiz generation (expensive Gemini API calls).
 * 10 requests per hour per IP.
 */
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,  // Return RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: "Too many quiz generation requests. Please wait before generating more quizzes.",
    retryAfter: "1 hour",
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for AI generation`, {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json(options.message);
  },
});

/**
 * Moderate limiter for general authenticated API calls.
 * 100 requests per 15 minutes per IP.
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down.",
  },
  handler: (req, res, next, options) => {
    logger.warn(`General rate limit exceeded`, {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json(options.message);
  },
});

/**
 * Auth limiter to prevent brute-force attacks on login/signup endpoints.
 * 30 attempts per 15 minutes per IP (generous enough for normal use, strict for bots).
 * Disabled in development to avoid blocking local testing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 30 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please try again in 15 minutes.",
    retryAfter: "15 minutes",
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded`, {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json(options.message);
  },
});
