# Debugging

Systematic root cause analysis and log analysis for diagnosing issues.

## Responsibilities

- Perform systematic root cause analysis
- Analyze logs to diagnose issues
- Reproduce failures from error reports and stack traces
- Bisect commits to isolate regressions
- Instrument code with targeted logging for diagnosis

## Tools

- `tools/stacktrace-parse.ts` — parse and enrich stack traces with source context and file links
- `tools/log-filter.ts` — extract and correlate relevant log entries around a given timestamp or request ID
- `tools/repro-scaffold.ts` — generate a minimal reproduction script from an error report
- `tools/bisect-runner.ts` — automate git bisect with a provided test command
