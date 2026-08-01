# syntax=docker/dockerfile:1
# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy only manifests first for better layer caching
COPY ./frontend/quizGenerator/package*.json ./

# Install ALL deps (including devDeps) — Vite plugins are needed at build time
RUN npm ci

COPY ./frontend/quizGenerator .

RUN npm run build

# ── Stage 2: Build backend ───────────────────────────────────────────────────
FROM node:22-alpine AS backend-builder

WORKDIR /app

COPY ./backend/package*.json ./

# Install production deps only
RUN npm ci --omit=dev

# ── Stage 3: Final production image ─────────────────────────────────────────
FROM node:22-alpine AS production

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production node_modules from backend-builder
COPY --from=backend-builder /app/node_modules ./node_modules

# Copy backend source code
COPY ./backend .

# Copy built frontend static files into backend public dir
COPY --from=frontend-builder /app/dist ./public

# Ensure uploads dir exists with correct ownership
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3141

# Healthcheck so ECS knows the container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3141/health || exit 1

CMD ["node", "index.js"]