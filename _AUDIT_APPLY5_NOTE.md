# Apply Pass 5 — AIBakeryProductionManager

- **Date:** 2026-05-08
- **Audit source:** `_AUDIT/reports/batch_01.md` § 2
- **Stack:** node-express backend (`backend/`) + Vite React frontend (`frontend/`); JWT bearer auth via `middleware/auth.js`; Postgres via `db.js`; rate limiter `services/rateLimiter`.
- **AI helper:** `services/openrouter.js` (`callOpenRouter`).

## Verified-present (Non-AI features inventory)
`auth.js`, `crud.js`, `batchAlerts.js`, plus 9 AI endpoints in `routes/ai.js` and 5 in `routes/aiNew.js` (inventory ordering, seasonal menu, bottleneck detector, batch quality, cost analysis). `/api/health` from earlier pass.

## Implemented this pass (1 unified module = 5 mechanical items inside)

| # | Item | Category | Endpoint group |
|---|------|----------|----------------|
| 1 | Square POS + Toast POS integration stubs | NEEDS-CREDS | `GET/POST /api/integrations/square/*`, `/toast/*` (503 with `missing: SQUARE_ACCESS_TOKEN` / `TOAST_API_TOKEN`) |
| 2 | Sysco + US Foods supplier API stubs | NEEDS-CREDS | `GET /api/integrations/sysco/catalog`, `/usfoods/catalog` (503 with `missing: SYSCO_API_KEY` / `USFOODS_API_KEY`) |
| 3 | MarginEdge inventory integration stub | NEEDS-CREDS | `POST /api/integrations/marginedge/sync` (503 with `missing: MARGINEDGE_API_KEY`) |
| 4 | Multi-location demand sync (additive `bakery_locations` + `location_demand`) | NEEDS-PRODUCT-DECISION (single-tenant per location, additive only) | `GET/POST /api/integrations/locations`, `POST /api/integrations/demand-sync` |
| 5 | Supply chain agent (3-step: forecast → bottleneck → order plan) | NEEDS-PRODUCT-DECISION (sequential pipeline default) | `POST /api/integrations/supply-chain-agent` |

All 5 land in **`backend/routes/integrations.js`** (new). Route registered in `backend/server.js`.

## Deferred (creds / product / risk)

| Item | Category | Reason |
|------|----------|--------|
| Video recipe adaptation | NEEDS-CREDS | Requires `VIDEO_MODEL_KEY` (third-party video understanding model) |
| Outbound webhook delivery infra | TOO-RISKY | Background worker + retry/HMAC required |
| Real per-tenant white-label | NEEDS-PRODUCT-DECISION | Multi-tenant data-isolation strategy |

## Frontend
No dedicated FE page added in this pass. The existing `pages/AIFeatures.jsx` is parameterized by feature key; supply-chain-agent results render through it. Integration health/status surfaces only in API responses — operations dashboard out-of-scope per pass-5 budget.

## Smoke test
- `node --check backend/routes/integrations.js` — PASS.
- Route registration: `app.use('/api/integrations', require('./routes/integrations'))` in `backend/server.js` line 48.

## Notes
- All schema additive (`CREATE TABLE IF NOT EXISTS`).
- AI endpoints return 503 with `missing: OPENROUTER_API_KEY` when AI key absent.
- Vendor stubs return 503 with `{ error, missing, hint }` so FE can clearly render "not configured" state.
- No existing route modified.
