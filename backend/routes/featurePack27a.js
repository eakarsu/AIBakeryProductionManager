const express = require('express');

function pick(r, aliases) { for (const a of aliases) if (r && r[a] !== undefined && r[a] !== null) return r[a]; return undefined; }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function nameOf(r) { return pick(r, ['name', 'title', 'domain', 'url']) || `record-${pick(r, ['id']) ?? 'unknown'}`; }
function countBy(rows, aliases) { const out = {}; for (const r of rows) { const v = pick(r, aliases); const k = v === undefined || v === '' ? 'unspecified' : String(v).toLowerCase(); out[k] = (out[k] || 0) + 1; } return out; }
function filterRecords(rows, q = {}) {
  const search = String(q.search || q.q || '').toLowerCase();
  return (rows || []).filter((r) => {
    if (search && !JSON.stringify(r).toLowerCase().includes(search)) return false;
    for (const f of ['status', 'severity', 'target_type', 'type', 'risk_level', 'category']) {
      const want = q[f] || q[`filter_${f}`];
      if (want && pick(r, [f]) !== undefined && String(pick(r, [f])).toLowerCase() !== String(want).toLowerCase()) return false;
    }
    return true;
  });
}
function esc(v) { if (v === null || v === undefined) return ''; const s = typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function toCSV(rows) { if (!rows.length) return ''; const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))]; return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\r\n'); }

const fallbacks = {
  'recipe-production-summary': (rows) => ({
    totalRecords: rows.length, byCategory: countBy(rows, ['category']), activeCount: rows.filter((r) => pick(r, ['is_active', 'active']) === true).length,
    inactiveCount: rows.filter((r) => pick(r, ['is_active', 'active']) === false).length,
    averageCostPerUnit: rows.length ? Math.round((rows.reduce((s, r) => s + num(pick(r, ['cost_per_unit', 'cost'])), 0) / rows.length) * 100) / 100 : 0,
    recipes: rows.slice(0, 5).map((r) => ({ name: nameOf(r), costPerUnit: num(pick(r, ['cost_per_unit', 'cost'])), isActive: pick(r, ['is_active', 'active']) === true })),
  }),
  'waste-and-cost-watch': (rows) => ({
    totalRecords: rows.length, totalWaste: rows.reduce((s, r) => s + num(pick(r, ['waste_amount', 'waste_quantity', 'waste'])), 0),
    highCostCount: rows.filter((r) => num(pick(r, ['cost_per_unit', 'cost'])) >= 10).length,
    watchlist: [...rows].sort((a, b) => num(pick(b, ['cost_per_unit', 'cost'])) - num(pick(a, ['cost_per_unit', 'cost']))).slice(0, 5).map((r) => ({ name: nameOf(r), costPerUnit: num(pick(r, ['cost_per_unit', 'cost'])), wasteAmount: num(pick(r, ['waste_amount', 'waste_quantity', 'waste'])) })),
  }),
  'production-priority': (rows) => ({
    totalRecords: rows.length, totalPrepMinutes: rows.reduce((s, r) => s + num(pick(r, ['prep_time_minutes', 'prep_time'])), 0),
    queue: [...rows].sort((a, b) => num(pick(b, ['prep_time_minutes', 'prep_time'])) + num(pick(b, ['bake_time_minutes', 'bake_time'])) - (num(pick(a, ['prep_time_minutes', 'prep_time'])) + num(pick(a, ['bake_time_minutes', 'bake_time'])))).slice(0, 10).map((r, i) => ({ rank: i + 1, name: nameOf(r), totalMinutes: num(pick(r, ['prep_time_minutes', 'prep_time'])) + num(pick(r, ['bake_time_minutes', 'bake_time'])), isActive: pick(r, ['is_active', 'active']) === true })),
  }),
};
const FEATURES = Object.keys(fallbacks);

