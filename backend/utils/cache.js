// utils/cache.js — Redis-backed caching utility
// Falls back gracefully to a no-op in-memory stub when Redis is unavailable,
// so the app keeps working even without Redis configured.

// ioredis uses a default export — the Redis class itself (no named createClient)
import Redis from "ioredis";
import logger from "./logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient = null;
let redisAvailable = false;

// In-memory fallback store for when Redis is not available
const memStore = new Map();

async function getRedisClient() {
  if (redisClient) return redisClient;

  try {
    const client = new Redis(REDIS_URL, {
      // Prevent ioredis from retrying indefinitely if Redis isn't running
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,   // We call connect() ourselves below
    });

    // lazyConnect requires an explicit connect() call
    try {
      await client.connect();
      redisAvailable = true;
      logger.info("Redis connected successfully");
    } catch (connectErr) {
      logger.warn(`Redis unavailable, using in-memory fallback: ${connectErr.message}`);
      redisAvailable = false;
    }

    client.on("error", (err) => {
      if (redisAvailable) {
        logger.warn(`Redis error: ${err.message}`);
        redisAvailable = false;
      }
    });

    redisClient = client;
    return client;
  } catch (err) {
    logger.warn(`Redis client creation failed: ${err.message}`);
    return null;
  }
}

/**
 * Get a cached value by key.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const getCache = async (key) => {
  try {
    const client = await getRedisClient();

    if (client && redisAvailable) {
      const data = await client.get(key);
      if (data) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache MISS: ${key}`);
      return null;
    }

    // In-memory fallback
    const entry = memStore.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      logger.debug(`MemCache HIT: ${key}`);
      return entry.value;
    }
    if (entry) memStore.delete(key); // expired
    return null;
  } catch (err) {
    logger.warn(`Cache GET error for key "${key}": ${err.message}`);
    return null;
  }
};

/**
 * Store a value in cache with an optional TTL.
 * @param {string} key
 * @param {any} value - Will be JSON-serialised
 * @param {number} ttlSeconds - Default 3600 (1 hour)
 */
export const setCache = async (key, value, ttlSeconds = 3600) => {
  try {
    const client = await getRedisClient();

    if (client && redisAvailable) {
      await client.setex(key, ttlSeconds, JSON.stringify(value));
      logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
      return;
    }

    // In-memory fallback
    memStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    logger.debug(`MemCache SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (err) {
    logger.warn(`Cache SET error for key "${key}": ${err.message}`);
  }
};

/**
 * Delete a cached key (use for cache invalidation).
 * @param {string} key
 */
export const invalidateCache = async (key) => {
  try {
    const client = await getRedisClient();

    if (client && redisAvailable) {
      await client.del(key);
      logger.debug(`Cache INVALIDATED: ${key}`);
      return;
    }

    memStore.delete(key);
    logger.debug(`MemCache INVALIDATED: ${key}`);
  } catch (err) {
    logger.warn(`Cache DEL error for key "${key}": ${err.message}`);
  }
};

/**
 * Delete all cache keys that start with a given prefix.
 * Useful for bulk invalidation (e.g., all quizzes for a teacher).
 * @param {string} prefix
 */
export const invalidateCacheByPrefix = async (prefix) => {
  try {
    const client = await getRedisClient();

    if (client && redisAvailable) {
      const keys = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await client.del(...keys);
        logger.debug(`Cache bulk INVALIDATED: ${keys.length} keys with prefix "${prefix}"`);
      }
      return;
    }

    // In-memory fallback
    let count = 0;
    for (const key of memStore.keys()) {
      if (key.startsWith(prefix)) {
        memStore.delete(key);
        count++;
      }
    }
    if (count > 0) logger.debug(`MemCache bulk INVALIDATED: ${count} keys with prefix "${prefix}"`);
  } catch (err) {
    logger.warn(`Cache PREFIX DEL error for "${prefix}": ${err.message}`);
  }
};
