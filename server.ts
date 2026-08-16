import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { verifyToken, createClerkClient } from '@clerk/express';
import { ConvexHttpClient } from 'convex/browser';

dotenv.config({ quiet: true });
dotenv.config({ path: '.env.local', quiet: true });

const DEFAULT_ADMIN_EMAILS = [
  'reddysantosh1310@gmail.com',
  'suchandramanne@gmail.com',
];

const ADMIN_EMAILS = Array.from(
  new Set([
    ...DEFAULT_ADMIN_EMAILS,
    ...(
      process.env.ADMIN_EMAILS ||
      process.env.ADMIN_EMAIL ||
      process.env.VITE_ADMIN_EMAILS ||
      process.env.VITE_ADMIN_EMAIL ||
      ''
    )
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean),
  ])
);

function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// ─── Streamlined AI Engine (Gemini Primary + OpenRouter Fallback) ────────────

interface NormalizedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function normalizeMessages(raw?: any[] | string, system?: string): NormalizedMessage[] {
  const msgs: NormalizedMessage[] = system ? [{ role: 'system', content: system }] : [];
  if (!raw) return msgs;
  const list = Array.isArray(raw) ? raw : [raw];
  for (const m of list) {
    if (!m) continue;
    if (typeof m === 'string') { msgs.push({ role: 'user', content: m }); continue; }
    const role = (m.role === 'assistant' || m.role === 'model') ? 'assistant' : (m.role === 'system' ? 'system' : 'user');
    const content = typeof m.content === 'string' ? m.content : (typeof m.text === 'string' ? m.text : '');
    if (content.trim()) msgs.push({ role, content: content.trim() });
  }
  return msgs;
}

async function callGeminiDirect(opts: {
  system?: string;
  messages: NormalizedMessage[];
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured');

  const models = [
    process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
  ];

  const systemMsg = opts.system || opts.messages.find((m) => m.role === 'system')?.content;
  const systemInstruction = systemMsg ? { parts: [{ text: systemMsg }] } : undefined;

  const contents = opts.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  let lastErr: any = null;
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({
            contents,
            ...(systemInstruction ? { systemInstruction } : {}),
            generationConfig: {
              temperature: opts.temperature ?? 0.7,
              ...(opts.jsonMode ? { responseMimeType: 'application/json' } : {}),
            },
          }),
        }
      );

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Gemini ${model} HTTP ${res.status}: ${body.slice(0, 150)}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(`Gemini ${model} returned empty content`);
      return text;
    } catch (err: any) {
      lastErr = err;
      console.warn(`[AI Engine] Gemini ${model} failed:`, err.message);
    }
  }

  throw lastErr || new Error('Gemini generation failed');
}

