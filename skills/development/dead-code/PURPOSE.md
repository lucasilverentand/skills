# Dead Code

Find and remove unused code, exports, and dependencies.

## Responsibilities

- Detect unused code and dead code paths
- Remove unused exports and dependencies
- Verify removals don't break consumers
- Identify unreachable branches and conditions
- Track dependency usage across the module graph

## Tools

- `tools/unused-exports.ts` — find exported symbols with zero imports across the project
- `tools/dead-deps.ts` — list installed packages not referenced in any source file
- `tools/unreachable-code.ts` — detect code paths behind always-false conditions or after early returns
- `tools/removal-impact.ts` — simulate removing a symbol and report which files would be affected
