#!/usr/bin/env bash
set -euo pipefail
git init -q .
cat > CHANGELOG.md <<'MD'
# Changelog

## 1.2.0
- Added dark mode
MD
git add . && git -c user.name=eval -c user.email=eval@example.com commit -qm init
