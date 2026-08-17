// schemas/quizSchemas.js — Zod schemas for all API inputs
// Single source of truth for request shapes. Add new schemas here as the API grows.

import { z } from "zod";

// ─── Auth schemas ────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Teacher quiz schemas ─────────────────────────────────────────────────────

export const createQuizSchema = z.object({
  title: z
    .string()
    .min(1, "Quiz title is required")
    .max(200, "Title must be under 200 characters"),

  topic: z
    .string()
    .max(5000, "Topic text too long")
    .optional()
    .default(""),

  numberOfQuestions: z
    .coerce // coerce from string (FormData sends strings)
    .number()
    .int("Must be a whole number")
    .min(1, "At least 1 question required")
    .max(50, "Maximum 50 questions allowed"),

  duration: z
    .coerce
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(300, "Duration cannot exceed 300 minutes")
    .optional()
    .default(30),

  scheduleAt: z
    .string()
    .optional()
    .nullable(),

  useRag: z
    .string()
    .optional()
    .default("false"),
});

export const scheduleQuizSchema = z.object({
  scheduleAt: z
    .string()
    .min(1, "Schedule time is required")
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "scheduleAt must be a valid date string",
    }),
});

// ─── Classroom schemas ────────────────────────────────────────────────────────

export const createClassroomSchema = z.object({
  name: z.string().min(1, "Classroom name is required").max(100),
  teacherId: z.string().min(1, "Teacher ID is required"),
  code: z.string().max(20).optional(),
});

export const joinClassroomSchema = z.object({
  code: z.string().min(1, "Classroom code is required"),
});

// ─── Student quiz schemas ─────────────────────────────────────────────────────

export const studentGenerateQuizSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(5000),
});

export const submitQuizSchema = z.object({
  quizId: z.string().min(1, "quizId is required"),
  responses: z.record(z.string(), z.string().or(z.null())).default({}),
  disqualified: z.boolean().optional(),
});
