# Performance

Identify bottlenecks, optimize bundles and runtime, and run benchmarks.

## Responsibilities

- Identify performance bottlenecks
- Optimize bundle size and runtime performance
- Run and analyze benchmarks
- Profile memory usage and detect leaks
- Track performance regressions across commits

## Tools

- `tools/bundle-analyze.ts` — generate a treemap visualization of bundle size by module
- `tools/bench-compare.ts` — run benchmarks on two branches and report statistical differences
- `tools/perf-profile.ts` — capture a CPU or memory profile for a given entry point and summarize hot paths
- `tools/size-budget.ts` — check bundle sizes against configured budgets and fail on overages
