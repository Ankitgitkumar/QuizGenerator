import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from "dotenv";

import logger from './utils/logger.js';
import { startRagWorker } from './workers/ragWorker.js';

// Import routes
import teacherRoute from './routes/teacher.js';
import studentRoute from './routes/student.js';
import classroomRoute from './routes/classroom.js';
import leaderboardRoute from './routes/leaderboard.js';
import { generalApiLimiter } from './middlewares/rateLimiter.js';

dotenv.config();

const port = process.env.PORT || 3141;

// Parse allowed origins from env (comma-separated).
// Vite auto-increments the port if 5173 is taken, so we allow 5173-5175 by default.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
    ];

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

// Sets secure HTTP headers (XSS, clickjacking, MIME sniffing, etc.)
// Disable HSTS when running on plain HTTP (no SSL termination) to avoid
// the browser force-upgrading requests to https:// and breaking asset loads.
app.use(helmet({
  hsts: process.env.NODE_ENV === 'production' && process.env.HTTPS === 'true'
    ? { maxAge: 31536000, includeSubDomains: true }
    : false,
}));

// Restrict CORS to known origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    logger.warn(`CORS blocked request from: ${origin}`);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ─── General Middleware ───────────────────────────────────────────────────────

app.use(express.static("public"));
// Parse JSON and form bodies FIRST so req.body is populated for sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prevent NoSQL injection — strip MongoDB operator keys ($gt, $where, etc.)
// Must run AFTER body parsing so req.body is populated.
// express-mongo-sanitize is incompatible with Express 5 (req.query is read-only).
const sanitizeBody = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      sanitizeBody(obj[key]);
    }
  }
};
app.use((req, res, next) => {
  if (req.body) sanitizeBody(req.body);
  next();
});

// Apply a general rate limiter to all /api/* routes
app.use('/api', generalApiLimiter);

// ─── Request Logging ──────────────────────────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/v1/teacher', teacherRoute);
app.use('/api/v1/student', studentRoute);
app.use('/api/v1/classroom', classroomRoute);
app.use('/api/v1/leaderboard', leaderboardRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Maps internal errors to clean user-facing messages.
// Raw stack traces are ONLY logged server-side, never sent to the client.

const USER_FACING_ERRORS = {
  // Mongoose
  CastError:          'Invalid ID format.',
  ValidationError:    'Validation failed. Please check your input.',
  MongoServerError:   'Database operation failed. Please try again.',
  // JWT
  JsonWebTokenError:  'Invalid session. Please sign in again.',
  TokenExpiredError:  'Your session has expired. Please sign in again.',
  NotBeforeError:     'Token not yet valid. Please sign in again.',
  // Rate limit / permissions
  ForbiddenError:     'You do not have permission to perform this action.',
  // Pinecone / external
  PineconeArgumentError: 'Vector store error. Please try again.',
  PineconeConnectionError: 'Could not connect to the knowledge base. Please try again later.',
};

app.use((err, req, res, next) => {
  // Always log the full error server-side
  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    name: err.name,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Determine HTTP status
  let status = err.status || err.statusCode || 500;
  if (err.name === 'CastError' || err.name === 'ValidationError') status = 400;
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') status = 401;
  if (err.name === 'MongoServerError' && err.code === 11000) status = 409; // duplicate key

  // Pick a clean message — never expose internals
  let message = USER_FACING_ERRORS[err.name];

  if (!message) {
    if (status === 400) message = 'Bad request. Please check your input.';
    else if (status === 401) message = 'Unauthorized. Please sign in again.';
    else if (status === 403) message = 'Access denied.';
    else if (status === 404) message = 'The requested resource was not found.';
    else if (status === 409) message = 'This record already exists.';
    else if (status === 429) message = 'Too many requests. Please slow down.';
    else message = 'Something went wrong on our end. Please try again.';
  }

  res.status(status).json({ error: message });
});


// ─── MongoDB Connection & Server Start ────────────────────────────────────────

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Start the background RAG worker (processes BullMQ jobs from Redis queue)
    await startRagWorker();

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`, { port, env: process.env.NODE_ENV || 'development' });
    });
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }
}

main();
