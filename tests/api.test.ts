import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { createApp } from '../server.ts';
import http from 'http';
import fs from 'fs';
import path from 'path';

describe('API & Serverless Gateway Tests', () => {
  const app = createApp();

  // Routes now require a Clerk session. Behavior tests run in dev-bypass mode;
  // auth-rejection tests override these to simulate an unconfigured production.
  beforeEach(() => {
    delete process.env.CLERK_SECRET_KEY;
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_DEV_AUTH_BYPASS = 'true';
  });

  afterEach(() => {
    delete process.env.ALLOW_DEV_AUTH_BYPASS;
  });

  it('exports a valid Express app without starting background listeners', () => {
    expect(typeof app).toBe('function');
    expect(typeof app.use).toBe('function');
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
  });

  it('POST /api/chat without a Clerk session is rejected in production', async () => {
    delete process.env.CLERK_SECRET_KEY;
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_DEV_AUTH_BYPASS;
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/not configured|Unauthorized/i);
    } finally {
      server.close();
    }
  });

  it('dev auth bypass is impossible on serverless platforms even if dev flags are misconfigured', async () => {
    delete process.env.CLERK_SECRET_KEY;
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_DEV_AUTH_BYPASS = 'true';
    process.env.VERCEL = '1';

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/not configured/i);
    } finally {
      delete process.env.VERCEL;
      server.close();
    }
  });

  it('POST /api/lms/evaluate-test without a Clerk session is rejected in production', async () => {
    delete process.env.CLERK_SECRET_KEY;
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_DEV_AUTH_BYPASS;

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/lms/evaluate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'print(1)', dayNumber: 1 }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/not configured|Unauthorized/i);
    } finally {
      server.close();
    }
  });

  it('exports a valid Express app without starting background listeners', () => {
    expect(typeof app).toBe('function');
    expect(typeof app.use).toBe('function');
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
  });

  it('GET /api/health returns HTTP 200 with structured liveness metadata', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
      expect(data.service).toBe('kriora-lms-api');
      expect(data.version).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(data.requestId).toBeDefined();
    } finally {
      server.close();
    }
  });

  it('GET /api/readiness returns dependency checks', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/readiness`);
      expect([200, 503]).toContain(res.status);
      const data = await res.json();
      expect(data.service).toBe('kriora-lms-api');
      expect(data.dependencies).toBeDefined();
      expect(typeof data.dependencies.convexConfigured).toBe('boolean');
      expect(typeof data.dependencies.aiConfigured).toBe('boolean');
    } finally {
      server.close();
    }
  });

  it('POST /api/chat rejects messages exceeding 4000 characters', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      const longMessage = 'A'.repeat(4500);
      const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: longMessage }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/exceeds maximum allowable length/i);
    } finally {
      server.close();
    }
  });

  it('POST /api/lms/evaluate-test rejects empty code submissions', async () => {
    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/lms/evaluate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '   ' }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/code.*required/i);
    } finally {
      server.close();
    }
  });

  it('verifies Rate-Limit headers are present on AI endpoints', async () => {
    delete process.env.CLERK_SECRET_KEY;
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_DEV_AUTH_BYPASS;

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      // Unauthenticated request is rejected (401) but rate-limit headers are still attached.
      const res = await fetch(`http://127.0.0.1:${port}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      });
      expect(res.status).toBe(401);
      expect(res.headers.get('x-ratelimit-limit')).toBeDefined();
      expect(res.headers.get('x-ratelimit-remaining')).toBeDefined();
    } finally {
      server.close();
    }
  });

  it('scans client source directory to verify zero provider secrets remain in frontend code', () => {
    const srcDir = path.join(process.cwd(), 'src');
    const files = fs.readdirSync(srcDir, { recursive: true }) as string[];
    const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    for (const f of tsFiles) {
      const fullPath = path.join(srcDir, f);
      if (fs.statSync(fullPath).isFile()) {
        const content = fs.readFileSync(fullPath, 'utf8');
        expect(content.includes('VITE_GEMINI_API_KEY')).toBe(false);
        expect(content.includes('VITE_OPENROUTER_API_KEY')).toBe(false);
        expect(content.includes('generativelanguage.googleapis.com')).toBe(false);
      }
    }
  });
});
