#!/usr/bin/env bash
set -euo pipefail

DB_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5433/platial-atlas}

echo "[mv] Refreshing materialized views concurrently"
psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_poi_counts_r6" || psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW mv_poi_counts_r6"
psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_poi_counts_r7" || psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW mv_poi_counts_r7"
psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_poi_counts_r8" || psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW mv_poi_counts_r8"
psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_poi_counts_r9" || psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW mv_poi_counts_r9"
psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_poi_counts_r10" || psql "$DB_URL" -c "REFRESH MATERIALIZED VIEW mv_poi_counts_r10"

echo "[mv] Done"
