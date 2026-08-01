# QuizForge AI — Campus Placement Interview Q&A
> 25 detailed questions with must-know code for every answer.

---

## 1. Tell me about your project in one minute.

**Answer:**
QuizForge AI is a full-stack SaaS platform where teachers generate AI-powered quizzes from a topic or PDF and assign them to students in virtual classrooms. Students attempt scheduled quizzes or generate personal practice quizzes.

**Stack:** Node.js + Express 5, MongoDB, React + Vite, Google Gemini 2.5 Flash AI, Pinecone vector DB, BullMQ job queue, Redis, Winston logging.

**Key engineering decisions:**
- RAG pipeline for PDF-grounded quiz generation
- BullMQ for async background processing (PDFs take 60–90s)
- Two-tier caching (memory + Redis) to cut AI API costs
- Dual JWT secrets (separate per role — teacher vs student)
- Zod schema validation on every route

---

## 2. What is BullMQ and what problem does it solve in your project?

**Answer:**
BullMQ is a Redis-backed job queue. A **Queue** receives jobs; a **Worker** processes them independently of the HTTP request lifecycle.

**The problem:** Generating a quiz from a PDF takes 60–90 seconds (80 Gemini embedding calls + Pinecone upsert + AI generation). An HTTP connection times out at ~30 seconds — so the browser would get a timeout error even though the quiz was being built.

**Simple analogy:** Without BullMQ the waiter stands in the kitchen watching the chef cook for 30 minutes before giving you a receipt. With BullMQ, the waiter gives you a receipt immediately and the chef cooks in the background.

**Must-know code:**

```js
// quizController.js — when a PDF is uploaded
if (useRag && hasUploadedDocument) {
  const redisUp = await isRedisAvailable();

  if (redisUp) {
    // Save quiz as 'processing' immediately
    const newQuiz = new Quiz({ title, topic, status: 'processing', ... });
    await newQuiz.save();

    // Push job to queue — takes ~1ms
    await getRagQueue().add('ingest', {
      text: pdfText,
      quizId: newQuiz._id.toString(),
      teacherId,
      numberOfQuestions,
    });

    // Respond instantly — no waiting!
    return res.status(202).json({
      message: 'Quiz is being generated. Poll /quiz/:id/status for updates.',
      quizId: newQuiz._id,
      status: 'processing',
    });
  }
  // Redis offline → sync fallback (teacher waits, but it works)
}

// ragWorker.js — runs in background
const processor = async (job) => {
  const { text, quizId, teacherId, numberOfQuestions } = job.data;

  await ingestDocument(text, { id: `quiz-${quizId}`, teacherId }); // embed + Pinecone
  const content  = await buildRagContent({ text, teacherId });     // retrieve context
  const questions = await generateQuizFromText(content, numberOfQuestions); // Gemini

  await Quiz.findByIdAndUpdate(quizId, { questions: questionIds, status: 'ready' });
  await invalidateCache(`quiz:list:teacher:${teacherId}`);
};

const worker = new Worker('rag-ingestion', processor, {
  connection: getRedisConfig(),
  concurrency: 2,   // process 2 PDFs simultaneously
});
```

**What BullMQ gives you beyond just setTimeout:**
- Jobs survive server restarts (stored in Redis)
- Automatic retry with exponential backoff (`attempts: 2, backoff: { type: 'exponential', delay: 3000 }`)
- Concurrency control
- Job status tracking (waiting / active / completed / failed)

---

## 3. What is RAG and how did you implement it?

**Answer:**
RAG — Retrieval-Augmented Generation — grounds an LLM's output in your own document instead of relying on its general training data.

**Pipeline:**
1. **Chunk** PDF text into ~500-character pieces
2. **Embed** each chunk (Gemini embedding-001 → 3072-dim float vector)
3. **Store** in Pinecone (vector database)
4. At query time: **embed** the topic → **search** Pinecone top-5 → **inject** into Gemini prompt

**Must-know code:**

