---
name: debugging
description: Performs systematic root cause analysis and log analysis for diagnosing issues. Use when the user encounters errors, unexpected behavior, test failures, stack traces, regressions, or needs to trace through code to find the underlying cause of a problem. Trigger phrases: "not working", "broken", "error", "crash", "why is this failing", "something is wrong", "unexpected behavior", "slow", "performance issue".
allowed-tools: Read Grep Glob Bash Write Edit
---

# Debugging

## Decision Tree

- What kind of issue are you investigating?
  - **You have a stack trace or error message** → follow "Error Analysis" below
  - **Behavior is wrong but no error is thrown** → follow "Behavior Debugging" below
  - **Works sometimes but not always** → follow "Flaky Issue" below
  - **A recent change broke something** → follow "Regression Bisect" below
  - **Logs exist but you need to understand them** → follow "Log Analysis" below
  - **Something is too slow** → follow "Performance Issue" below

## Error Analysis

1. Run `tools/stacktrace-parse.ts <trace>` to enrich the stack trace with source context
2. Identify the **top frame that belongs to project code** (not a framework or runtime)
   - Internal frames from node_modules, the runtime, or the OS are rarely where the bug lives
3. Read the source at that location — understand what it expected vs. what it got
4. Work backwards: what called this? What state was it in?
   - **Error is in a dependency** → check the installed version, look for known issues in the changelog or issue tracker, then read the call site — you likely passed something unexpected
   - **Error is in project code** → identify the bad assumption: null/undefined access, type mismatch, missing guard, wrong enum branch
5. Categorize the error type — different categories have different fix patterns:
   - **TypeError / null dereference** → a value was assumed present but wasn't — add a guard or trace where the null originates
   - **RangeError / bounds violation** → an index or size was wrong — check loop bounds and array access
   - **Unhandled promise rejection** → an async operation failed silently — find the missing `await` or `catch`
   - **Import / module not found** → package missing, wrong path, or circular dependency — check `package.json` and import paths
6. Form a hypothesis: *"this fails because X when Y"*
7. Verify by reading the code path that leads to the failure — do not guess
8. Fix the root cause, not just the symptom

### Common patterns

```
// ❌ symptom: TypeError: Cannot read properties of undefined (reading 'id')
// → something.user is undefined — trace where `something` comes from
const id = something.user.id

// ✅ fix: guard the access, or fix the upstream code that omits `user`
const id = something.user?.id ?? null
```

```
// ❌ symptom: UnhandledPromiseRejection — no stack, silent failure
fetchUser(id).then(process)

// ✅ always await or attach a catch
const user = await fetchUser(id)   // throws visibly
// or
fetchUser(id).then(process).catch(logger.error)
```

## Behavior Debugging

1. Define "expected" vs "actual" **precisely** — vague problem statements lead to wrong fixes
2. Identify the entry point and trace execution forward:
   - **Small, isolated function** → write a focused test that demonstrates the bad behavior; run it in isolation
   - **Large or stateful system** → add targeted logging at key decision points and reproduce the problem
3. Run `tools/log-filter.ts` if existing logs are available — filter to the relevant request ID or timestamp
4. Narrow the scope — which layer produces the wrong output?
   - **Data coming in wrong** → trace back to the source (API response, database query, user input parsing)
   - **Transformation is wrong** → isolate the transformation function and call it directly with the bad input
   - **Output is wrong** → check serialization, rendering, or display logic — the data may be correct but displayed incorrectly
5. For async/concurrent behavior, instrument state transitions:
   ```ts
   console.log('[fetchUser] start', { id })
   const user = await db.query(...)
   console.log('[fetchUser] result', { user })
   ```
   Look for unexpected ordering — a log appearing before or after you expect it almost always points to a missing `await` or a race.
6. Once the bad line is found, read the surrounding logic to understand **why the author wrote it that way** before changing it — the "fix" might break something else

## Flaky Issue

1. Gather at least 3 failure examples — look for patterns in timing, data, or environment
2. Check for:
   - **Race conditions** → concurrent operations, event ordering, unguarded shared state
     - Look for: `Promise.all` where one branch mutates shared state, event listeners that fire in non-deterministic order, timers
   - **External dependencies** → network calls, clock-dependent logic (`Date.now()`, `new Date()`), random values
   - **Test isolation** → does the test pass in isolation but fail in the full suite? Shared state is leaking between tests
     - Look for: module-level singletons, database state not reset between tests, global mocks not restored
3. Add **deterministic logging** around the flaky section to capture state at failure time — include timestamps and any relevant IDs
4. If time-dependent: freeze the clock in tests using a test double; never let tests depend on wall-clock time
5. If order-dependent: force a specific execution order and verify it stabilizes; then make the code order-independent

