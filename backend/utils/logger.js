// utils/logger.js — Winston structured logger
// Replaces all console.log/warn/error calls with structured, leveled logging.
// In development: pretty-printed colored output
// In production: JSON output (easy to pipe into Datadog/CloudWatch/Loki)

import { createLogger, format, transports } from "winston";

const { combine, timestamp, colorize, printf, json, errors } = format;

const isDev = process.env.NODE_ENV !== "production";

// Human-readable format for local development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
  })
);

// Structured JSON format for production
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  format: isDev ? devFormat : prodFormat,
  transports: [
    new transports.Console(),
    // Uncomment to also write errors to a file:
    // new transports.File({ filename: "logs/error.log", level: "error" }),
    // new transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
