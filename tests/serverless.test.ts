import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildSync } from 'esbuild';
import { execFileSync } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';

// Regression guard for the class of failure that broke production: a serverless
// function that crashes on import/invocation (FUNCTION_INVOCATION_FAILED).
// Bundles api/index.ts exactly like Vercel does, boots it in a real Node process,
// and asserts the liveness/readiness endpoints respond.
describe('Serverless Function Bundle (Vercel entrypoint)', () => {
  const outfile = path.join(process.cwd(), 'dist', 'api-serverless-smoke.cjs');
  const runner = path.join(process.cwd(), 'dist', 'api-serverless-smoke-runner.cjs');

  beforeAll(() => {
    buildSync({
      entryPoints: [path.join(process.cwd(), 'api', 'index.ts')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      packages: 'external',
      outfile,
    });
  });

  afterAll(() => {
    for (const f of [outfile, runner]) {
      try { fs.unlinkSync(f); } catch { /* already gone */ }
    }
  });

  it('loads without crashing and serves /api/health and /api/readiness', () => {
    fs.writeFileSync(
      runner,
      `
const { default: app } = require('./api-serverless-smoke.cjs');
const http = require('http');
const server = http.createServer((req, res) => app(req, res));
server.listen(0, () => {
  const port = server.address().port;
  Promise.all([
    fetch('http://127.0.0.1:' + port + '/api/health'),
    fetch('http://127.0.0.1:' + port + '/api/readiness'),
  ])
    .then(async ([h, r]) => {
      console.log(JSON.stringify({ health: h.status, readiness: r.status }));
      server.close();
    })
    .catch((e) => { console.log(JSON.stringify({ error: e.message })); server.close(); process.exitCode = 1; });
});
`
    );

    const stdout = execFileSync(process.execPath, [runner], { encoding: 'utf8' });
    const last = stdout.trim().split('\n').pop() || '';
    const result = JSON.parse(last);
    expect(result.error).toBeUndefined();
    expect(result.health).toBe(200);
    expect([200, 503]).toContain(result.readiness);
  });
});