```js
// Ingest — runs in BullMQ worker
export const ingestDocument = async (text, metadata = {}) => {
  const chunks = chunkText(text);                    // ["chunk1...", "chunk2...", ...]
  const embeddings = await embedBatch(chunks);       // [[0.12, -0.34, ...], ...]
  const vectors = chunks.map((chunk, i) => ({
    id: `${metadata.id}-${i}`,
    values: embeddings[i],                           // 3072 floats
    metadata: { ...metadata, text: chunk },
  }));
  await upsertVectors(vectors);                      // store in Pinecone
};

// Retrieve at query time
const buildRagContent = async ({ query, teacherId }) => {
  const queryEmbedding = await embedText(query);     // embed the user's topic
  const matches = await queryVectors(queryEmbedding, 5, { teacherId: { $eq: teacherId } });
  const chunks  = matches.map(m => m.metadata.text).filter(Boolean);

  if (!chunks.length) return query; // fallback to raw topic

  return `Retrieved context:\n${chunks.join('\n\n---\n\n')}\n\nGenerate ${n} questions from the above.`;
};
```

**Gotcha I fixed:** Pinecone SDK v7 changed `index.upsert({ vectors: [...] })` to `index.upsert({ records: [...] })`. The old format threw `PineconeArgumentError: Must pass in at least 1 record` — **after** all 80 embeddings were already generated (wasted ~60 seconds).

---

## 4. What is the HTTP 202 Accepted pattern and why did you use it?

**Answer:**
`202 Accepted` means: "I received your request, it's valid, but the work isn't done yet." It's the correct status code for async operations.

```
201 Created   = created right now, synchronously
202 Accepted  = received and queued, will be done eventually
```

**In my project:**
```js
// Async PDF path
return res.status(202).json({
  quizId: newQuiz._id,
  status: 'processing',
  message: 'Poll /teacher/quiz/:id/status for updates',
});

// Teacher frontend polls every 3 seconds:
const poll = setInterval(async () => {
  const { data } = await axios.get(`/api/v1/teacher/quiz/${quizId}`);
  if (data.status === 'ready')   { clearInterval(poll); showQuiz(data); }
  if (data.status === 'failed')  { clearInterval(poll); showError(); }
}, 3000);
```

---

## 5. What is graceful degradation and how did you implement it?

**Answer:**
Graceful degradation means the system continues working at reduced capability when a dependency is unavailable — instead of crashing entirely.

**In my project — two examples:**

**1. Redis/BullMQ offline:**
```js
const redisUp = await isRedisAvailable(); // quick PING check
if (redisUp) {
  // Fast path: queue job, respond in <1s
  await getRagQueue().add('ingest', jobData);
  return res.status(202).json({ status: 'processing' });
}
// Degraded path: do it synchronously (takes 60s, but it works)
generatedQuestions = await processPDFSync(content);
```

**2. Pinecone not configured:**
```js
const usePinecone = Boolean(process.env.PINECONE_API_KEY);

export const getIndex = async () => {
  if (!usePinecone) {
    logger.warn('Pinecone not configured — using in-memory vector store');
    return createLocalIndex(); // Map-based fallback
  }
  return pinecone.index(indexName); // Real Pinecone
};
```
The app works without Pinecone — it just stores vectors in memory (lost on restart). Perfect for local development.

---

## 6. How does your caching work?

**Answer:**
Two-tier: **in-process memory** (zero network latency) + **Redis** (shared across restarts/pods):

```js
// utils/cache.js
const memCache = new Map(); // Tier 1 — in-process

export const getCache = async (key) => {
  // Check memory first (fastest)
  const mem = memCache.get(key);
  if (mem && mem.expiresAt > Date.now()) return mem.value;

  // Check Redis (survives restarts)
  if (redis) {
    const val = await redis.get(key);
    if (val) return JSON.parse(val);
  }
  return null;
};

export const setCache = async (key, value, ttlSeconds) => {
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  if (redis) await redis.setex(key, ttlSeconds, JSON.stringify(value));
};
```

**What's cached:**

| Cache Key | TTL | Why |
|---|---|---|
| `quiz:ai:{md5(topic+n)}` | 24h | Same topic → reuse AI result, saves Gemini cost |
| `quiz:list:teacher:{id}` | 5min | Dashboard — frequent reads |
| `quiz:detail:{id}` | 5min | Quiz view page |

**Cache invalidation:** When a quiz is created/updated → `invalidateCache('quiz:list:teacher:' + teacherId)` so the teacher sees fresh data immediately.

**Why not cache PDF quizzes?** Each PDF is unique content. A cache key can't represent it — we'd always miss.

---

## 7. How does JWT authentication work with two roles?

