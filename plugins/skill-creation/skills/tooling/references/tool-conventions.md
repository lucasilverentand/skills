# Tool Conventions

How tools are built in this repo. These conventions aren't arbitrary — they exist because tools are consumed by agents that need predictable interfaces, and by humans who need to debug them.

## Runtime and dependencies

**Bun only.** Tools are TypeScript scripts run with `bun run`. No compilation step, no bundling. Use `Bun.argv`, `Bun.Glob`, and other bun built-ins where they fit.

**Zero external dependencies.** Only bun built-ins and node stdlib (`node:fs`, `node:path`, `node:os`, `node:child_process`). This keeps tools portable and eliminates version management. If a task needs a library, that's a sign it might be too complex for a skill tool — or that the approach needs rethinking.

**Dynamic imports for node stdlib.** Use `await import("node:fs")` inside `main()` rather than top-level imports. This keeps the arg-parsing and help-text path fast and dependency-free.

## Interface contract

Every tool supports these flags:

| Flag     | Behavior                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `--help` | Print usage information and exit 0. Also triggered when no arguments are given (for tools that require arguments).                      |
| `--json` | Output structured JSON instead of human-readable text. The JSON structure should mirror the human output — same data, different format. |

Errors go to `stderr` via `console.error()`. Successful output goes to `stdout`. Exit code 0 on success, 1 on failure. Never mix error messages into stdout — the agent parses stdout.

## Argument parsing

Parse `Bun.argv.slice(2)` manually. No arg-parsing libraries. The pattern:

1. Check for `--help` first
2. Extract boolean flags (filter args starting with `--`)
3. Remaining positional args are the tool's inputs
4. Validate required args are present — if missing, print an error message and exit 1

Tools that take key-value flags (like `--days 7`) use a simple index-based lookup: find the flag, take the next element. No need for a framework.

## Help text

The `HELP` constant is a template-literal string that covers:

- Tool name and one-line description
- Usage line with required args and `[options]`
- Options list with descriptions
- No examples section — the usage line and option descriptions should be self-explanatory

## Output structure

**Human-readable mode (default):** Labeled lines, indented sub-items, section headers for grouped results. Prefix result lines with status indicators: `[ok]`, `[WARN]`, `[FAIL]` for validation tools. End with a summary line.

**JSON mode (`--json`):** A single `JSON.stringify(result, null, 2)` call. The top-level object should include both the data and summary metadata (counts, totals, pass/fail status). Use typed interfaces for the result structure — define them at the top of the file.

## Error handling

Wrap the main logic in an async `main()` function with a `.catch()` at the bottom that prints the error message and exits 1. Inside `main()`, validate inputs early and fail fast with clear error messages. Don't catch errors mid-flow to continue — if something unexpected happens, let it surface.

## Type definitions

Define TypeScript interfaces for structured data at the top of the file, after the arg parsing setup. Use them for tool results, findings, check items — anything that gets serialized to JSON. This makes the output contract explicit and catches structural mistakes at write time.

## Quality checklist

When reviewing or improving a tool, check:

- [ ] Runs with `--help` and produces clear usage information
- [ ] Runs with `--json` and produces valid, parseable JSON
- [ ] Fails cleanly with missing arguments (error message, exit 1)
- [ ] No external dependencies beyond bun built-ins and node stdlib
- [ ] Errors go to stderr, output goes to stdout
- [ ] Exit code is 0 on success, 1 on failure
- [ ] Type interfaces defined for structured output
- [ ] Actually earns its place — not a thin wrapper
