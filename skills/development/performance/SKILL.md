---
name: performance
description: Identifies performance bottlenecks, optimizes bundle size and runtime behavior, runs and compares benchmarks, and profiles memory usage. Use when a user reports slowness, bundle size exceeds budget, a benchmark regresses, or memory grows unbounded over time.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Performance

## Decision Tree

- What kind of performance problem?
  - **Bundle is too large** → run `tools/bundle-analyze.ts`, then see "Bundle Optimization" below
  - **Runtime is slow (latency, throughput)** → run `tools/perf-profile.ts`, then see "Runtime Optimization" below
  - **Memory grows over time / leak suspected** → run `tools/perf-profile.ts --memory`, then see "Memory Leaks" below
  - **Compare performance between two branches** → run `tools/bench-compare.ts <branch-a> <branch-b>`
  - **Check if bundle exceeds size budget** → run `tools/size-budget.ts`
  - **No specific complaint — general audit** → run all tools, start with the worst finding

## Bundle Optimization

1. Run `tools/bundle-analyze.ts` and open the treemap — look for:
   - **Unexpectedly large dependencies** (e.g., `moment`, `lodash`, full `date-fns`) → replace with smaller alternatives or tree-shakeable imports
   - **Duplicated packages** at different versions → align versions in `package.json`
   - **Code that should be lazy-loaded** being bundled eagerly → split with dynamic `import()`
   - **Dev-only code in production bundle** → check `NODE_ENV` guards and `devDependencies`

2. Check `tools/size-budget.ts` to see which budgets are exceeded — fix the worst overage first

3. After each change, re-run `tools/bundle-analyze.ts` to confirm the change had the intended effect

Common wins:
- Replace `import * as _ from 'lodash'` with named imports: `import { debounce } from 'lodash-es'`
- Move large route components to `React.lazy()` / dynamic imports
- Use `sideEffects: false` in package.json for pure utility packages
- Audit polyfills — ship only what target browsers actually need

## Runtime Optimization

1. Run `tools/perf-profile.ts --entry <path>` to capture a CPU profile
2. Look at the hot paths in the summary — focus on functions that appear at the top of the flame graph
3. Classify the bottleneck:
   - **Algorithmic** (O(n²) loop, repeated traversal of large arrays) → fix the algorithm; no amount of micro-optimization beats this
   - **Repeated expensive computation** → memoize with `Map` cache or `useMemo`/`React.memo` for UI
   - **Blocking the event loop** (heavy sync work in a request handler) → offload to a worker thread or batch process
   - **Too many re-renders** (React) → profile with React DevTools, then add `memo`, `useCallback`, or restructure state
   - **N+1 queries** → batch or join at the DB layer; add `dataloader` for GraphQL

4. Measure before and after each change with `tools/bench-compare.ts` — don't guess at impact

Rules:
- Profile first, optimize second — never optimize code you haven't measured
- Prefer algorithmic improvements over micro-optimizations
- Document why performance-critical code is written the way it is

## Memory Leaks

1. Run `tools/perf-profile.ts --memory --entry <path>` and let it run under load
2. Look for:
   - **Retained objects that grow linearly** → something is accumulating in a collection and never releasing
   - **Event listeners not removed** → check `addEventListener` without matching `removeEventListener`; use `AbortController`
   - **Closures holding large objects** → check if callbacks capture big data structures unnecessarily
   - **Cache without eviction** → unbounded `Map` or `Set` used as a cache → add LRU eviction or TTL
3. Confirm the fix by running the profile again under the same load and comparing heap snapshots

## Benchmarking

When comparing branches with `tools/bench-compare.ts`:
1. Run on identical hardware (not a laptop under load) — use CI for authoritative benchmarks
2. Warm up the runtime before measuring (JIT compilation affects early results)
3. Run enough iterations for statistical significance — the tool reports p-values; require p < 0.05
4. Check for regressions in both throughput AND tail latency (p99), not just averages

Setting performance budgets:
- Define budgets in the project's size budget config before shipping features, not after
- Fail CI when budgets are exceeded (`tools/size-budget.ts` exits non-zero)
- Budget categories: initial bundle, per-route chunk, total JS, total CSS

## Key references

| File | What it covers |
|---|---|
| `tools/bundle-analyze.ts` | Treemap visualization of bundle size by module |
| `tools/bench-compare.ts` | Run benchmarks on two branches with statistical comparison |
| `tools/perf-profile.ts` | Capture CPU or memory profile and summarize hot paths |
| `tools/size-budget.ts` | Check bundle sizes against configured budgets |
