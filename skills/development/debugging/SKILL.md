---
name: debugging
description: Performs systematic root cause analysis and log analysis for diagnosing issues. Use when the user encounters errors, unexpected behavior, test failures, stack traces, regressions, or needs to trace through code to find the underlying cause of a problem. Trigger phrases: "not working", "broken", "error", "crash", "why is this failing", "something is wrong", "unexpected behavior".
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

## Error Analysis

1. Run `tools/stacktrace-parse.ts <trace>` to enrich the stack trace with source context
2. Identify the top frame that belongs to the project (not a framework or runtime)
3. Read the source at that location — understand what it expected vs. what it got
4. Work backwards: what called this? What state was it in?
   - **Error is in a dependency** → check the version, look for known issues, read the call site
   - **Error is in project code** → identify the bad assumption (null check, type mismatch, wrong branch)
5. Form a hypothesis: "this fails because X when Y"
6. Verify by reading the path that leads to the failure — do not guess
7. Fix the root cause, not just the symptom

## Behavior Debugging

1. Define "expected" vs "actual" precisely — vague problem statements lead to wrong fixes
2. Identify the entry point and trace execution forward
   - **Small, isolated function** → write a focused test that demonstrates the bad behavior
   - **Large or stateful system** → add targeted logging at key decision points
3. Run `tools/log-filter.ts` if existing logs are available — filter to the relevant request ID or timestamp
4. Narrow the scope: which layer produces the wrong output?
   - **Data coming in wrong** → trace back to the source (API, database, user input)
   - **Transformation is wrong** → isolate the transformation function and test it directly
   - **Output is wrong** → check serialization, rendering, or display logic
5. Once the bad line is found, read the surrounding logic to understand why the author wrote it that way before changing it

## Flaky Issue

1. Gather at least 3 failure examples — look for patterns in timing, data, or environment
2. Check for:
   - **Race conditions** → concurrent operations, event ordering, unguarded shared state
   - **External dependencies** → network calls, clock-dependent logic, random values
   - **Test isolation** → does the test pass in isolation but fail in suite? Shared state leak.
3. Add deterministic logging around the flaky section to capture state at failure time
4. If time-dependent: freeze the clock in tests using a test double
5. If order-dependent: force a specific execution order and verify it stabilizes

## Regression Bisect

1. Confirm the last known good commit: `git log --oneline` to find a candidate
2. Use `tools/bisect-runner.ts <test-command>` to automate the bisect
3. Once the bad commit is found, read its diff: `git show <hash>`
4. Identify the specific change that introduced the regression
   - **Intentional behavior change** → the test or expectation was wrong, update accordingly
   - **Unintentional side effect** → fix the change to preserve original behavior

## Log Analysis

1. Run `tools/log-filter.ts --request-id <id>` or `--timestamp <ts>` to narrow to relevant entries
2. Look for ERROR and WARN lines first — they are the most actionable
3. Reconstruct the sequence of events: what happened, in what order?
4. Identify where the sequence diverges from the expected happy path
5. If logs are insufficient, instrument the relevant code path and reproduce

## Key references

| File | What it covers |
|---|---|
| `tools/stacktrace-parse.ts` | Parse and enrich stack traces with source context |
| `tools/log-filter.ts` | Extract and correlate log entries by timestamp or request ID |
| `tools/repro-scaffold.ts` | Generate a minimal reproduction script from an error report |
| `tools/bisect-runner.ts` | Automate git bisect with a test command |
