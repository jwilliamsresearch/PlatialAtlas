#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL not set" >&2
  exit 1
fi

db=$(python3 - "$DATABASE_URL" <<'PY'
import sys
from urllib.parse import urlparse
u=urlparse(sys.argv[1])
print(u.path.lstrip('/'))
PY
)

server=$(python3 - "$DATABASE_URL" <<'PY'
import sys
from urllib.parse import urlparse
u=urlparse(sys.argv[1])
auth = ''
if u.username:
    auth = u.username
    if u.password:
        auth += ':'+u.password
    auth += '@'
host = u.hostname or 'localhost'
port = u.port or 5432
print(f"postgresql://{auth}{host}:{port}/postgres")
PY
)

psql "$server" -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'" | grep -q 1 || psql "$server" -c "CREATE DATABASE ${db}"
echo "DB ensured: ${db}"