**Answer:**
Two **separate secrets** — one per role. A student token literally cannot decode with the teacher secret.

```js
// Teacher signs up
const token = jwt.sign({ teacherId: teacher._id }, process.env.JWT_TEACHER_PASSWORD);

// Student signs up
const token = jwt.sign({ studentId: student._id }, process.env.JWT_STUDENT_PASSWORD);

// Teacher middleware — only accepts teacher secret
export const teacherMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_TEACHER_PASSWORD); // ← teacher-only
  req.teacherId = decoded.teacherId;
  next();
};

// If a student sends their token to a teacher route:
// jwt.verify throws JsonWebTokenError → 401
```

**Why two secrets instead of a role field in the payload?**
If you use `{ role: 'teacher' }` in the payload, a clever attacker could forge a token with `role: 'teacher'` and a student secret. Separate secrets make this impossible.

---

## 8. Walk me through your Zod validation middleware.

**Answer:**
Reusable factory function — one schema per route, no if-else in controllers:

```js
// middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(issue => ({  // NOTE: .issues not .errors (Zod v4)
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  req.body = result.data; // replace with sanitised/typed data
  next();
};

// schemas
export const teacherSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email:     z.email('Invalid email'),
  password:  z.string().min(6, 'At least 6 characters'),
});

// Usage
router.post('/signup', validate(teacherSignupSchema), teacherController.signup);
```

**Zod v4 breaking change I hit:** `err.errors` was removed. Using it gives `undefined` silently — blank error messages sent to the user. Fixed by switching to `result.error.issues`.

---

## 9. What is Express 5's async error handling and why is it better?

**Answer:**
In Express 4, unhandled async errors crash the server unless every handler has try/catch + `next(err)`. Express 5 automatically catches rejected Promises and routes them to the error handler.

```js
// Express 4 — REQUIRED
router.get('/quiz/:id', async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    res.json(quiz);
  } catch (err) {
    next(err); // must manually pass to error handler
  }
});

// Express 5 — automatic
router.get('/quiz/:id', async (req, res) => {
  const quiz = await Quiz.findById(req.params.id); // throws → error handler automatically
  res.json(quiz);
});
```

My global error handler maps all error types to clean messages:
```js
app.use((err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  const USER_FACING = {
    CastError:          'Invalid ID format.',
    JsonWebTokenError:  'Invalid session. Please sign in again.',
    TokenExpiredError:  'Your session has expired.',
    MongoServerError:   'Database operation failed.',
    PineconeArgumentError: 'Vector store error. Please try again.',
  };

  let status = err.status || 500;
  if (err.name === 'CastError') status = 400;
  if (err.name === 'MongoServerError' && err.code === 11000) status = 409;

  res.status(status).json({
    error: USER_FACING[err.name] || 'Something went wrong. Please try again.',
  });
});
```

---

## 10. What bug did you face with middleware ordering?

**Answer:**
My `sanitizeBody` middleware ran **before** `express.json()`, so `req.body` was `undefined` when it executed. The middleware silently did nothing, meaning NoSQL injection characters were passing through.

```js
// ❌ Wrong order
app.use(sanitizeBody);     // req.body is undefined here — sanitizer does nothing
app.use(express.json());   // too late

// ✅ Correct order
app.use(express.json());   // parse body into req.body first
app.use(sanitizeBody);     // now req.body is populated
```

This caused signup to appear to work (201) but body data wasn't being sanitized. The bug was silent — no errors thrown.

---

## 11. How did you debug the classroom join 404 error?

**Answer:**
Backend logs showed `POST /join → 404` but the route was clearly defined in the router.

**Debugging steps:**
1. Tested with PowerShell directly → got 200 ✅ (route exists and works)
2. Concluded the bug was in routing, not the handler
3. Found the root cause: **same Express Router instance mounted twice**

```js
// ❌ Broken — same object mounted at two paths (corrupts Express 5 router state)
app.use('/api/v1/classroom', classroomRoute);
app.use('/api/classroom',    classroomRoute); // same reference!

// ✅ Fixed — remove duplicate
app.use('/api/v1/classroom', classroomRoute);
```

**Lesson:** In Express 5, a router tracks its own mount state internally. Mounting the same instance at two paths corrupts route resolution. Always create a new `express.Router()` instance if you need the same routes at two paths.

---

## 12. How do you protect against NoSQL injection?

