# Tool Conventions

Every skill can include a `tools/` directory containing bun scripts. Run them with `bun run tools/<name>.ts` from the skill directory.

## Location

Tools live in `tools/` inside each skill directory:

```
skills/<category>/<skill>/
├── PURPOSE.md
├── SKILL.md
├── tools/
│   ├── some-tool.ts
│   └── another-tool.ts
└── references/
```

## Arguments

Use `Bun.argv` directly — no argument parsing libraries:

```ts
const args = Bun.argv.slice(2);
```

## Output

- Default to human-readable plain text or markdown on stdout
- Support a `--json` flag that switches to structured JSON output
- This lets tools work for both humans reading output and scripts consuming it

## Error handling

- Errors go to stderr via `console.error()`
- Success output goes to stdout via `console.log()`
- Exit with non-zero code on failure: `process.exit(1)`
- Exit 0 on success (implicit)

## Help

Every tool prints a usage banner when called with `--help` or when required args are missing. The banner includes the tool name, a one-line description, and usage syntax.

## Dependencies

Tools are zero-dependency — only bun built-in APIs and node stdlib. No npm packages, no shared internal imports. Each script is fully self-contained.
