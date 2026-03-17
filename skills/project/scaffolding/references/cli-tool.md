# CLI Tool

CLI tools as standalone packages or workspace crates. Bun for scripting tools, Rust for performance-sensitive or distributed binaries.

## Choosing a runtime

- Simple scripting, codegen, or dev tooling → **Bun**
- Performance-sensitive, system-level, or distributed binary → **Rust**
- Fast startup and single binary for non-developers → **Rust**
- Internal dev tool in a bun workspace → **Bun**

## Bun CLI setup

```json
{
  "name": "@<project>/cli",
  "type": "module",
  "bin": { "<tool-name>": "src/index.ts" },
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts --compile --outfile dist/<tool-name>"
  }
}
```

### Argument parsing

Simple (1-3 flags): `Bun.argv.slice(2)` with manual parsing.

Complex (subcommands): use `citty`:

```ts
import { defineCommand, runMain } from "citty";
const main = defineCommand({
  meta: { name: "my-tool", description: "Does things" },
  args: { name: { type: "positional" }, template: { type: "string", default: "default" } },
  run({ args }) { console.log(`Creating ${args.name}`); },
});
runMain(main);
```

## Rust CLI setup

```toml
[dependencies]
clap = { version = "4", features = ["derive"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

Use clap derive for args. Binary crate depends on library crates — keep business logic out of CLI crate.

## Output formatting

All CLIs support two modes:
1. **Human-readable** (default) — formatted text
2. **JSON** (`--json` flag) — structured data for piping

## Error handling

- Print errors to stderr, not stdout
- Exit with non-zero code on failure
- Bun: `console.error(msg); process.exit(1)`
- Rust: use `anyhow`, print with `eprintln!`

## Tools

| Tool | Purpose |
|---|---|
| `tools/cli-scaffold.ts` | Generate a new Bun CLI project with arg parsing |
| `tools/command-list.ts` | List all subcommands in a Bun or Rust CLI |
