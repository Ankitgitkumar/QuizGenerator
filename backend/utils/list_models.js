import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const main = async () => {
  try {
    console.log('Listing models via SDK...');
    if (typeof genAI.listModels === 'function') {
      const resp = await genAI.listModels();
      console.log('Models:', JSON.stringify(resp, null, 2));
      return;
    }

    // Try common alternative method names
    if (typeof genAI.getModels === 'function') {
      const resp = await genAI.getModels();
      console.log('Models (getModels):', JSON.stringify(resp, null, 2));
      return;
    }

    console.warn('SDK does not expose listModels/getModels. Trying low-level request...');
    // As a last resort, attempt a raw fetch to the ModelService list endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const r = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await r.json();
    console.log('Models (raw):', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Failed to list models:', err);
  }
};

main();
