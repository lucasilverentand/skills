#!/usr/bin/env bash
set -euo pipefail
git init -q .
cat > README.md <<'MD'
# Widget

Widget is a small libary for drawing widgets.
MD
git add README.md && git -c user.name=eval -c user.email=eval@example.com commit -qm init
