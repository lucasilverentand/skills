# Conflicts

Resolve merge conflicts and prevent future conflicts.

## Responsibilities

- Resolve merge conflicts
- Apply conflict prevention strategies
- Detect conflict-prone files before merging
- Track recurring conflict patterns across branches
- Automate resolution of trivial conflicts (e.g. lockfiles)

## Tools

- `tools/conflict-forecast.ts` — detect files likely to conflict between two branches
- `tools/conflict-hotspots.ts` — report files with the most merge conflicts in recent history
- `tools/lockfile-resolve.ts` — auto-resolve lockfile conflicts by regenerating with bun install
