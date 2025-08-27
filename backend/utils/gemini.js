
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from "dotenv";

// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export const generateQuizFromText = async (text, numberOfQuestions = 5) => {
//   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//   const prompt = `
//     Generate ${numberOfQuestions} quiz questions from this content:
//     "${text}"

//     For each question, specify:
//     - type: "mcq" or "one-line"
//     - question: string
//     - options: array of strings (for mcq type only, at least 3 and at most 5 options)
//     - correctAnswer: string (the exact correct answer from the options for mcq, or the direct answer for one-line)

//     The output MUST be a JSON array. DO NOT include any additional text, markdown formatting (like \`\`\`json\` or \`\`\`\`), or conversational filler outside of the JSON array.
//     Strictly adhere to the following JSON array format:

//     [
//       {
//         "type": "mcq",
//         "question": "What is...",
//         "options": ["A", "B", "C", "D"],
//         "correctAnswer": "B"
//       },
//       {
//         "type": "one-line",
//         "question": "Define ...",
//         "correctAnswer": "..."
//       }
//     ]
//   `;

//   try {
//     const result = await model.generateContent(prompt);
//     let textResponse = result.response.text();

//     console.log("Raw AI Response");
//     console.log(textResponse);

//     // Remove leading and trailing markdown code block delimiters
//     // This regex handles '```json' at the start and '```' at the end,
//     // even if there are newlines around them.
//     textResponse = textResponse.replace(/^```json\s*\n?/, '').replace(/\n?```$/, '');

//     // Trim any remaining whitespace from the start/end
//     textResponse = textResponse.trim();

    
//     console.log(textResponse);

//     const questions = JSON.parse(textResponse);
//     return questions;

//   } catch (e) {
//     console.error("Error in generateQuizFromText:", e);
//     if (e instanceof SyntaxError) {
//       throw new Error(`Failed to parse AI response as JSON. Check AI output for formatting issues. Raw content (after cleaning attempt): "${textResponse}"`);
//     } else {
//       throw new Error(`Failed to generate quiz from AI: ${e.message}`);
//     }
//   }
// };


import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateQuizFromText = async (text, numberOfQuestions = 5) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  Generate ${numberOfQuestions} quiz questions from this content:
  "${text}"

  The output must be a single JSON array of question objects.
  Each question object should have the following keys:
  - type: "mcq" or "one-line"
  - question: a string containing the question text
  - options: an array of strings (for mcq type only, with 3-5 options)
  - correctAnswer: a string (the exact correct answer)

  The JSON array should adhere strictly to this format:
  
  [
    {
      "type": "mcq",
      "question": "What is...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B"
    },
    {
      "type": "one-line",
      "question": "Define ...",
      "correctAnswer": "..."
    }
  ]
  
  Please ensure the entire response is a valid JSON array, and nothing else.
  `;

  try {
    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();

    console.log("Raw AI Response:");
    console.log(textResponse);

    // The model might wrap the JSON in markdown; this handles it.
    textResponse = textResponse.replace(/^```json\s*\n?/, '').replace(/\n?```$/, '');
    textResponse = textResponse.trim();

    console.log("Cleaned AI Response:");
    console.log(textResponse);

    const questions = JSON.parse(textResponse);
    return questions;

  } catch (e) {
    console.error("Error in generateQuizFromText:", e);
    // Log the raw and cleaned content for better debugging.
    if (e instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response as JSON. Raw content (after cleaning): "${textResponse}"`);
    } else {
      throw new Error(`Failed to generate quiz from AI: ${e.message}`);
    }
  }
};