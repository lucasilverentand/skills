---
name: cli-tool
description: Sets up and maintains CLI tool packages built with Bun or Rust. Handles argument parsing, subcommands, output formatting, help text, and workspace integration. Use when creating a new CLI tool, adding subcommands, choosing between Bun and Rust for a CLI, or scaffolding a CLI project.
allowed-tools: Read Write Edit Glob Grep Bash
---

# CLI Tool

CLI tools live as standalone packages or workspace crates. Choose the runtime based on the use case — Bun for quick scripting tools, Rust for performance-sensitive or system-level tools.

## Decision Tree

- What are you doing?
  - **Creating a new CLI tool** → which kind?
    - **Simple scripting, codegen, or developer tooling** → Bun CLI, see "Bun CLI setup" below
    - **Performance-sensitive, system-level, or distributed binary** → Rust CLI, see "Rust CLI setup" below
    - **Not sure** → answer these:
      - Does it need to be fast at startup and runtime? → Rust
      - Does it need to ship as a single binary to non-developers? → Rust
      - Is it an internal dev tool used in a bun workspace? → Bun
      - Does it mostly orchestrate other tools or APIs? → Bun
  - **Adding a subcommand** → see "Adding subcommands" below
  - **Adding output formatting** → see "Output formatting" below
  - **Listing commands in an existing CLI** → run `tools/command-list.ts`
  - **Scaffolding a new Bun CLI** → run `tools/cli-scaffold.ts <name>`

## Bun CLI setup

1. Create the package directory (e.g. `packages/cli/` or standalone repo)
2. Add `package.json`:
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
3. Create `src/index.ts` — entry point with arg parsing
4. Use `Bun.argv.slice(2)` for simple CLIs, or `commander` / `citty` for complex ones

### Argument parsing

For simple tools (1-3 flags), parse manually:

```ts
const args = Bun.argv.slice(2);
const flags = {
  json: args.includes("--json"),
  help: args.includes("--help"),
  verbose: args.includes("--verbose"),
};
const positional = args.filter((a) => !a.startsWith("--"));
```

For tools with subcommands, use a library:

```ts
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: { name: "my-tool", description: "Does things" },
  args: {
    name: { type: "positional", description: "Project name" },
    template: { type: "string", default: "default" },
  },
  run({ args }) {
    console.log(`Creating ${args.name} with template ${args.template}`);
  },
});

runMain(main);
```

### Directory structure (Bun)

```
packages/cli/
  src/
    index.ts          # entry point, arg parsing
    commands/          # one file per subcommand
    lib/               # shared helpers
  package.json
  tsconfig.json
```

## Rust CLI setup

1. Create a new crate: `cargo init <tool-name>` or add to workspace
2. Add clap to `Cargo.toml`:
   ```toml
   [dependencies]
   clap = { version = "4", features = ["derive"] }
   serde = { version = "1", features = ["derive"] }
   serde_json = "1"
   ```
3. Define CLI args with clap derive:

```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "my-tool", about = "Does things")]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// Output as JSON
    #[arg(long)]
    json: bool,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new project
    Init {
        /// Project name
        name: String,
        /// Template to use
        #[arg(short, long, default_value = "default")]
        template: String,
    },
}
```

### Directory structure (Rust)

Single crate:
```
my-tool/
  src/
    main.rs           # entry point, clap parsing
    commands/          # mod per subcommand
      mod.rs
      init.rs
    lib.rs             # shared logic
  Cargo.toml
```

Workspace with multiple crates:
```
my-tool/
  Cargo.toml           # workspace root
  crates/
    cli/               # binary crate — clap, UI, orchestration
    core/              # library crate — business logic
    config/            # library crate — configuration handling
```

- Binary crate depends on library crates — keep business logic out of the CLI crate
- Use `[workspace.dependencies]` for shared dependency versions

## Adding subcommands

### Bun (citty)

Create `src/commands/<name>.ts`:

```ts
import { defineCommand } from "citty";

export const migrate = defineCommand({
  meta: { name: "migrate", description: "Run database migrations" },
  args: {
    dry: { type: "boolean", description: "Show SQL without executing" },
  },
  run({ args }) {
    // implementation
  },
});
```

Register in the main command:

```ts
const main = defineCommand({
  subCommands: { migrate, init, generate },
});
```

### Rust (clap)

Add a variant to the `Commands` enum and a handler module in `src/commands/`.

## Output formatting

All CLIs support two output modes:

1. **Human-readable** (default) — formatted text for terminal
2. **JSON** (`--json` flag) — structured data for piping

```ts
// Bun pattern
if (flags.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Found ${result.count} items:`);
  for (const item of result.items) {
    console.log(`  - ${item.name}`);
  }
}
```

```rust
// Rust pattern
if cli.json {
    println!("{}", serde_json::to_string_pretty(&result)?);
} else {
    println!("Found {} items:", result.len());
    for item in &result {
        println!("  - {}", item.name);
    }
}
```

## Help text

Every CLI must have `--help` that shows:
- Tool name and one-line description
- Usage syntax
- Arguments (positional)
- Options (flags)
- Examples (at least one)

## Error handling

- Print errors to stderr, not stdout
- Exit with non-zero code on failure
- Bun: `console.error(msg); process.exit(1)`
- Rust: use `anyhow` for error propagation, print with `eprintln!`

## Key references

| File | What it covers |
|---|---|
| `tools/command-list.ts` | List all subcommands in a Bun or Rust CLI project |
| `tools/cli-scaffold.ts` | Generate a new Bun CLI project with arg parsing boilerplate |
