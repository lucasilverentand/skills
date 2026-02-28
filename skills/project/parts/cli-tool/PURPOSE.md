# CLI Tool

CLI tool packages: Bun for scripting tools, Rust for performance-sensitive tools.

## Responsibilities

- Choose between Bun and Rust based on use case
- Set up argument parsing and subcommand structure
- Configure output formatting (human-readable and JSON)
- Write help text and error handling
- Structure CLI projects for workspace integration
- Set up Rust workspace crate layouts for multi-crate CLIs

## Tools

- `tools/command-list.ts` — list all subcommands in a Bun or Rust CLI project with descriptions
- `tools/cli-scaffold.ts` — generate a new Bun CLI project with argument parsing boilerplate
