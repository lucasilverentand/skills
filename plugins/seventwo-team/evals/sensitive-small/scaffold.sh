#!/usr/bin/env bash
set -euo pipefail
git init -q .
mkdir -p src
cat > src/auth.ts <<'TS'
export type Role = "viewer" | "editor" | "admin";
export function canDelete(role: Role): boolean {
  return role === "admin";
}
TS
git add . && git -c user.name=eval -c user.email=eval@example.com commit -qm init
