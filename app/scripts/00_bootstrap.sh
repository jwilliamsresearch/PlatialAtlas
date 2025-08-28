#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

export DATABASE_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/platial_atlas}

echo "[bootstrap] Creating DB and running base migrations"
make init

echo "[bootstrap] Seeding demo data"
psql "$DATABASE_URL" -f db/seed/seed_demo.sql || true

echo "[bootstrap] Done."

