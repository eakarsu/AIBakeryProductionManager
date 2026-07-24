#!/usr/bin/env bash
set -euo pipefail
r="$(cd "$(dirname "$0")/.."&&pwd)";set -a;source "$r/.env";set +a;: "${DATABASE_URL:?DATABASE_URL required}";if [[ "$(psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.users') IS NOT NULL")" != t ]];then psql -v ON_ERROR_STOP=1 "$DATABASE_URL" -f "$r/backend/schema.sql";fi;for m in "$r"/backend/migrations/*.sql;do psql -v ON_ERROR_STOP=1 "$DATABASE_URL" -f "$m";done
