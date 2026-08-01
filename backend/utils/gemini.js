// utils/gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function generateQuiz(text, numberOfQuestions) {
  try {
    if (!text || !text.trim()) {
      throw new Error("Empty content received");
    }

    if (!numberOfQuestions || Number(numberOfQuestions) <= 0) {
      throw new Error("Invalid number of questions");
    }

    // Prevent extremely large prompts
    const trimmedText = text.length > 30000 ? text.slice(0, 30000) : text;

    logger.info("Generating quiz with Gemini", {
      model: MODEL,
      contentLength: trimmedText.length,
      numberOfQuestions,
    });

    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `
Generate exactly ${numberOfQuestions} quiz questions from the content below.

Rules:
1. Return ONLY a JSON array.
2. No markdown.
3. No explanation text.
4. Each question must be either:
   - mcq
   - one-line
5. For mcq include exactly 4 options.

Example:

[
  {
    "type":"mcq",
    "question":"What is Java?",
    "options":["A","B","C","D"],
    "correctAnswer":"A"
  },
  {
    "type":"one-line",
    "question":"What is OOP?",
    "correctAnswer":"Object Oriented Programming"
  }
]

Content:
${trimmedText}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    logger.debug("Gemini response preview", { preview: raw.substring(0, 300) });

    let cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error("No valid JSON array found in Gemini response");
    }

    const questions = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Gemini returned an empty question list");
    }

    logger.info("Quiz generation complete", { questionCount: questions.length });
    return questions;
  } catch (error) {
    logger.error("Gemini Generation Error", {
      message: error.message,
      details: error.errorDetails,
    });
    throw new Error(`Failed to generate quiz from AI: ${error.message || "Unknown error"}`);
  }
}

export async function generateQuizFromText(text, numberOfQuestions) {
  return generateQuiz(text, numberOfQuestions);
}