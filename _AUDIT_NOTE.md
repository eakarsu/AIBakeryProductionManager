# Audit Apply Note — AIBakeryProductionManager

Source: `_AUDIT/reports/batch_01.md` § 2.

## Original audit recommendations
- "Mature feature set; consider advanced AI features (agentic workflows, RAG, real-time streaming)"
- Strategic features: Supply Chain Agent, Multi-location Demand Sync, Video Recipe Adaptation
- Integrations: POS (Square, Toast), supplier APIs (Sysco, US Foods), inventory (MarginEdge)

## Audit findings vs. reality
The codebase already has 9 AI endpoints in `routes/ai.js` plus 5 more in `routes/aiNew.js` (inventory ordering, seasonal menu, bottleneck detector, batch quality, cost analysis). Audit's headline number is correct but the project is more substantive than "template-clone" implies.

## Implemented in this pass (MECHANICAL)

| # | Item | File | Endpoint |
|---|------|------|----------|
| 1 | `/api/health` endpoint | `backend/server.js` | `GET /api/health` |

The audit didn't flag a missing health check, but the server lacked one and adding it is purely mechanical.

## Backlog (not implemented)

| Item | Tag | Why deferred |
|------|-----|---------------|
| Supply Chain agentic workflow | NEEDS-PRODUCT-DECISION | Multi-agent topology |
| Multi-location demand sync | TOO-RISKY | Schema additions |
| Video recipe adaptation | NEEDS-CREDS | Video model / SDK |
| POS integrations (Square, Toast) | NEEDS-CREDS | Vendor API keys |
| Supplier APIs (Sysco, US Foods) | NEEDS-CREDS | Vendor API keys |
| MarginEdge integration | NEEDS-CREDS | Vendor API keys |

## Apply pass 4 (mechanical backlog)
- Reviewed remaining backlog. Every entry is tagged NEEDS-CREDS, NEEDS-PRODUCT-DECISION, or TOO-RISKY — nothing qualifies as mechanical. No code changes this pass.

## Apply pass 3 (frontend)
- Stack: Vite-React frontend + Express backend.
- Action: LEFT-AS-IS — FE already wired.
- `pages/AIFeatures.jsx` consumes every `routes/ai.js` and `routes/aiNew.js` endpoint (recipe-scaling, demand-forecast, marketing-copy, nutritional-label, waste-reduction, cake-consultation, seasonal-forecast, inventory-ordering, seasonal-menu, bottleneck-detector, batch-quality, cost-analysis). Routes + sidebar entries in `App.jsx`. Token via `utils.js` `api()` wrapper.
- No FE changes required.
