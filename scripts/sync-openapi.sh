#!/usr/bin/env bash
# Re-vendors the backend's OpenAPI contract and regenerates its TypeScript types.
# The backend (../enquoir) is the source of truth; this repo keeps its own copy
# so it builds and tests without depending on a sibling checkout existing.
set -euo pipefail

cd "$(dirname "$0")/.."

BACKEND_SPEC="../enquoir/api/openapi.yaml"
VENDORED_SPEC="openapi/openapi.yaml"

if [ ! -f "$BACKEND_SPEC" ]; then
  echo "error: $BACKEND_SPEC not found. Run this from alongside a checkout of Tee-Stark/enquoir, or update VENDORED_SPEC manually." >&2
  exit 1
fi

cp "$BACKEND_SPEC" "$VENDORED_SPEC"
pnpm exec openapi-typescript "$VENDORED_SPEC" -o src/lib/api/schema.d.ts

echo "Synced $VENDORED_SPEC and regenerated src/lib/api/schema.d.ts"
