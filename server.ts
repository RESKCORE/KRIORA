import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { verifyToken, createClerkClient } from '@clerk/express';
import { ConvexHttpClient } from 'convex/browser';

dotenv.config();
dotenv.config({ path: '.env.local' });

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  process.env.ADMIN_EMAIL ||
  process.env.VITE_ADMIN_EMAILS ||
  process.env.VITE_ADMIN_EMAIL ||
  ''
)
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

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
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured');

  const models = [
    process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-1.5-flash',
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
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not configured');

  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

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
    throw new Error(`OpenRouter HTTP ${res.status}: ${body.slice(0, 150)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter returned empty content');
  return text;
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

  if (process.env.GEMINI_API_KEY) {
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

  if (process.env.OPENROUTER_API_KEY) {
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

export function createApp() {
  const app = express();
  app.use(express.json());

  // ─── System Health Endpoint ────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({
      ai: !!(process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY),
      gemini: !!process.env.GEMINI_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      convex: !!(process.env.VITE_CONVEX_URL || process.env.CONVEX_URL),
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  console.log("=================================================");
  console.log("KRIORA LMS — STREAMLINED BACKEND GATEWAY");
  console.log("AI Engine: Google Gemini + OpenRouter Fallback Active");
  console.log("Database: Convex Serverless Cloud");
  console.log("=================================================");

  // ─── AI Chat: Student Tutor ────────────────────────────────────────────────
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, systemInstruction, history } = req.body;
      if (!message) return res.status(400).json({ error: 'Message required.' });
      
      const allMsgs = [...(history || []), { role: 'user', content: message }];
      const text = await generateAIWithFallback({
        system: systemInstruction || 'You are a helpful and patient Python programming tutor for Kriora LMS. Keep explanations clear, encouraging, and focused on learning.',
        messages: allMsgs,
      });
      res.json({ text });
    } catch (err: any) {
      console.error('[Chat API Error]:', err);
      res.status(500).json({ error: err.message || 'AI Chat failed.' });
    }
  });

  // ─── AI Chat: Admin Assistant (Draft Announcements & Lesson Content) ────────
  app.post('/api/admin/chat', async (req, res) => {
    try {
      const { message, prompt, history } = req.body;
      const userText = message || prompt;
      if (!userText) return res.status(400).json({ error: 'Message required.' });
      
      const system = `You are the Kriora LMS Admin Assistant.
Help the administrator draft announcements, summarize student performance, and plan curriculum topics.
Provide polished, professional copy ready to publish. Refer to the platform as Kriora LMS.`;

      const allMsgs = [...(history || []), { role: 'user', content: userText }];
      const text = await generateAIWithFallback({
        system,
        messages: allMsgs,
        temperature: 0.7,
      });

      res.json({ success: true, text, reply: text });
    } catch (err: any) {
      console.error('[Admin Chat API Error]:', err);
      res.status(500).json({ success: false, error: err.message || 'Admin assistant failed.' });
    }
  });

  // ─── Student Assessment Evaluation (AI Marks & Feedback) ───────────────────
  app.post('/api/lms/evaluate-test', async (req, res) => {
    try {
      const {
        code,
        dayNumber,
        dayTitle,
        taskDescription,
        testCases,
        maxScore = 10,
        testType = 'daily',
      } = req.body;

      if (!code || !code.trim()) {
        return res.status(400).json({ error: 'Code is required for assessment evaluation.' });
      }

      const prompt = `You are an expert Python programming instructor and evaluator for Kriora LMS.
Evaluate the student's Python code submission fairly, accurately, and thoroughly.

ASSESSMENT CONTEXT:
- Test Type: ${testType}
- Day Number: ${dayNumber ?? 'N/A'}
- Topic/Day Title: ${dayTitle ?? 'Python Assessment'}
- Task / Problem Description: ${taskDescription || 'Python Daily Coding Assessment'}
- Deterministic Reference Cases (if any): ${JSON.stringify(testCases || [])}
- Max Possible Marks: ${maxScore}

STUDENT'S SUBMITTED PYTHON CODE:
\`\`\`python
${code}
\`\`\`

EVALUATION RULES:
1. Syntax & Execution: Check for valid Python syntax, proper indentation, and runnability.
2. Correctness: Verify if the solution fulfills the required tasks and logic.
3. Scoring: Award fair marks between 0 and ${maxScore}.
4. Percentage: Calculate percentage integer between 0 and 100 based on score / maxScore.
5. Feedback: Write 2-3 encouraging, constructive sentences explaining what worked well and specific tips for improvement.

Return a valid JSON object ONLY:
{
  "score": <number between 0 and ${maxScore}>,
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
        ? Math.min(Math.max(0, Math.round(parsed.score * 10) / 10), maxScore)
        : Math.round(maxScore * 0.8);
      const percentage = typeof parsed.percentage === 'number'
        ? Math.min(Math.max(0, Math.round(parsed.percentage)), 100)
        : Math.round((score / maxScore) * 100);
      const passedTests = typeof parsed.passedTests === 'number'
        ? parsed.passedTests
        : (percentage >= 70 ? 1 : 0);
      const failedTests = typeof parsed.failedTests === 'number'
        ? parsed.failedTests
        : (percentage >= 70 ? 0 : 1);
      const feedback = typeof parsed.feedback === 'string' && parsed.feedback.trim()
        ? parsed.feedback.trim()
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
        maxScore,
        percentage,
        passedTests,
        failedTests,
        feedback,
        evalResults,
        evalStatus: 'auto',
      });
    } catch (err: any) {
      console.error('[Assessment Evaluation API Error]:', err);
      res.status(500).json({ success: false, error: err.message || 'Evaluation failed.' });
    }
  });



  // ─── Gemini Course Content Generation (Admin Only) ─────────────────────────
  async function verifyAdmin(req: express.Request): Promise<string> {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const secret = process.env.CLERK_SECRET_KEY;
    if (!token || !secret) throw new Error('Unauthorized: Clerk session required');
    let claims: any;
    try {
      claims = await verifyToken(token, { secretKey: secret });
    } catch {
      throw new Error('Unauthorized: invalid or expired session');
    }
    let email = typeof claims?.email === 'string' ? claims.email : '';
    if (!email && claims?.sub) {
      try {
        const user = await createClerkClient({ secretKey: secret }).users.getUser(claims.sub);
        email = user.emailAddresses?.[0]?.emailAddress || '';
      } catch { /* fall through */ }
    }
    if (!email || !isAdminEmail(email)) throw new Error('Forbidden: admins only');
    return email.trim().toLowerCase();
  }

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

      const meta: any = await client.query('lms:getCourseMetadata', { actorEmail: adminEmail, courseId: 'python-mastery' });
      const modules = meta?.course?.modules || [];
      const allDays = modules.flatMap((m: any) => m.days || []);
      const day = allDays.find((d: any) => d.id === dayId);
      if (!day) return res.status(404).json({ error: `Day "${dayId}" was not found in the curriculum.` });

      const expectedTopics = (day.topics || [])
        .map((t: any) => ({ id: t.id, order: t.order, title: t.title }))
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      if (expectedTopics.length === 0) return res.status(400).json({ error: 'This day has no topics in the curriculum.' });

      const existing = (await client.query('lms:getDayContent', { actorEmail: adminEmail, dayId })) || {};
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
      await client.mutation('lms:saveDayContent', { actorEmail: adminEmail, dayId, courseId: day.courseId || 'python-mastery', content });

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

// Automatically start standalone server if not running inside Vercel serverless environment
if (process.env.VERCEL !== '1') {
  startServer().catch(console.error);
}

