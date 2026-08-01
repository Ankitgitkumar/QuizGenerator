// utils/redisClient.js — Shared singleton ioredis client
// Both the cache layer (cache.js) and leaderboard use this same connection
// so the app never opens more Redis connections than necessary.

import Redis from 'ioredis';
import logger from './logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let _client = null;
let _available = false;

/**
 * Returns the singleton Redis client, creating it lazily on first call.
 * Returns null if Redis is unreachable.
 *
 * @returns {Promise<import('ioredis').Redis|null>}
 */
export async function getRedisClient() {
  if (_client) return _available ? _client : null;

  try {
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    try {
      await client.connect();
      _available = true;
      logger.info('[redis] Connected');
    } catch (connectErr) {
      logger.warn(`[redis] Unavailable – ${connectErr.message}`);
      _available = false;
    }

    client.on('error', (err) => {
      if (_available) {
        logger.warn(`[redis] Connection error: ${err.message}`);
        _available = false;
      }
    });

    client.on('ready', () => {
      if (!_available) {
        logger.info('[redis] Reconnected');
        _available = true;
      }
    });

    _client = client;
  } catch (err) {
    logger.warn(`[redis] Client creation failed: ${err.message}`);
    _client = null;
  }

  return _available ? _client : null;
}

/** True if Redis was reachable on last connection attempt. */
export function isRedisAvailable() {
  return _available;
}
