import { embedBatch } from "./embeddings.js";
import { upsertVectors } from "./vectorStore.js";
import { chunkText } from "./chunking.js";

export const ingestDocument = async (text, metadata = {}) => {
  try {
    console.log("========== INGEST DOCUMENT ==========");

    const chunks = chunkText(text);

    console.log("Total chunks:", chunks.length);

    if (!chunks.length) {
      throw new Error("No chunks created from document");
    }

    chunks.forEach((chunk, index) => {
      console.log(
        `Chunk ${index}: ${chunk.length} characters`
      );
    });

    console.log("Starting embeddings generation...");

    const embeddings = await embedBatch(chunks);

    console.log("Embeddings generated successfully");
    console.log("Embedding count:", embeddings.length);

    if (
      !Array.isArray(embeddings) ||
      embeddings.length !== chunks.length
    ) {
      throw new Error(
        "Embedding generation returned invalid results"
      );
    }

    const vectors = chunks.map((chunk, i) => ({
      id: `${metadata.id || "doc"}-${i}`,
      values: embeddings[i],
      metadata: {
        ...metadata,
        chunkIndex: i,
        text: chunk,
      },
    }));

    console.log("Starting vector upsert...");

    await upsertVectors(vectors);

    console.log("Vector upsert completed");

    console.log(
      `Successfully ingested ${chunks.length} chunks`
    );

    return true;
  } catch (error) {
    console.error("========== INGEST ERROR ==========");
    console.error(error);

    if (error.errorDetails) {
      console.error(
        JSON.stringify(
          error.errorDetails,
          null,
          2
        )
      );
    }

    throw error;
  }
};