### Race condition pattern

```ts
// ❌ classic race: two async paths writing to the same slot
let result: User | null = null
fetchFromCache(id).then(u => { result = u })
fetchFromDB(id).then(u => { result = u })   // whichever resolves last wins

// ✅ explicit ordering — or use Promise.race / Promise.any with intent
const result = await fetchFromCache(id) ?? await fetchFromDB(id)
```

## Regression Bisect

1. Confirm the last known good commit: `git log --oneline` to identify a candidate
2. Use `tools/bisect-runner.ts <test-command>` to automate the bisect; this runs `git bisect` with the given test as the oracle
3. Once the bad commit is identified, read its diff: `git show <hash>`
4. Identify the specific change that introduced the regression:
   - **Intentional behavior change** → the expectation or test was wrong; update accordingly
   - **Unintentional side effect** → the commit changed something it shouldn't have — fix it to restore original behavior while keeping the intended change
5. If automated bisect is not possible (no test for the behavior), bisect manually:
   ```sh
   git bisect start
   git bisect bad HEAD
   git bisect good <known-good-hash>
   # git checks out midpoints; test each, then mark:
   git bisect good   # or: git bisect bad
   # repeat until git identifies the first bad commit
   git bisect reset
   ```

## Log Analysis

1. Run `tools/log-filter.ts --request-id <id>` or `--timestamp <ts>` to narrow to relevant entries
2. Look for **ERROR** and **WARN** lines first — they are the most actionable
3. Reconstruct the sequence of events: what happened, in what order?
4. Identify where the sequence **diverges from the expected happy path** — the log entry just before the divergence is the best starting point
5. For structured logs (JSON), filter by relevant fields: `service`, `userId`, `traceId`; correlate across services using a shared trace ID
6. If logs are insufficient, instrument the relevant code path and reproduce:
   - Add log lines at each branch point with enough context to distinguish paths
   - Include identifiers (request ID, user ID, entity ID) so you can filter later
   - Remove debug logs once the issue is understood

## Performance Issue

1. **Measure before guessing** — never optimize without data
   - For web: use browser DevTools Performance tab or Lighthouse
   - For server: profile with `--prof` (Node) or use `tools/perf-trace.ts` for flamegraphs
   - For React Native: use the Hermes profiler in Flipper or Metro dev tools
2. Identify the bottleneck category:
   - **CPU-bound** → a function is doing too much work per call; look for O(n²) loops, redundant computation, unneeded serialization
   - **I/O-bound** → waiting on DB, network, or filesystem; look for N+1 queries, sequential awaits that could be parallel
   - **Memory** → excessive allocations, retained references, large data structures held longer than needed
   - **Render/layout** → too many re-renders, layout thrashing, unoptimized images
3. Fix the category root cause:
   - **N+1 queries** → batch with `IN (...)` or use a join instead of per-item fetches
   - **Sequential awaits** → parallelize independent calls with `Promise.all`
   - **Repeated computation** → memoize or cache; compute once and store
   - **Too many re-renders** → check unstable references (inline objects/functions in JSX), missing `memo` or `useMemo`
4. Measure again after the fix — confirm the improvement is real and no regression was introduced

### Common patterns

```ts
// ❌ N+1: one DB query per user
const posts = await db.query('SELECT * FROM posts')
for (const post of posts) {
  post.author = await db.query('SELECT * FROM users WHERE id = ?', post.userId)
}

// ✅ batch: two queries total
const posts = await db.query('SELECT * FROM posts')
const userIds = [...new Set(posts.map(p => p.userId))]
const users = await db.query('SELECT * FROM users WHERE id IN (?)', userIds)
const userMap = Object.fromEntries(users.map(u => [u.id, u]))
for (const post of posts) {
  post.author = userMap[post.userId]
}
```

```ts
// ❌ sequential: takes sum of all durations
const profile = await fetchProfile(id)
const posts = await fetchPosts(id)
const followers = await fetchFollowers(id)

// ✅ parallel: takes duration of the slowest
const [profile, posts, followers] = await Promise.all([
  fetchProfile(id),
  fetchPosts(id),
  fetchFollowers(id),
])
```

## Key references

| File | What it covers |
|---|---|
| `tools/stacktrace-parse.ts` | Parse and enrich stack traces with source context |
| `tools/log-filter.ts` | Extract and correlate log entries by timestamp or request ID |
| `tools/repro-scaffold.ts` | Generate a minimal reproduction script from an error report |
| `tools/bisect-runner.ts` | Automate git bisect with a test command |
| `tools/perf-trace.ts` | Generate CPU flamegraphs for performance profiling |