**Answer:**
MongoDB operators like `$gt`, `$where` in request bodies can bypass authentication:

```json
// Attack: POST /signin with body:
{ "email": { "$gt": "" }, "password": { "$gt": "" } }
// MongoDB finds the first user whose email > "" — auth bypassed!
```

**My solution — custom sanitizer middleware:**
```js
// middlewares/sanitizeBody.js
const strip = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) continue; // drop $ and dot keys
    clean[key] = strip(obj[key]); // recurse
  }
  return clean;
};

export const sanitizeBody = (req, res, next) => {
  if (req.body) req.body = strip(req.body);
  next();
};
```

I couldn't use `express-mongo-sanitize` because it's incompatible with Express 5 — it tries to set `req.query` which is a read-only getter in Express 5, causing a `TypeError`.

---

## 13. What is structured logging and why did you use Winston?

**Answer:**
Instead of `console.log("User signed in")` (unstructured, hard to search), structured logging outputs JSON with consistent fields that log aggregation tools (Datadog, Splunk, CloudWatch) can query.

```js
// Without structured logging
console.log("Teacher signed in: " + email); // hard to filter/alert on

// With Winston structured logging
logger.info("Teacher signed in", { email, teacherId, ip: req.ip });
// Output: {"level":"info","message":"Teacher signed in","email":"...","teacherId":"...","timestamp":"..."}
```

**My Winston setup:**
```js
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.colorize({ all: true }) }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

**What I log:**
- Every request (method, path, status, duration) — `info`
- Cache hits/misses — `debug`
- Auth failures — `warn`
- BullMQ job start/complete/fail — `info`/`error`
- Rate limit exceeded — `warn`

---

## 14. How does rate limiting work and why are there three different limiters?

**Answer:**

```js
// Auth endpoints — 30 req/15min (prevents brute-force login)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 100, // relaxed in dev
});

// AI quiz generation — 10 req/hour (controls Gemini API cost)
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many quiz generation requests. Please wait.' },
});

// General API — 100 req/15min (general abuse prevention)
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

**Why three?** AI generation costs money (Gemini API). A single user could burn hundreds of dollars of API quota if unlimited. The auth limiter specifically targets brute-force attacks. The general limiter prevents scraping/DoS.

---

## 15. How is your MongoDB schema designed?

**Answer:**
```js
Teacher:    { firstName, lastName, email (unique), password (bcrypt hashed) }
Student:    { firstName, lastName, email (unique), password, classId → Classroom }
Classroom:  { name, code (6-char unique), teacher → Teacher, students: [→Student], quizzes: [→Quiz] }
Quiz:       { title, topic, createdBy → Teacher, scheduleAt, duration, numberOfQuestions,
              questions: [→Question], status: 'processing'|'ready'|'failed' }
Question:   { quiz → Quiz, type: 'mcq'|'one-line', questionText, options: [String], correctAnswer }
Attempt:    { student → Student, quiz → Quiz, answers: [String], score, total, submittedAt }
```

**Key decision:** Questions are a **separate collection**, not embedded in Quiz. Reasons:
- MongoDB document size limit is 16MB — a quiz with 50 detailed questions could approach it
- Can query "all MCQ questions" without loading entire quiz arrays
- Cleaner references for leaderboard (Attempt → Question)

---

## 16. What is the difference between `populate()` and `$lookup`?

**Answer:**

| | `populate()` | `$lookup` |
|---|---|---|
| Where it runs | Node.js (Mongoose) | MongoDB server |
| Round trips | 2 (find doc + find refs) | 1 (JOIN in DB) |
| Flexibility | Simple | Complex pipeline |
| Best for | Small datasets, convenience | Large datasets, performance |

```js
// populate — 2 round trips
const classroom = await Classroom.findById(id)
  .populate('students')
  .populate({ path: 'quizzes', populate: { path: 'questions' } });

// $lookup — single DB operation
const result = await Classroom.aggregate([
  { $match: { _id: new ObjectId(id) } },
  { $lookup: { from: 'students', localField: 'students', foreignField: '_id', as: 'students' } },
  { $lookup: { from: 'quizzes',  localField: 'quizzes',  foreignField: '_id', as: 'quizzes' } },
]);
```

I use `populate()` in my project for simplicity. At scale, I'd switch to `$lookup` aggregations.

---

## 17. What is the Vite proxy and why did you need it?

