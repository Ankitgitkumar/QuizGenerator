// tests/gemini.test.js — Unit tests for Gemini quiz generation utility
// Uses jest.unstable_mockModule for correct ESM module mocking.

import { jest } from "@jest/globals";

// ─── Mock the @google/generative-ai module BEFORE any imports ─────────────────

const mockGenerateContent = jest.fn();

await jest.unstable_mockModule("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: mockGenerateContent,
    })),
  })),
}));

// Set env BEFORE importing the module under test
process.env.GEMINI_API_KEY = "test-api-key-mock";
process.env.GEMINI_MODEL = "gemini-2.5-flash";

// Dynamic import AFTER mocking so the mock is in place
const { generateQuizFromText } = await import("../utils/gemini.js");

// ─── Test Cases ───────────────────────────────────────────────────────────────

describe("generateQuizFromText", () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  test("returns parsed questions on valid Gemini response", async () => {
    const mockQuestions = [
      {
        type: "mcq",
        question: "What is Node.js?",
        options: ["A runtime", "A database", "A framework", "A language"],
        correctAnswer: "A runtime",
      },
      {
        type: "one-line",
        question: "What does REST stand for?",
        correctAnswer: "Representational State Transfer",
      },
    ];

    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockQuestions) },
    });

    const result = await generateQuizFromText("Node.js basics", 2);

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("mcq");
    expect(result[1].type).toBe("one-line");
    expect(result[0].options).toHaveLength(4);
  });

  test("handles Gemini response wrapped in markdown code block", async () => {
    const mockQuestions = [
      {
        type: "one-line",
        question: "What is Express?",
        correctAnswer: "A Node.js web framework",
      },
    ];

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => `\`\`\`json\n${JSON.stringify(mockQuestions)}\n\`\`\``,
      },
    });

    const result = await generateQuizFromText("Express.js", 1);
    expect(result).toHaveLength(1);
    expect(result[0].correctAnswer).toBe("A Node.js web framework");
  });

  test("throws on empty content", async () => {
    await expect(generateQuizFromText("", 5)).rejects.toThrow(
      "Failed to generate quiz from AI"
    );
  });

  test("throws on zero numberOfQuestions", async () => {
    await expect(generateQuizFromText("some content", 0)).rejects.toThrow(
      "Failed to generate quiz from AI"
    );
  });

  test("throws when Gemini returns no valid JSON array", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "Sorry, I cannot generate questions for this content.",
      },
    });

    await expect(generateQuizFromText("some topic", 3)).rejects.toThrow(
      "Failed to generate quiz from AI"
    );
  });

  test("throws when Gemini returns empty array", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => "[]" },
    });

    await expect(generateQuizFromText("some topic", 3)).rejects.toThrow(
      "Failed to generate quiz from AI"
    );
  });
});