async function runAI(feature, records, env, fetchImpl) {
  const fallback = fallbacks[feature](records);
  const key = env.OPENROUTER_API_KEY || env.OPENAI_API_KEY;
  if (!key) return { aiGenerated: false, source: 'deterministic-fallback', feature, result: fallback, note: 'No OPENROUTER_API_KEY/OPENAI_API_KEY configured; deterministic fallback over the supplied records.' };
  try {
    const isOpenRouter = Boolean(env.OPENROUTER_API_KEY);
    const res = await fetchImpl(isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: isOpenRouter ? (env.OPENROUTER_MODEL || 'openai/gpt-4o-mini') : (env.OPENAI_MODEL || 'gpt-4o-mini'), messages: [{ role: 'system', content: 'Return only JSON for a bakery production analysis.' }, { role: 'user', content: `Feature: ${feature}\nRecords: ${JSON.stringify(records).slice(0, 8000)}` }] }),
    });
    if (!res.ok) throw new Error(`provider ${res.status}`);
    const data = await res.json(); const text = data.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(text.replace(/```(?:json)?/g, '').trim());
    return { aiGenerated: true, provider: isOpenRouter ? 'openrouter' : 'openai', model: data.model || null, feature, result: parsed };
  } catch { return { aiGenerated: false, source: 'deterministic-fallback', feature, result: fallback, note: 'AI provider unavailable; deterministic fallback over the supplied records.' }; }
}

function createFeaturePackRouter({ authenticate, loadRecords, env = process.env, fetchImpl = (...a) => fetch(...a) } = {}) {
  const router = express.Router(); const tasks = new Map(); let seq = 0;
  if (authenticate) router.use(authenticate);
  const owner = (req) => String(req.user?.id ?? req.user?.userId ?? req.user?.email ?? req.user?.sub ?? 'unknown');
  router.get('/tasks', (req, res) => { const mine = [...tasks.values()].filter((t) => t.owner === owner(req)); res.json({ data: filterRecords(mine, req.query), total: filterRecords(mine, req.query).length }); });
  router.post('/tasks', (req, res) => { const title = String(req.body?.title || '').trim(); if (!title) return res.status(400).json({ error: 'title is required' }); const t = { id: `task-${++seq}`, title, status: req.body?.status || 'todo', notes: req.body?.notes || '', owner: owner(req), created_at: new Date().toISOString() }; tasks.set(t.id, t); return res.status(201).json(t); });
  const update = (req, res) => { const t = tasks.get(req.params.id); if (!t || t.owner !== owner(req)) return res.status(404).json({ error: 'Task not found' }); if (req.body?.title !== undefined) t.title = String(req.body.title); if (req.body?.status !== undefined) t.status = String(req.body.status); if (req.body?.notes !== undefined) t.notes = req.body.notes; t.updated_at = new Date().toISOString(); return res.json(t); };
  router.put('/tasks/:id', update); router.patch('/tasks/:id', update);
  router.get('/records/export', async (req, res) => {
    try { const rows = filterRecords(await loadRecords(req), req.query); const format = String(req.query.format || 'json').toLowerCase();
      if (format === 'csv') { res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', 'attachment; filename="recipes_export.csv"'); return res.send(toCSV(rows)); }
      if (format !== 'json') return res.status(400).json({ error: 'format must be csv or json' });
      res.setHeader('Content-Disposition', 'attachment; filename="recipes_export.json"'); return res.json({ data: rows, total: rows.length });
    } catch { return res.status(500).json({ error: 'Main records unavailable for export' }); }
  });
  router.post('/ai/:feature', async (req, res) => {
    if (!FEATURES.includes(req.params.feature)) return res.status(404).json({ error: 'Unknown AI feature' });
    let records = Array.isArray(req.body?.records) ? req.body.records : (req.body?.record ? [req.body.record] : null);
    if (!records) { try { records = await loadRecords(req); } catch { records = []; } }
    return res.json(await runAI(req.params.feature, records, env, fetchImpl));
  });
  return router;
}
module.exports = { createFeaturePackRouter, toCSV, filterRecords, fallbacks, FEATURES };