**Answer:**
The frontend (port 5174) and backend (port 3141) are on different ports — this is a **CORS** problem. Instead of configuring CORS for every development URL change, I proxy all `/api` requests through Vite:

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3141',
        changeOrigin: true,
        // /api/v1/teacher/signin → http://localhost:3141/api/v1/teacher/signin
      },
    },
  },
});

// config/api.js
const API_BASE_URL = isDevelopment
  ? '/api/v1'           // relative — goes through Vite proxy
  : 'https://quizgenerator-backend-vafs.onrender.com/api/v1'; // absolute in prod
```

The browser sees requests going to `localhost:5174/api/...` (same origin, no CORS), Vite silently forwards them to `localhost:3141`.

---

## 18. How do you handle async AI generation UX on the frontend?

**Answer:**
Gemini can take 10–60 seconds. I show a fake-but-honest progress bar:

```jsx
const startProgressTicker = () => {
  const id = setInterval(() => {
    setLoadingProgress(p => {
      if (p >= 90) { clearInterval(id); return p; } // never reaches 100 until real response
      return p + Math.random() * 8; // random increments feel natural
    });
  }, 800);
  return id;
};

// In handleSubmit:
const tickerId = startProgressTicker();
try {
  const res = await fetch('/api/v1/teacher/create', { method: 'POST', body: formData });
  clearInterval(tickerId);
  setLoadingProgress(100); // snap to 100% on real success
} catch (err) {
  clearInterval(tickerId);
  toast.error(parseError(err));
}
```

**Contextual messages during wait:**
```jsx
{loadingProgress < 30  ? "Connecting to Gemini AI..."  :
 loadingProgress < 60  ? "Building questions..."       :
 loadingProgress < 85  ? "Polishing answers..."         :
                         "Almost done..."}
```

---

## 19. What is your frontend error handling strategy?

**Answer:**
Every component uses a shared `parseError` function that maps HTTP status codes to plain English:

```js
// utils/auth.js
export const getFriendlyErrorMessage = (error, fallback) => {
  const status = error.response?.status;
  const data   = error.response?.data;

  if (status === 429) return 'Too many attempts. Please wait a few minutes.';
  if (status === 401) return 'Session expired. Please sign in again.';
  if (status === 404) return 'Account not found. Check your role or sign up.';
  if (status === 409) return 'An account with this email already exists.';
  if (!error.response) return 'Cannot reach server. Check your connection.';

  // Zod validation errors — array of field-level messages
  if (data?.details?.length) {
    return data.details.map(d => `• ${d.message}`).join('\n');
  }
  return data?.message || data?.error || fallback;
};
```

Multiple Zod errors → multiple toasts:
```js
const msg = getFriendlyErrorMessage(error, 'Sign up failed.');
if (msg.includes('\n')) {
  msg.split('\n').forEach(line => line && toast.error(line, { duration: 5000 }));
} else {
  toast.error(msg, { duration: 5000 });
}
```

---

## 20. How does the logout feature work?

**Answer:**
JWTs are stateless — the server has no session to invalidate. Logout clears the token from the client:

```js
// Navbar.jsx
const handleLogout = () => {
  localStorage.removeItem('teacherToken');
  localStorage.removeItem('teacherData');
  localStorage.removeItem('teacherName');
  localStorage.removeItem('studentToken');
  localStorage.removeItem('studentData');
  localStorage.removeItem('studentName');
  setUser(null);
  toast.success('Logged out successfully');
  navigate('/');
};
```

**Why no server-side logout endpoint?**
JWT is stateless by design — the server doesn't store tokens. A true server-side logout needs a **token blacklist** in Redis with TTL equal to the token's remaining lifetime. That's production-grade; for this project client-side clearing is sufficient.

**Navbar auto-detects role on every route change:**
```js
useEffect(() => {
  const teacherToken = localStorage.getItem('teacherToken');
  const studentToken = localStorage.getItem('studentToken');
  if (teacherToken) setUser({ name: localStorage.getItem('teacherName'), role: 'teacher' });
  else if (studentToken) setUser({ name: localStorage.getItem('studentName'), role: 'student' });
  else setUser(null);
}, [location.pathname]); // re-run on every navigation
```

---

## 21. What is `bcrypt` and how do you use it?

**Answer:**
bcrypt is a password hashing algorithm with a built-in **salt** and **cost factor** (work factor). It's intentionally slow — making brute-force attacks computationally expensive.

```js
// Signup — hash before saving
const hashedPassword = await bcrypt.hash(password, 10); // 10 = cost factor (~100ms)
const teacher = new Teacher({ email, password: hashedPassword });
await teacher.save();

