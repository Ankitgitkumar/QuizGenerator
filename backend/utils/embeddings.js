import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "./logger.js";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

const getEmbeddingModel = () => {
  logger.debug("Using embedding model", { model: EMBEDDING_MODEL });
  return genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
};

export const embedText = async (text) => {
  try {
    if (!text || !text.trim()) {
      throw new Error("Empty text provided for embedding");
    }

    const model = getEmbeddingModel();
    const result = await model.embedContent(text);
    logger.debug("Embedding response received");

    const embedding =
      result?.embedding?.values || result?.embedding || result?.values;

    if (!Array.isArray(embedding)) {
      logger.error("Unexpected embedding response", { result });
      throw new Error("Failed to extract embedding vector");
    }

    return embedding;
  } catch (error) {
    logger.error("Embed Text Error", { message: error.message });
    throw error;
  }
};

export const embedBatch = async (texts = []) => {
  try {
    if (!Array.isArray(texts)) {
      throw new Error("embedBatch expects an array");
    }

    logger.info(`Generating ${texts.length} embeddings in parallel...`);
    const embeddings = await Promise.all(
      texts.map((text, i) => {
        logger.debug(`Queueing embedding ${i + 1}/${texts.length}`);
        return embedText(text);
      })
    );

    return embeddings;
  } catch (error) {
    logger.error("Embed Batch Error", { message: error.message });
    throw error;
  }
};