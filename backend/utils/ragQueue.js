// utils/ragQueue.js — BullMQ queue for async RAG ingestion
// Uses lazy initialization so the app doesn't crash at startup if Redis is offline.

import { Queue } from 'bullmq';
import Redis from 'ioredis';
import logger from './logger.js';

// ─── Redis connection config ──────────────────────────────────────────────────

export function getRedisConfig() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    const parsed = new URL(url);
    const isTls = parsed.protocol === 'rediss:';
    return {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port, 10) || (isTls ? 6380 : 6379),
      // Required for Upstash and other TLS Redis providers (rediss://)
      ...(isTls && { tls: {} }),
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

// ─── Lazy queue (created only when first needed, NOT at import time) ─────────

let _ragQueue = null;

export function getRagQueue() {
  if (_ragQueue) return _ragQueue;

  _ragQueue = new Queue('rag-ingestion', {
    connection: getRedisConfig(),
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  });

  // Suppress unhandled queue-level errors — worker handles them separately
  _ragQueue.on('error', (err) => {
    logger.debug('[ragQueue] Redis error (Redis may be offline)', { error: err.message });
  });

  return _ragQueue;
}

// ─── Redis availability check ─────────────────────────────────────────────────

/**
 * Quickly check if Redis is reachable.
 * Returns true if Redis is up, false otherwise.
 */
export async function isRedisAvailable() {
  const cfg = getRedisConfig();
  let client;
  try {
    client = new Redis({
      host: cfg.host,
      port: cfg.port,
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      connectTimeout: 2000,
    });
    // MUST silence error event before connecting — otherwise Node.js crashes
    // on 'error' events emitted after the try-catch catches the thrown error
    client.on('error', () => {});
    await client.connect();
    await client.ping();
    return true;
  } catch {
    return false;
  } finally {
    if (client) {
      client.removeAllListeners();
      client.disconnect()?.catch?.(() => {});
    }
  }
}
