'use strict';

const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const express = require('express');
const { createAIWorkspaceRouter, validateFields, FIELD_KEYS } = require('../aiWorkspace.cjs');

const feature = { id: 'bakery-review', title: 'Bakery review', description: 'Review bakery planning evidence.' };
const completeFields = Object.fromEntries(FIELD_KEYS.map((key) => [key, `${key} example`]));

function mockPool() {
  const calls = [];
  return {
    calls,
    async query(text, values = []) {
      calls.push({ text, values });
      if (/INSERT INTO ai_workspace_runs/.test(text)) return { rows: [{ id: '1', user_id: '7', feature: feature.id, input: values[2], result: values[3], model: values[5], usage: values[6], created_at: new Date().toISOString() }] };
      if (/SELECT \* FROM ai_workspace_runs/.test(text)) return { rows: [] };
      if (/DELETE FROM ai_workspace_runs/.test(text)) return { rows: [{ id: values[0] }] };
      return { rows: [] };
    },
  };
}

async function serve({ fetchImpl, pool = mockPool() }) {
  const app = express();
  app.use(express.json());
  app.use('/api/report-workspace', createAIWorkspaceRouter({
    pool,
    authenticateToken(req, _res, next) { req.user = { id: 7, role: 'admin' }; next(); },
    aiRateLimiter: (_req, _res, next) => next(),
    features: [feature],
    fetchImpl,
    env: { OPENROUTER_API_KEY: 'controlled-test-key', OPENROUTER_MODEL: 'controlled/test-model', OPENROUTER_BASE_URL: 'http://controlled.invalid' },
  }));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  return { server, pool, url: `http://127.0.0.1:${port}/api/report-workspace` };
}

test('field validation retains every required and optional report field', () => {
  assert.deepEqual(validateFields(completeFields), completeFields);
  assert.throws(() => validateFields({ input: 'brief' }), /desired outcome/);
  assert.throws(() => validateFields({ ...completeFields, unexpected: 'value' }), /invalid/);
});

test('controlled OpenRouter response is saved as an actor-owned readable report', async (t) => {
  const providerRequests = [];
  const runtime = await serve({
    fetchImpl: async (url, options) => {
      providerRequests.push({ url, options });
      return new Response(JSON.stringify({
        model: 'controlled/test-model',
        choices: [{ message: { content: '# Executive summary\n\nPlanning example only.\n\n## Action plan\n\n- Review source evidence.' } }],
        usage: { total_tokens: 42 },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },
  });
  t.after(() => runtime.server.close());

  const response = await fetch(`${runtime.url}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature: feature.id, fields: completeFields }),
  });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.item.user_id, '7');
  assert.match(data.item.result, /Executive summary/);
  assert.equal(providerRequests.length, 1);
  assert.equal(new URL(providerRequests[0].url).hostname, 'controlled.invalid');
  assert.equal(runtime.pool.calls.filter(({ text }) => /INSERT INTO ai_workspace_runs/.test(text)).length, 1);
});

test('client cancellation aborts the provider and persists no report', async (t) => {
  let providerStarted;
  const started = new Promise((resolve) => { providerStarted = resolve; });
  let providerAborted = false;
  const runtime = await serve({
    fetchImpl: async (_url, options) => new Promise((_resolve, reject) => {
      providerStarted();
      options.signal.addEventListener('abort', () => {
        providerAborted = true;
        reject(Object.assign(new Error('controlled abort'), { name: 'AbortError' }));
      }, { once: true });
    }),
  });
  t.after(() => runtime.server.close());

  const controller = new AbortController();
  const request = fetch(`${runtime.url}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature: feature.id, fields: completeFields }),
    signal: controller.signal,
  });
  await started;
  controller.abort();
  await assert.rejects(request, /abort/i);
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(providerAborted, true);
  assert.equal(runtime.pool.calls.filter(({ text }) => /INSERT INTO ai_workspace_runs/.test(text)).length, 0);
});