async function callOpenRouterDirect(opts: {
  system?: string;
  messages: NormalizedMessage[];
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not configured');

  const models = [
    process.env.OPENROUTER_MODEL || 'openrouter/free',
    'openrouter/free',
    'google/gemini-2.0-flash-lite-preview-02-05:free',
    'meta-llama/llama-3.3-70b-instruct',
  ];

  let lastErr: any = null;
  for (const model of models) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          model,
          messages: opts.messages,
          temperature: opts.temperature ?? 0.7,
          ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`OpenRouter ${model} HTTP ${res.status}: ${body.slice(0, 150)}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error(`OpenRouter ${model} returned empty content`);
      return text;
    } catch (err: any) {
      lastErr = err;
      console.warn(`[AI Engine] OpenRouter ${model} failed:`, err.message);
    }
  }

  throw lastErr || new Error('OpenRouter generation failed');
}

async function generateAIWithFallback(opts: {
  system?: string;
  messages?: any[];
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const normalized = normalizeMessages(opts.messages, opts.system);
  if (normalized.length === 0) {
    throw new Error('No valid messages provided for AI generation');
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    try {
      return await callGeminiDirect({
        system: opts.system,
        messages: normalized,
        temperature: opts.temperature,
        jsonMode: opts.jsonMode,
      });
    } catch (geminiErr: any) {
      console.warn('[AI Engine] Primary Gemini failed, attempting OpenRouter fallback:', geminiErr.message);
    }
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  if (openrouterKey) {
    try {
      return await callOpenRouterDirect({
        system: opts.system,
        messages: normalized,
        temperature: opts.temperature,
        jsonMode: opts.jsonMode,
      });
    } catch (openRouterErr: any) {
      console.warn('[AI Engine] OpenRouter fallback failed:', openRouterErr.message);
      throw openRouterErr;
    }
  }

  throw new Error('No AI provider keys configured (GEMINI_API_KEY or OPENROUTER_API_KEY).');
}

import { APP_VERSION, EVALUATOR_VERSION, RUBRIC_VERSION } from './src/lib/constants';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();

function createRateLimiter(maxRequests: number, windowMs: number = 60000) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    let bucket = rateLimitMap.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + windowMs };
      rateLimitMap.set(key, bucket);
    } else {
      bucket.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - bucket.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));

    if (bucket.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment before trying again.',
        category: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
      });
    }

    next();
  };
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // ─── Request Correlation & Structured Logging Middleware ──────────────────
  app.use((req, res, next) => {
    const reqId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    res.setHeader('x-request-id', reqId);
    (req as any).id = reqId;

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (!req.path.startsWith('/assets') && !req.path.endsWith('.js') && !req.path.endsWith('.css') && !req.path.endsWith('.png')) {
        console.log(JSON.stringify({
          type: 'HTTP_ACCESS',
          requestId: reqId,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: duration,
          timestamp: new Date().toISOString(),
        }));
      }
    });
    next();
  });

  // ─── System Health Endpoint (Liveness Check) ───────────────────────────────
  app.get(['/api/health', '/health'], (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'kriora-lms-api',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id || 'liveness-check',
    });
  });

  // ─── System Readiness Endpoint (Configuration & Dependency Check) ───────────
  app.get(['/api/readiness', '/readiness'], (req, res) => {
    const hasConvex = !!(process.env.VITE_CONVEX_URL || process.env.CONVEX_URL);
    const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
    const hasOpenRouter = !!(process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY);
    const hasClerk = !!process.env.CLERK_SECRET_KEY;

    const isReady = hasConvex;
    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      status: isReady ? 'ready' : 'degraded',
      service: 'kriora-lms-api',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id || 'readiness-check',
      dependencies: {
        convexConfigured: hasConvex,
        aiConfigured: hasGemini || hasOpenRouter,
        geminiConfigured: hasGemini,
        openRouterConfigured: hasOpenRouter,
        clerkConfigured: hasClerk,
      },
    });
  });

  // ─── AI Chat: Student Tutor (Throttled & Bounded) ──────────────────────────
  app.post(['/api/chat', '/chat'], createRateLimiter(30), async (req, res) => {
    try {
      await verifyUserSession(req);

      const { message, systemInstruction, history } = req.body || {};
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Valid message string is required.' });
      }
      if (message.length > 4000) {
        return res.status(400).json({ error: 'Message exceeds maximum allowable length (4000 characters).' });
      }

      const safeHistory = Array.isArray(history) ? history.slice(-12) : [];
      const allMsgs = [...safeHistory, { role: 'user', content: message.trim() }];

      const text = await generateAIWithFallback({
        system: (typeof systemInstruction === 'string' && systemInstruction.trim())
          ? systemInstruction.slice(0, 2000)
          : 'You are a helpful and patient Python programming tutor for Kriora LMS. Keep explanations clear, encouraging, and focused on learning.',
        messages: allMsgs,
      });

      res.json({ text, status: 'success' });
    } catch (err: any) {
      console.error('[Chat API Error]:', err?.message || 'Chat generation failed');
      const statusCode = err?.message?.includes('Unauthorized') || err?.message?.includes('not configured') ? 401 : (err?.message?.includes('Forbidden') ? 403 : 500);
      res.status(statusCode).json({
        error: statusCode === 500
          ? 'AI Study Companion is temporarily unavailable. Please try again in a moment.'
          : (err?.message || 'Unauthorized'),
        category: statusCode === 500 ? 'AI_SERVICE_UNAVAILABLE' : 'AUTH_ERROR',
      });
    }
  });

  // ─── AI Chat: Admin Assistant (Protected & Throttled) ───────────────────────
  app.post(['/api/admin/chat', '/admin/chat'], createRateLimiter(15), async (req, res) => {
    try {
      await verifyAdmin(req);

      const { message, prompt, history } = req.body || {};
      const userText = (typeof message === 'string' && message.trim()) || (typeof prompt === 'string' && prompt.trim());
      if (!userText) return res.status(400).json({ error: 'Message required.' });
      if (userText.length > 4000) {
        return res.status(400).json({ error: 'Prompt exceeds maximum allowable length (4000 characters).' });
      }

      const system = `You are the Kriora LMS Admin Assistant.
Help the administrator draft announcements, summarize student performance, and plan curriculum topics.
Provide polished, professional copy ready to publish. Refer to the platform as Kriora LMS.
Always note that administrative publishing actions require explicit confirmation.`;

      const safeHistory = Array.isArray(history) ? history.slice(-12) : [];
      const allMsgs = [...safeHistory, { role: 'user', content: userText }];

      const text = await generateAIWithFallback({
        system,
        messages: allMsgs,
        temperature: 0.7,
      });

      res.json({ success: true, text, reply: text });
    } catch (err: any) {
      console.error('[Admin Chat API Error]:', err?.message || 'Admin chat failed');
      const statusCode = err?.message?.includes('Unauthorized') ? 401 : (err?.message?.includes('Forbidden') ? 403 : 500);
      res.status(statusCode).json({
        success: false,
        error: err?.message || 'Admin Assistant is temporarily unavailable.',
        category: statusCode === 500 ? 'AI_SERVICE_UNAVAILABLE' : 'AUTH_ERROR',
      });
    }
  });

  // ─── Student Assessment Evaluation (AI Marks & Feedback) ───────────────────
  app.post(['/api/lms/evaluate-test', '/lms/evaluate-test', '/evaluate-test'], createRateLimiter(20), async (req, res) => {
    try {
      const session = await verifyUserSession(req);

      const {
        code,
        dayNumber,
        dayTitle,
        taskDescription,
        testCases,
        maxScore = 10,
        testType = 'daily',
        submissionRequestId,
      } = req.body || {};

      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ error: 'Valid Python code string is required for assessment evaluation.' });
      }
      if (code.length > 10000) {
        return res.status(400).json({ error: 'Submitted code exceeds maximum length limit (10,000 characters).' });
      }

      const sanitizedDayNumber = typeof dayNumber === 'number' ? dayNumber : (Number(dayNumber) || 1);
      await authorizeEvaluator(req, session, sanitizedDayNumber);

      const sanitizedMaxScore = typeof maxScore === 'number' && maxScore > 0 ? Math.min(maxScore, 100) : 10;
      const evalTimestamp = new Date().toISOString();

      const prompt = `You are an expert Python programming instructor and evaluator for Kriora LMS.
Evaluate the student's Python code submission fairly, accurately, and thoroughly.

ASSESSMENT CONTEXT:
- Test Type: ${testType}
- Day Number: ${sanitizedDayNumber}
- Topic/Day Title: ${dayTitle ?? 'Python Assessment'}
- Task / Problem Description: ${taskDescription || 'Python Daily Coding Assessment'}
- Deterministic Reference Cases (if any): ${JSON.stringify(testCases || [])}
- Max Possible Marks: ${sanitizedMaxScore}

STUDENT'S SUBMITTED PYTHON CODE:
\`\`\`python
${code.slice(0, 8000)}
\`\`\`

EVALUATION RULES:
1. Syntax & Execution: Check for valid Python syntax, proper indentation, and runnability.
2. Correctness: Verify if the solution fulfills the required tasks and logic.
3. Scoring: Award fair marks between 0 and ${sanitizedMaxScore}.
4. Percentage: Calculate percentage integer between 0 and 100 based on score / maxScore.
5. Feedback: Write 2-3 encouraging, constructive sentences explaining what worked well and specific tips for improvement.

Return a valid JSON object ONLY:
{
  "score": <number between 0 and ${sanitizedMaxScore}>,
  "percentage": <integer between 0 and 100>,
  "passedTests": <integer number of passed criteria>,
  "failedTests": <integer number of failed criteria>,
  "feedback": "<constructive feedback string>",
  "evalResults": [
    {
      "input": "<criterion or scenario tested>",
      "expected": "<expected behavior>",
      "actual": "<student's code behavior>",
      "pass": <boolean true or false>
    }
  ]
}`;

      const rawResponse = await generateAIWithFallback({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        jsonMode: true,
      });

      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI evaluation did not return valid JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const score = typeof parsed.score === 'number'
        ? Math.min(Math.max(0, Math.round(parsed.score * 10) / 10), sanitizedMaxScore)
        : Math.round(sanitizedMaxScore * 0.8);
      const percentage = typeof parsed.percentage === 'number'
        ? Math.min(Math.max(0, Math.round(parsed.percentage)), 100)
        : Math.min(100, Math.round((score / sanitizedMaxScore) * 100));
      const passedTests = typeof parsed.passedTests === 'number'
        ? Math.max(0, parsed.passedTests)
        : (percentage >= 70 ? 1 : 0);
      const failedTests = typeof parsed.failedTests === 'number'
        ? Math.max(0, parsed.failedTests)
        : (percentage >= 70 ? 0 : 1);
      const feedback = typeof parsed.feedback === 'string' && parsed.feedback.trim()
        ? parsed.feedback.trim().slice(0, 1000)
        : `${passedTests} requirement(s) passed (${percentage}%).`;
      const evalResults = Array.isArray(parsed.evalResults) && parsed.evalResults.length > 0
        ? parsed.evalResults
        : [
            {
              input: 'Solution Validation',
              expected: 'Working Python code fulfilling assessment objectives',
              actual: percentage >= 70 ? 'Passed evaluation criteria' : 'Requires revision',
              pass: percentage >= 70,
            },
          ];

      res.json({
        success: true,
        score,
        maxScore: sanitizedMaxScore,
        percentage,
        passedTests,
        failedTests,
        feedback,
        evalResults,
        evalStatus: 'auto',
        graderMode: 'ai-assisted',
        graderVersion: EVALUATOR_VERSION,
        rubricVersion: RUBRIC_VERSION,
        evalTimestamp,
        submissionRequestId,
      });
    } catch (err: any) {
      console.error('[Assessment Evaluation API Error]:', err?.message || 'Evaluation error');
      const statusCode = err?.message?.includes('Unauthorized') || err?.message?.includes('not configured') ? 401 : (err?.message?.includes('Forbidden') ? 403 : 500);
      res.status(statusCode).json({
        success: false,
        error: statusCode === 500
          ? 'Assessment evaluation service is temporarily busy. Please retry.'
          : (err?.message || 'Unauthorized'),
        category: statusCode === 500 ? 'EVALUATION_SERVICE_ERROR' : 'AUTH_ERROR',
      });
    }
  });



  function devAuthBypassEnabled(): boolean {
    if (process.env.VERCEL === '1' || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME) return false;
    return process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_AUTH_BYPASS === 'true';
  }

  async function verifyUserSession(req: express.Request): Promise<{ userId: string; email?: string; role?: string }> {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const secret = process.env.CLERK_SECRET_KEY;
    if (!secret) {
      if (devAuthBypassEnabled()) {
        return { userId: 'local-dev-user', role: 'development' };
      }
      throw new Error('Server authentication is not configured');
    }
    if (!token) {
      throw new Error('Unauthorized: Clerk session token required');
    }
    try {
      const claims = await verifyToken(token, { secretKey: secret });
      const email = typeof claims?.email === 'string' ? claims.email : undefined;
      const role = (claims as any)?.role || (claims as any)?.publicMetadata?.role || undefined;
      return { userId: claims.sub || 'authenticated-user', email, role };
    } catch {
      throw new Error('Unauthorized: Invalid or expired session token');
    }
  }

  async function verifyAdmin(req: express.Request): Promise<string> {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const secret = process.env.CLERK_SECRET_KEY;
    if (!token || !secret) throw new Error('Unauthorized: Clerk session required');
    let claims: any;
    try {
      claims = await verifyToken(token, { secretKey: secret });
    } catch {
      throw new Error('Unauthorized: Invalid or expired session');
    }
    let email = typeof claims?.email === 'string' ? claims.email : '';
    const role = claims?.role || claims?.publicMetadata?.role;
    if (role === 'admin') {
      return email || claims?.sub || 'admin';
    }
    if (!email && claims?.sub) {
      try {
        const user = await createClerkClient({ secretKey: secret }).users.getUser(claims.sub);
        email = user.emailAddresses?.[0]?.emailAddress || '';
        if ((user.publicMetadata as any)?.role === 'admin') {
          return email || claims.sub;
        }
      } catch { /* fall through */ }
    }
    if (!email || !isAdminEmail(email)) throw new Error('Forbidden: Access restricted to LMS Administrators');
    return email.trim().toLowerCase();
  }

  // Caller may run AI evaluation only if they are a verified admin or an enrolled student
  // with access to the requested curriculum day. Identity comes from the verified session,
  // never from client-supplied fields.
  async function authorizeEvaluator(
    req: express.Request,
    session: { userId: string; email?: string; role?: string },
    dayNumber: number
  ): Promise<void> {
    if (session.role === 'development') return;
    if (session.email && isAdminEmail(session.email)) return;

    const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
    if (!CONVEX_URL || !session.email) {
      throw new Error('Forbidden: Assessment evaluation requires a verified student or admin account');
    }
    try {
      const client: any = new ConvexHttpClient(CONVEX_URL);
      const studentCtx: any = await client.query('lms:getMyStudentContext', { actorEmail: session.email, serverSecret: process.env.CONVEX_SERVER_SECRET });
      const student = studentCtx?.student;
      if (!student) {
        throw new Error('Forbidden: Assessment evaluation requires a verified student or admin account');
      }

      const meta: any = await client.query('lms:getCourseMetadata', { courseId: 'python-mastery', actorEmail: session.email, serverSecret: process.env.CONVEX_SERVER_SECRET });
      const day = (meta?.course?.modules || [])
        .flatMap((m: any) => m.days || [])
        .find((d: any) => d.dayNumber === dayNumber);
      if (!day) throw new Error('Forbidden: Day not released');
      if (day.releaseStatus !== 'locked') return;

      if (!student.batchId) throw new Error('Forbidden: Day not released');
      const grants = Array.isArray(studentCtx?.dayAccessGrants) ? studentCtx.dayAccessGrants : [];
      const granted = grants.some((g: any) => g.dayId === day.id);
      if (!granted) throw new Error('Forbidden: Day not released to your batch');
    } catch (err: any) {
      if (err?.message?.includes('Forbidden')) throw err;
      throw new Error('Forbidden: Assessment evaluation requires a verified student or admin account');
    }
  }

  // ─── Gemini Course Content Generation (Admin Only) ─────────────────────────

  function validateAndMerge(generated: any, expectedTopics: any[], existing: any, day: any) {
    const topics = Array.isArray(generated.topics) ? generated.topics : null;
    if (!topics) throw new Error('Generated content is missing the "topics" array.');
    if (topics.length !== expectedTopics.length) {
      throw new Error(`Topic count mismatch: expected ${expectedTopics.length}, got ${topics.length}. Content was NOT saved.`);
    }
    const mergedTopics = topics.map((t: any, i: number) => {
      const exp = expectedTopics[i];
      if (!exp || t?.id !== exp.id || t?.title !== exp.title) {
        throw new Error(`Topic ${i + 1} does not match the curriculum (expected "${exp?.id} / ${exp?.title}"). Content was NOT saved.`);
      }
      const theoryContent = typeof t.theoryContent === 'string' ? t.theoryContent.trim() : '';
      if (!theoryContent) throw new Error(`Topic "${exp.title}" has empty theory content. Content was NOT saved.`);
      const codeExamples = Array.isArray(t.codeExamples)
        ? t.codeExamples
            .filter((c: any) => c && typeof c.code === 'string' && c.code.trim())
            .map((c: any, ci: number) => ({
              id: `${exp.id}-code-${ci + 1}`,
              title: typeof c.title === 'string' && c.title.trim() ? c.title : `Example ${ci + 1}`,
              language: 'python',
              code: c.code,
              explanation: typeof c.explanation === 'string' && c.explanation.trim() ? c.explanation : undefined,
            }))
        : [];
      return { id: exp.id, dayId: day.id, order: i + 1, title: exp.title, theoryContent, codeExamples };
    });

    const commonMistakes = Array.isArray(generated.commonMistakes)
      ? generated.commonMistakes.filter((s: any) => typeof s === 'string' && s.trim()).map((s: any) => s.trim())
      : [];
    const practice = Array.isArray(generated.practice)
      ? generated.practice
          .filter((p: any) => p && typeof p.question === 'string' && p.question.trim())
          .map((p: any) => ({ question: p.question.trim(), hints: Array.isArray(p.hints) ? p.hints : undefined }))
      : [];
    const w = generated.workedExample && typeof generated.workedExample === 'object' ? generated.workedExample : {};
    const workedExample = {
      title: typeof w.title === 'string' && w.title.trim() ? w.title : `Day ${day.dayNumber} — ${day.title} Case Implementation`,
      caseStudy: typeof w.caseStudy === 'string' ? w.caseStudy : '',
      entities: Array.isArray(w.entities) ? w.entities.map(String) : [],
      data: Array.isArray(w.data) ? w.data.map(String) : [],
      operations: Array.isArray(w.operations) ? w.operations.map(String) : [],
      algorithm: Array.isArray(w.algorithm) ? w.algorithm.map(String) : [],
      pseudocode: Array.isArray(w.pseudocode) ? w.pseudocode.map(String) : [],
      code: typeof w.code === 'string' ? w.code : '',
      codeExplanation: typeof w.codeExplanation === 'string' ? w.codeExplanation : '',
      variations: Array.isArray(w.variations) ? w.variations.map(String) : [],
    };
    if (!workedExample.code.trim()) throw new Error('Worked example must include executable Python code. Content was NOT saved.');

    const objectives = Array.isArray(existing.objectives) && existing.objectives.length > 0
      ? existing.objectives
      : Array.isArray(generated.objectives)
        ? generated.objectives.filter((s: any) => typeof s === 'string' && s.trim()).map((s: any) => s.trim())
        : [];

    return {
      ...existing,
      phase: existing.phase || (generated.phase && typeof generated.phase === 'string' ? generated.phase : ''),
      opening: existing.opening || (typeof generated.opening === 'string' ? generated.opening : ''),
      objectives,
      topics: mergedTopics,
      commonMistakes,
      workedExample,
      practice,
      marks: existing.marks ?? 10,
      performanceReport: existing.performanceReport || 'Scored out of 10 on the personalized daily test.',
    };
  }

  app.post('/api/lms/generate-day-content', async (req, res) => {
    try {
      const adminEmail = await verifyAdmin(req);
      const { dayId } = req.body || {};
      if (!dayId) return res.status(400).json({ error: 'dayId is required.' });

      const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
      if (!CONVEX_URL) return res.status(500).json({ error: 'CONVEX_URL is not configured.' });
      const client: any = new ConvexHttpClient(CONVEX_URL);

      const meta: any = await client.query('lms:getCourseMetadata', { actorEmail: adminEmail, courseId: 'python-mastery', serverSecret: process.env.CONVEX_SERVER_SECRET });
      const modules = meta?.course?.modules || [];
      const allDays = modules.flatMap((m: any) => m.days || []);
      const day = allDays.find((d: any) => d.id === dayId);
      if (!day) return res.status(404).json({ error: `Day "${dayId}" was not found in the curriculum.` });

      const expectedTopics = (day.topics || [])
        .map((t: any) => ({ id: t.id, order: t.order, title: t.title }))
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      if (expectedTopics.length === 0) return res.status(400).json({ error: 'This day has no topics in the curriculum.' });

      const existing = (await client.query('lms:getDayContent', { actorEmail: adminEmail, dayId, serverSecret: process.env.CONVEX_SERVER_SECRET })) || {};
      const parentModule = modules.find((m: any) => m.id === day.moduleId);
      const phase = existing.phase || parentModule?.title || '';

      const topicList = expectedTopics.map((t: any) => `${t.order}. ${t.title}`).join('\n');
      const objectiveList = Array.isArray(existing.objectives) && existing.objectives.length > 0
        ? existing.objectives.map((o: any) => `- ${o}`).join('\n')
        : '(not provided; craft 4-6 clear learning objectives yourself)';

      const prompt = `You are the content author for a beginner Python course (Python Mastery). Write detailed, beginner-friendly lesson content for exactly ONE course day. You must NOT add, remove, rename, or reorder topics beyond the curriculum below.

DAY: Day ${day.dayNumber} — ${day.title}
PHASE: ${phase || 'Core Python'}
LEARNING OBJECTIVES (keep verbatim in your output):
${objectiveList}

CURRICULUM TOPICS FOR THIS DAY (in order):
${topicList}

For EVERY topic provide:
- theoryContent: a rich explanation (4-8 short paragraphs of plain text). Plain text, blank lines between paragraphs.
- codeExamples: 2-4 small, valid, beginner-friendly Python examples, each { title, code, explanation }.

Also provide the day-level sections:
- commonMistakes: 5-8 short beginner mistakes.
- workedExample: one complete real-world mini project { title, caseStudy, entities[], data[], operations[], algorithm[], pseudocode[], code, codeExplanation, variations[] }.
- practice: 4-5 tasks, each { question, hints[] }.
- opening: one engaging paragraph starting with "Today we are learning".

Return ONLY a JSON object with this exact shape:
{
  "opening": "...",
  "objectives": ["..."],
  "topics": [
    { "id": "${expectedTopics[0].id}", "order": 1, "title": "${expectedTopics[0].title}", "theoryContent": "...", "codeExamples": [{ "title": "...", "code": "...", "explanation": "..." }] }
  ],
  "commonMistakes": ["..."],
  "workedExample": { "title": "...", "caseStudy": "...", "entities": [], "data": [], "operations": [], "algorithm": [], "pseudocode": [], "code": "...", "codeExplanation": "...", "variations": [] },
  "practice": [{ "question": "...", "hints": [] }]
}`;

      const rawResponse = await generateAIWithFallback({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        jsonMode: true,
      });
      const match = rawResponse.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('AI content generation response was not valid JSON.');
      const generated = JSON.parse(match[0]);

      const content = validateAndMerge(generated, expectedTopics, existing, day);
      await client.mutation('lms:saveDayContent', { actorEmail: adminEmail, dayId, courseId: day.courseId || 'python-mastery', content, serverSecret: process.env.CONVEX_SERVER_SECRET });

      res.json({ success: true, dayId, content });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Generation failed.' });
    }
  });

  return app;
}

export const app = createApp();

export async function startServer() {
  const serverApp = createApp();

  // ─── Vite Dev Server / Static Asset Serving ───────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    serverApp.use(vite.middlewares);
  } else {
    serverApp.use(express.static(path.join(process.cwd(), 'dist')));
    serverApp.get('*', (_req, response) => {
      response.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  serverApp.listen(PORT, () => {
    console.log('Kriora LMS API running on http://localhost:' + PORT);
  });
}

// Check if this script was directly invoked from CLI (e.g. `tsx server.ts` or `node dist/server.cjs`)
const isDirectExecution = (() => {
  if (process.env.STANDALONE === '1') return true;
  if (process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION) return false;
  const entry = process.argv[1];
  if (!entry) return false;
  const normalized = entry.replace(/\\/g, '/');
  return normalized.endsWith('/server.ts') || normalized.endsWith('/server.cjs') || normalized.endsWith('/server.js');
})();

if (isDirectExecution) {
  startServer().catch(console.error);
}


