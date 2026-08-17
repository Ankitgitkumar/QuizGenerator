# 🎓 QuizForge AI — Intelligent Quiz Generation Platform

[![CI](https://github.com/yourusername/quiz-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/quiz-generator/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)

> An AI-powered quiz generation platform where teachers create quizzes from any topic or PDF using **Gemini 2.5 Flash** with **Retrieval-Augmented Generation (RAG)**, and students take them in real-time in their classrooms.

**Live Demo:** [https://quizgenerator-backend-vafs.onrender.com](https://quizgenerator-backend-vafs.onrender.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Quiz Generation** | Gemini 2.5 Flash generates MCQ + short answer questions from any topic |
| 📄 **PDF Ingestion** | Upload a PDF; the system extracts text and generates contextual questions |
| 🔍 **RAG Pipeline** | Pinecone vector search retrieves the most relevant document chunks before generation |
| ⚙️ **Async Task Queue** | **BullMQ & Redis** process heavy PDF chunking and embedding in the background |
| 🏆 **Redis Leaderboard** | Real-time global and classroom leaderboards powered by **Redis Sorted Sets** |
| 🏫 **Classroom Management** | Teachers create classrooms with join codes; students enroll |
| ⏰ **Scheduled Quizzes** | Quizzes unlock at a set date/time for all classroom students simultaneously |
| 🔒 **Role-based Auth** | Separate JWT flows for Teacher and Student roles |
| ⚡ **Redis Caching** | Topic-based quiz generations are cached for 24h, slashing Gemini API calls |
| 🛡️ **Rate Limiting** | AI endpoints are protected (10 req/hr) against abuse and cost overruns |
| 🧪 **Test Coverage** | Jest unit + integration tests with CI pipeline via GitHub Actions |
| 🐳 **Docker** | Single-image build; Docker Compose for local dev with Redis + MongoDB |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)                │
│          react-router-dom · Tailwind · react-hot-toast  │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API
┌───────────────────────▼─────────────────────────────────┐
│               Backend (Express + Node.js)               │
│                                                         │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ JWT Auth    │  │  Zod     │  │  Winston Logger   │  │
│  │ (Teacher /  │  │ Validate │  │  (structured JSON)│  │
│  │  Student)   │  │          │  │                   │  │
│  └─────────────┘  └──────────┘  └───────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Quiz Generation Pipeline              │   │
│  │                                                  │   │
│  │  1. Check Redis cache (MD5 hash of topic+n)      │   │
│  │  2a. Cache HIT  → return instantly (<10ms)       │   │
│  │  2b. Cache MISS → RAG retrieval from Pinecone    │   │
│  │  3. Send enriched context to Gemini 2.5 Flash    │   │
│  │  4. Parse JSON response, save to MongoDB         │   │
│  │  5. Cache result for 24h                         │   │
│  └──────────────────────────────────────────────────┘   │
└──────┬───────────────────┬────────────────┬─────────────┘
       │                   │                │
┌──────▼──────┐  ┌─────────▼────┐  ┌────────▼──────────┐
│  MongoDB    │  │    Redis     │  │    Gemini AI +    │
│  (Atlas)    │  │   (Cache)    │  │  Pinecone (RAG)   │
└─────────────┘  └─────────────┘  └───────────────────┘
```

---

## 🚀 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind | Fast HMR, modern component model |
| Backend | Node.js 22 + Express 5 | Async-first, huge ecosystem |
| AI | Gemini 2.5 Flash | State-of-the-art, cost-effective generation |
| Embeddings | Gemini Embedding-001 | 3072-dim vectors for high-quality RAG |
| Vector DB | Pinecone | Managed serverless semantic search |
| Database | MongoDB Atlas | Flexible schema, scales naturally |
| Cache | Redis (ioredis) | Sub-millisecond reads, distributed |
| Job Queue | BullMQ | Distributed task queue for asynchronous RAG ingestion |
| Auth | JSON Web Tokens | Stateless, scalable, no session store |
| Validation | Zod | Runtime type safety for API inputs |
| Logging | Winston | Structured JSON logs, log levels |
| Testing | Jest + Supertest | Unit + integration coverage |
| DevOps | Docker + GitHub Actions | CI/CD, reproducible environments |

---

## 🔍 How RAG Works in This System

1. **Document Ingestion**: When a teacher uploads a PDF, the text is extracted and split into overlapping chunks (via a sliding window chunker).
2. **Embedding**: Each chunk is embedded using `gemini-embedding-001` into a 3072-dimensional vector.
3. **Storage**: Vectors are upserted to Pinecone with metadata (teacherId, sourceId, chunk text).
4. **Retrieval**: At quiz generation time, the topic/query is embedded and the top-5 most semantically similar chunks are retrieved.
5. **Augmented Generation**: The retrieved chunks are injected into the Gemini prompt as context, grounding the quiz in the actual document content.

**Result**: Questions generated from a "Photosynthesis" PDF will reference the specific content of that PDF — not generic internet knowledge.

---

## ⚡ High-Throughput Redis Leaderboard & Asynchronous Task Queue

### 🏆 Redis-Powered Leaderboards
Instead of executing heavy MongoDB aggregation queries (`$group`, `$sort`) whenever a student or teacher views the rankings, the system uses **Redis Sorted Sets (ZSET)**. This ensures that leaderboard read and write operations run in **O(log N)** time complexity.
* **Score Increments**: When a student completes a quiz, their score is atomically updated in the global and classroom-specific ZSETs via `ZINCRBY`.
* **Instant Ranking Retrieval**: Retrieving a student's rank is performed via `ZREVRANK`, and fetching the top-N list uses `ZREVRANGE ... WITHSCORES` in milliseconds.
* **Fallback & Enrichment**: If Redis is offline, the system handles it gracefully without breaking. On retrieval, usernames are resolved in bulk from MongoDB to minimize database roundtrips.

### ⚙️ Asynchronous Processing with BullMQ
To maintain high responsiveness and ensure the Express event loop remains completely unblocked, document processing (PDF parsing, text chunking, and Pinecone upserting) is fully offloaded to **BullMQ** running on Redis:
* **Decoupled Producers/Consumers**: The API endpoints immediately return a `202 Accepted` status upon PDF upload. The job is queued into Redis.
* **Reliable Background Execution**: Background workers (`backend/workers/ragWorker.js`) poll jobs and perform the heavy embedding/upsert calculations.
* **Resiliency**: Built-in exponential backoff retry strategies handle transient network errors (e.g. Pinecone or Gemini API rate limits) without losing user data.

---

## 🛡️ Security Features

- **CORS**: Restricted to env-configured origins (no wildcard `*` in production)
- **Helmet.js**: Sets 11 security HTTP headers (XSS, clickjacking, MIME sniffing)
- **NoSQL Injection**: `express-mongo-sanitize` strips `$` operators from request bodies
- **Rate Limiting**: 10 req/hr on AI endpoints, 10/15min on auth
- **JWT**: Separate secrets for teacher and student tokens
- **Input Validation**: All routes validated with Zod schemas before hitting controllers

---

## ⚡ Caching Strategy

| Data | Cache Key | TTL | Invalidated On |
|---|---|---|---|
| AI Quiz Generation | `quiz:ai:<MD5(topic+n)>` | 24 hours | Never (content is deterministic) |
| Teacher Quiz List | `quiz:list:teacher:<id>` | 5 minutes | Create / Edit / Delete quiz |
| Quiz Detail | `quiz:detail:<quizId>` | 10 minutes | Edit / Schedule / Delete |
| Student Practice List | `quiz:practice:list:<id>` | 5 minutes | New practice quiz created |

**Fallback**: If Redis is unavailable, the app transparently falls back to an in-memory Map store, so Redis is optional for local development.

---

## 🗂️ Project Structure

```
quiz-generator/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── quizController.js        # Quiz CRUD + caching
│   │   └── knowledgeBaseController.js
│   ├── middlewares/          # Express middleware chain
│   │   ├── teacher.js               # JWT auth (teacher)
│   │   ├── student.js               # JWT auth (student)
│   │   ├── rateLimiter.js           # express-rate-limit configs
│   │   └── validate.js              # Zod validation wrapper
│   ├── routes/               # Route definitions
│   ├── schemas/              # Zod input schemas
│   │   └── quizSchemas.js
│   ├── utils/                # Shared utilities
│   │   ├── gemini.js                # Gemini AI wrapper
│   │   ├── embeddings.js            # Gemini embedding API
│   │   ├── vectorStore.js           # Pinecone + in-memory fallback
│   │   ├── knowledgeBase.js         # Document ingestion pipeline
│   │   ├── chunking.js              # Text chunking strategy
│   │   ├── cache.js                 # Redis cache utility
│   │   └── logger.js                # Winston structured logger
│   ├── tests/                # Jest test suite
│   │   ├── gemini.test.js           # Unit tests (mocked AI)
│   │   └── auth.test.js             # Middleware tests
│   ├── db.js                 # Mongoose schemas + indexes
│   └── index.js              # App bootstrap + security middleware
├── frontend/
│   └── quizGenerator/src/
│       ├── components/
│       │   ├── Teacher/             # Dashboard, CreateQuiz, QuizView
│       │   ├── Student/             # Dashboard, GenerateQuiz, QuizAttempt
│       │   ├── Classroom/           # Join/Create classroom
│       │   └── register/            # Signin, Signup
│       └── config/api.js            # API URL config
├── .github/workflows/ci.yml  # GitHub Actions CI pipeline (tests)
├── .github/workflows/cd.yml  # GitHub Actions CD pipeline (ECR + ECS deploy)
├── docker-compose.yml         # Local dev orchestration
├── dockerfile                 # Production multi-stage build
└── .env.example               # Environment variable template
```

---

## 🏃 Running Locally

### Prerequisites
- Node.js 22+
- MongoDB Atlas URI (free tier works)
- Gemini API key ([get one here](https://aistudio.google.com/app/apikey))
- Redis (optional — app falls back to in-memory if not running)

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/quiz-generator.git
cd quiz-generator

# Backend setup
cd backend
cp ../.env.example .env
# Fill in your MONGODB_URI and GEMINI_API_KEY in .env
npm install
npm run dev

# Frontend setup (new terminal)
cd ../frontend/quizGenerator
npm install
npm run dev
```

### Using Docker Compose

```bash
# Start backend + Redis (uses MongoDB Atlas via env)
docker compose up

# Start backend + Redis + local MongoDB
docker compose --profile local-db up
```

---

## 🧪 Running Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Tests are automatically run on every PR via GitHub Actions.

---

## 📡 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/teacher/signup` | — | Register teacher |
| POST | `/api/v1/teacher/signin` | — | Login teacher |
| GET | `/api/v1/teacher/me` | Teacher JWT | Get profile |
| POST | `/api/v1/teacher/create` | Teacher JWT | Create AI quiz (rate limited) |
| GET | `/api/v1/teacher/quizzes` | Teacher JWT | List quizzes (cached) |
| PATCH | `/api/v1/teacher/quiz/:id/schedule` | Teacher JWT | Schedule quiz |
| DELETE | `/api/v1/teacher/quiz/:id` | Teacher JWT | Delete quiz |
| POST | `/api/v1/student/signup` | — | Register student |
| POST | `/api/v1/student/quizzes/create` | Student JWT | Generate practice quiz (cached) |
| POST | `/api/v1/student/quizzes/submit` | Student JWT | Submit quiz answers |
| GET | `/api/v1/student/quizzes/previous` | Student JWT | View attempt history |
| GET | `/health` | — | Health check |

---

## 🚀 CI/CD & AWS Deployment

The project ships with two GitHub Actions pipelines:

| Workflow | File | Triggers | What it does |
|---|---|---|---|
| **CI** | `ci.yml` | Every PR & push | Runs Jest tests |
| **CD** | `cd.yml` | Push to `main`/`master` | Builds Docker image → ECR → deploys to ECS Fargate |

> **No long-lived AWS keys are stored anywhere.** Authentication uses GitHub OIDC — GitHub exchanges a short-lived JWT for temporary AWS credentials per deployment run.

---

### Step 1 — Create an OIDC Identity Provider in AWS

> Do this once. It lets AWS trust tokens issued by GitHub Actions.

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam) → **Identity providers** (left sidebar)
2. Click **Add provider**
3. Select **OpenID Connect**
4. **Provider URL**: `https://token.actions.githubusercontent.com` → click **Get thumbprint**
5. **Audience**: `sts.amazonaws.com`
6. Click **Add provider**

---

### Step 2 — Create an IAM Role for GitHub Actions

> This role defines what GitHub Actions is allowed to do in your AWS account.

1. Go to **IAM → Roles** → click **Create role**
2. **Trusted entity type**: select **Web identity**
3. **Identity provider**: pick `token.actions.githubusercontent.com`
4. **Audience**: `sts.amazonaws.com`
5. Fill in the GitHub fields (these automatically build the trust condition):
   - **GitHub organization**: your GitHub username or org name — e.g. `Ankitgitkumar`
   - **GitHub repository** *(optional)*: your repo name — e.g. `QuizGenerator` *(leave `*` to allow all repos)*
   - **GitHub branch** *(optional)*: `*` to allow all branches, or `main` to restrict to main only
6. Click **Next** → search and attach these two policies:
   - ✅ `AmazonEC2ContainerRegistryFullAccess`
   - ✅ `AmazonECS_FullAccess`
7. Click **Next** → **Role name**: `github-actions-quizforge` → **Create role**
8. Open the role you just created → copy the **ARN** at the top (e.g. `arn:aws:iam::123456789012:role/github-actions-quizforge`) — you'll need it in Step 7

---

### Step 3 — Create an ECR Repository

> ECR (Elastic Container Registry) stores your Docker images.

1. Go to [Amazon ECR Console](https://console.aws.amazon.com/ecr) → **Repositories** → **Create repository**
2. **Visibility**: Private
3. **Repository name**: `quizforge`
4. Leave everything else as default → **Create repository**
5. Note the **URI** shown (e.g. `123456789012.dkr.ecr.ap-south-1.amazonaws.com/quizforge`)

---

### Step 4 — Create an ECS Cluster

> ECS runs your Docker container on managed infrastructure (Fargate = no servers to manage).

1. Go to [Amazon ECS Console](https://console.aws.amazon.com/ecs) → **Clusters** → **Create cluster**
2. **Cluster name**: `quizforge-cluster`
3. **Infrastructure**: select **AWS Fargate (serverless)**
4. Click **Create**

---

### Step 5 — Create a Task Definition

> A task definition is the blueprint for your container (image, CPU, memory, env vars, ports).

1. Go to **ECS → Task definitions** → **Create new task definition**
2. **Task definition family name**: `quizforge-service` *(this must match the `ECS_SERVICE` GitHub variable)*
3. **Infrastructure**:
   - Launch type: **AWS Fargate**
   - OS: **Linux/X86_64**
   - CPU: `1 vCPU`, Memory: `2 GB`
4. **Task execution role**: select `ecsTaskExecutionRole` (auto-created by AWS; if missing click **Create new role**)
5. Under **Container**, click **Add container**:
   - **Name**: `quizforge-backend` *(this must match the `CONTAINER_NAME` GitHub variable)*
   - **Image URI**: your ECR URI from Step 3 + `:latest` (e.g. `123456789012.dkr.ecr.ap-south-1.amazonaws.com/quizforge:latest`)
   - **Port mappings**: Container port `3000`, Protocol `TCP`
   - Under **Environment variables** → add all keys from your `.env` file
6. Click **Create**

---

### Step 6 — Create an ECS Service

> The service keeps your container running and handles zero-downtime rolling deployments.

1. Go to **ECS → Clusters → quizforge-cluster → Services** → **Create service**
2. **Compute options**: Launch type → **Fargate**
3. **Task definition**: select `quizforge-service` (latest revision)
4. **Service name**: `quizforge-service` *(must match `ECS_SERVICE` variable)*
5. **Desired tasks**: `1`
6. **Networking**: choose your VPC, subnets, and a security group that allows inbound traffic on port `3000`
7. *(Optional)* Under **Load balancing**: attach an Application Load Balancer for a stable public URL
8. Click **Create service**

---

### Step 7 — Add Secret & Variables to GitHub

Go to your GitHub repo → **Settings → Secrets and variables → Actions**

#### ➕ New repository secret (Secrets tab)

| Name | Value |
|---|---|
| `AWS_ROLE_ARN` | The ARN you copied in Step 2 |

#### ➕ New repository variables (Variables tab)

| Name | Example value | Description |
|---|---|---|
| `AWS_REGION` | `ap-south-1` | Region where ECR & ECS live |
| `ECR_REPOSITORY` | `quizforge` | ECR repository name (Step 3) |
| `ECS_CLUSTER` | `quizforge-cluster` | ECS cluster name (Step 4) |
| `ECS_SERVICE` | `quizforge-service` | ECS service & task definition name (Steps 5 & 6) |
| `CONTAINER_NAME` | `quizforge-backend` | Container name inside task definition (Step 5) |

---

### Step 8 — Deploy 🚀

Push any commit to `main` or `master` — the CD pipeline runs automatically:

1. ✅ **OIDC auth** — GitHub exchanges a JWT for a temporary AWS token (no stored keys)
2. 🐳 **Docker build** — multi-stage build, layer-cached between runs
3. 📦 **Push to ECR** — tagged with commit SHA + `latest`
4. 📋 **Task definition update** — new revision registered with the new image URI
5. 🚀 **ECS rolling deploy** — old tasks replaced with new ones, no downtime
6. ⏳ **Stability check** — pipeline waits until all tasks are healthy before marking success

Monitor live progress: **ECS → Clusters → quizforge-cluster → Services → quizforge-service → Deployments tab**

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes and ensure `npm test` passes
4. Open a Pull Request — CI will run automatically

---


