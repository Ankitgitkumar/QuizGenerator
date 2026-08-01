import dotenv from 'dotenv';
dotenv.config();

import { ingestDocument } from './knowledgeBase.js';
import { queryVectors } from './vectorStore.js';
import { embedText } from './embeddings.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  try {
    console.log('RAG test starting...');

    const text = 'This is a short test document about NodeJS, RAG, and embeddings. It mentions JavaScript, servers, and testing.';
    const metadata = {
      id: `test-${Date.now()}`,
      filename: 'test.txt',
      uploadedBy: 'local-rag-test',
      uploadDate: new Date().toISOString(),
    };

    console.log('Ingesting test document...');
    await ingestDocument(text, metadata);
    console.log('Ingest complete. Waiting briefly for index consistency...');
    await wait(2000);

    const query = 'What is NodeJS?';
    console.log('Querying JS RAG for nearest matches...');
    const queryEmbedding = await embedText(query);
    const matches = await queryVectors(queryEmbedding, 5);
    console.log(`Retrieved ${matches?.length || 0} matches`);
    if (matches && matches.length) {
      matches.forEach((m, i) => {
        console.log(`#${i} id=${m.id} score=${m.score}`);
        if (m.payload && m.payload.text) {
          console.log('  snippet:', m.payload.text.substring(0, 240).replace(/\n/g, ' '));
        }
      });
    }

    console.log('RAG test finished. If Pinecone storage is used, verify your Pinecone instance and API configuration if there are issues.');
    process.exit(0);
  } catch (err) {
    console.error('RAG test failed:', err);
    process.exit(1);
  }
};

main();