// Signin — verify
const teacher = await Teacher.findOne({ email });
const isMatch  = await bcrypt.compare(password, teacher.password); // timing-safe comparison
if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
```

**Why not SHA256/MD5?** Those are fast (microseconds). bcrypt at cost 10 takes ~100ms — if an attacker gets the database, cracking one password takes 100ms instead of microseconds. That's 1000x slower brute force.

---

## 22. How does multer handle file uploads?

**Answer:**
Multer is an Express middleware for handling `multipart/form-data` (file uploads). It parses the file from the request and saves it to disk (or memory).

```js
// middlewares/upload.js
import multer from 'multer';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
});

// Route
router.post('/create', teacherMiddleware, upload.single('pdf'), createQuiz);

// Controller — file is at req.file.path
const dataBuffer = fs.readFileSync(req.file.path);
const pdfData    = await pdfParse(dataBuffer);
const text       = pdfData.text;
fs.unlinkSync(req.file.path); // clean up temp file immediately
```

---

## 23. How does your classroom code system work?

**Answer:**
When a teacher creates a classroom, a random 6-character alphanumeric code is generated. Students use this to join.

```js
// Generate unique code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Classroom schema — code must be unique in the DB
const classroomSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  code:     { type: String, unique: true },
  teacher:  { type: ObjectId, ref: 'Teacher' },
  students: [{ type: ObjectId, ref: 'Student' }],
  quizzes:  [{ type: ObjectId, ref: 'Quiz' }],
});

// Student join
router.post('/join', studentMiddleware, async (req, res) => {
  const { code } = req.body;
  const classroom = await Classroom.findOne({ code });
  if (!classroom) return res.status(404).json({ error: 'Classroom not found' });

  if (!classroom.students.includes(req.studentId)) {
    classroom.students.push(req.studentId);
    await classroom.save();
  }
  res.json({ message: 'Joined classroom', classroom });
});
```

---

## 24. What would a token blacklist look like for production logout?

**Answer:**
On logout, store the token's JTI (JWT ID) in Redis with TTL = token's remaining lifetime. On every request, check if the token is blacklisted.

```js
// Add JTI to every token at sign time
const token = jwt.sign(
  { teacherId: teacher._id, jti: crypto.randomUUID() },
  process.env.JWT_TEACHER_PASSWORD,
  { expiresIn: '7d' }
);

// Logout endpoint — blacklist the token
router.post('/logout', teacherMiddleware, async (req, res) => {
  const token   = req.headers.authorization.split(' ')[1];
  const decoded = jwt.decode(token);
  const ttl     = decoded.exp - Math.floor(Date.now() / 1000); // remaining seconds
  await redis.setex(`blacklist:${decoded.jti}`, ttl, '1');
  res.json({ message: 'Logged out' });
});

// Middleware — check blacklist
const isBlacklisted = await redis.exists(`blacklist:${decoded.jti}`);
if (isBlacklisted) return res.status(401).json({ error: 'Token has been revoked' });
```

This is what I'd add for production. Current implementation uses client-side clearing (simpler, appropriate for this scale).

---

## 25. What would you add next to make this production-ready?

**Answer:**
1. **Token blacklist** (Redis, as above) — true server-side logout
2. **Email verification** — OTP/link on signup before granting access
3. **WebSockets (Socket.io)** — real-time quiz start notification instead of polling
4. **Leaderboard** — aggregate Attempt scores per quiz, sorted by score
5. **Frontend polling for async quiz status** — after 202, poll `/quiz/:id/status` every 3s
6. **Horizontal scaling** — move all cache to Redis (in-memory cache doesn't share across pods)
7. **Docker + CI/CD** — containerise, add GitHub Actions for deploy-on-push
8. **Observability** — Prometheus metrics + Grafana dashboard (API latency, cache hit ratio, error rate, queue depth)
9. **Sliding-window chunking** — overlap chunks to avoid cutting sentences at boundaries
10. **PDF size validation** — reject PDFs that produce >200 chunks (embedding cost guardrail)
