---
name: performance
description: Identifies performance bottlenecks, optimizes bundle size and runtime behavior, runs and compares benchmarks, and profiles memory usage. Covers web, server, and React Native / Expo apps. Use when a user reports slowness, bundle size exceeds budget, a benchmark regresses, memory grows unbounded, or a mobile app is janky or slow to start.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Performance

## Decision Tree

- What kind of performance problem?
  - **Bundle is too large** → run `tools/bundle-analyze.ts`, then see "Bundle Optimization" below
  - **Runtime is slow (latency, throughput)** → run `tools/perf-profile.ts`, then see "Runtime Optimization" below
  - **Memory grows over time / leak suspected** → run `tools/perf-profile.ts --memory`, then see "Memory Leaks" below
  - **Expo / React Native app is janky, slow to start, or laggy on scroll** → see "Mobile Performance" below
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

## Mobile Performance

React Native renders JS on the Hermes engine and communicates with native UI via JSI (New Architecture) or the legacy bridge. Performance problems fall into four categories:

1. **JS thread overload** — too many re-renders or heavy synchronous computation
2. **Unvirtualized lists** — rendering every row at once with `ScrollView`
3. **Animations going through the bridge** — instead of running on the native thread
4. **Slow startup** — large bundle, blocking initialization, or unoptimized assets

### Diagnosing

1. Enable the in-app performance overlay: shake the device → Performance Monitor
2. Profile with `tools/rn-perf-profile.ts` — wraps Hermes sampling profiler; open the result in Flipper
3. Use React DevTools Profiler to identify unnecessary re-renders
4. Run `tools/rn-render-scan.ts` to flag components that re-render on every parent update

### Lists

- Use `FlatList` instead of `ScrollView` for any list with more than ~20 items — `ScrollView` renders all children at once
- Prefer `@shopify/flash-list` over `FlatList` for large or frequently updating lists — significantly lower memory and faster scrolling
- Always provide a `keyExtractor` that returns a stable unique string (never the array index)
- Provide `estimatedItemSize` (`FlashList`) or `getItemLayout` (`FlatList`) to skip layout measurement on scroll
- Memoize list item components with `React.memo` and wrap callbacks with `useCallback`

### Animations

- Use `useNativeDriver: true` on every `Animated.Value` animation — runs the animation off the JS thread entirely
- `useNativeDriver` only supports `transform` and `opacity` — layout properties (`width`, `height`, `top`, `left`) always go through JS
- For animations that require layout properties or complex sequencing, use `react-native-reanimated` — Worklets run on the UI thread, not the JS thread
- Never drive animations from React state — use refs or Reanimated shared values

### Re-renders

1. Run `tools/rn-render-scan.ts` to identify components that re-render unnecessarily
2. Wrap pure components with `React.memo` to skip re-renders when props haven't changed
3. Memoize callbacks passed as props: `useCallback`; memoize computed objects: `useMemo`
4. Avoid inline object or array props — `<Component style={{ color: 'red' }} />` creates a new object on every parent render

### Images

- Use `expo-image` instead of the built-in `<Image>` — automatic disk caching, blurhash placeholders, better memory management
- Never create the `source` prop inline: `source={{ uri: url }}` — memoize or define it outside the render function
- Preload critical images during the loading screen using `expo-image`'s `prefetch`

### Startup time

1. Run `tools/bundle-analyze.ts` to find large dependencies — Metro bundles everything into one JS file
2. Defer non-critical initialization until after the first render using `InteractionManager.runAfterInteractions`
3. Only do essential work (auth check, font loading) before calling `SplashScreen.hideAsync()` — everything else can wait
4. Avoid importing large libraries at the top level of modules loaded during startup

## Key references

| File | What it covers |
|---|---|
| `tools/bundle-analyze.ts` | Treemap visualization of bundle size by module |
| `tools/bench-compare.ts` | Run benchmarks on two branches with statistical comparison |
| `tools/perf-profile.ts` | Capture CPU or memory profile and summarize hot paths |
| `tools/size-budget.ts` | Check bundle sizes against configured budgets |
| `tools/rn-perf-profile.ts` | Capture a Hermes CPU profile for React Native and format for Flipper |
| `tools/rn-render-scan.ts` | Identify React Native components that re-render on every parent update |
