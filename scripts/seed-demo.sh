#!/usr/bin/env bash
set -euo pipefail
[[ "${CONFIRM_DEMO_SEED:-}" == yes && "${NODE_ENV:-development}" != production ]]||{ echo 'Guarded non-production demo seed only.'>&2;exit 2;};r="$(cd "$(dirname "$0")/.."&&pwd)";psql -v ON_ERROR_STOP=1 "$DATABASE_URL" -f "$r/backend/seed.sql";(cd "$r/backend"&&node seed-users.js)
