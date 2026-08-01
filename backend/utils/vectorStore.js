import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

const indexName = process.env.PINECONE_INDEX_NAME || "quiz-knowledge";
// Pinecone SDK v7 only needs apiKey — environment is deprecated
const usePinecone = Boolean(process.env.PINECONE_API_KEY);

let client = null;
const inMemoryStore = new Map();

// ─── Cosine similarity for in-memory search ───────────────────────────────────
const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return null;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return null;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// ─── In-memory fallback (matches Pinecone v7 { records } interface) ───────────
const createLocalIndex = () => ({
  upsert: async ({ records }) => {
    if (!records || records.length === 0) {
      logger.warn("No records to upsert in local fallback");
      return;
    }
    records.forEach((record) => {
      inMemoryStore.set(record.id, {
        values: record.values,
        metadata: record.metadata,
      });
    });
    logger.debug(`Local vector store upserted ${records.length} records.`);
  },

  fetch: async (ids) => {
    const fetched = {};
    ids.forEach((id) => {
      const record = inMemoryStore.get(id);
      if (record) fetched[id] = { values: record.values, metadata: record.metadata };
    });
    return { vectors: fetched };
  },

  query: async ({ vector, topK = 5, includeMetadata = true, filter }) => {
    const matches = [];
    for (const [id, record] of inMemoryStore.entries()) {
      if (filter) {
        const isMatch = Object.entries(filter).every(([key, expected]) => {
          const actual = record.metadata?.[key];
          if (expected && typeof expected === "object" && "$eq" in expected) {
            return actual === expected.$eq;
          }
          return actual === expected;
        });
        if (!isMatch) continue;
      }
      const score = cosineSimilarity(vector, record.values);
      if (score !== null) {
        matches.push({ id, score, metadata: includeMetadata ? record.metadata : undefined });
      }
    }
    matches.sort((a, b) => b.score - a.score);
    return { matches: matches.slice(0, topK) };
  },
});

// ─── Pinecone client ──────────────────────────────────────────────────────────
const getPineconeClient = () => {
  if (!client) {
    if (!process.env.PINECONE_API_KEY) throw new Error("PINECONE_API_KEY is required.");
    // Pinecone SDK v7: only apiKey needed
    client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return client;
};

// ─── Get index (Pinecone or in-memory fallback) ───────────────────────────────
export const getIndex = async () => {
  if (!usePinecone) {
    logger.warn("PINECONE_API_KEY not set — using in-memory vector store (RAG resets on restart)");
    return createLocalIndex();
  }
  logger.info("Using Pinecone vector store", { index: indexName });

  const pinecone = getPineconeClient();
  const existingIndexes = await pinecone.listIndexes();
  const indexExists = Array.isArray(existingIndexes?.indexes)
    ? existingIndexes.indexes.some((idx) => idx === indexName || idx?.name === indexName)
    : Array.isArray(existingIndexes)
    ? existingIndexes.includes(indexName)
    : false;

  if (!indexExists) {
    logger.info("Creating Pinecone index", { indexName });
    await pinecone.createIndex({
      name: indexName,
      dimension: 3072,
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
    });
    logger.info("Waiting for Pinecone index to be ready...");
    await new Promise((resolve) => setTimeout(resolve, 20000));
  }

  return pinecone.index(indexName);
};

// ─── Upsert vectors (batched, Pinecone v7 uses { records: [...] }) ────────────
export const upsertVectors = async (vectors) => {
  if (!vectors || vectors.length === 0) {
    logger.warn("upsertVectors called with empty array");
    return;
  }

  const index = await getIndex();
  const backend = usePinecone ? "pinecone" : "in-memory";
  logger.info("Upserting vectors to store", { count: vectors.length, firstId: vectors[0]?.id, backend });

  // Pinecone v7 API: index.upsert({ records: [...] }) — max 100 per call
  const BATCH_SIZE = 100;
  const totalBatches = Math.ceil(vectors.length / BATCH_SIZE);
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await index.upsert({ records: batch });
    logger.debug(`Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${totalBatches}`, { batchSize: batch.length });
  }

  logger.info("Vector upsert completed", { count: vectors.length, batches: totalBatches });
};

// ─── Fetch vectors by ID ──────────────────────────────────────────────────────
export const fetchVectors = async (ids = []) => {
  const index = await getIndex();
  if (!Array.isArray(ids) || ids.length === 0) return { vectors: [] };
  const fetchResponse = await index.fetch(ids);
  return fetchResponse;
};

// ─── Query vectors by similarity ──────────────────────────────────────────────
export const queryVectors = async (queryVector, topK = 5, filter = undefined) => {
  const index = await getIndex();
  const queryResponse = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    ...(filter ? { filter } : {}),
  });
  const matches = queryResponse.matches || [];
  logger.debug("Vector query completed", {
    topK,
    matchCount: matches.length,
    backend: usePinecone ? "pinecone" : "in-memory",
  });
  return matches;
};
