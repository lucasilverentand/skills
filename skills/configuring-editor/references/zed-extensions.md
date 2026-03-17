# Zed Extensions Reference

Extensions add language support, themes, and tools to Zed. Install via the Extensions panel (`Cmd+Shift+X`) or `zed: install extension` in the command palette.

## Recommended Extensions by Stack

### TypeScript / Bun / Web

| Extension | Purpose |
|---|---|
| `biome` | Formatting + linting via Biome LSP |
| `html` | HTML language support |
| `sql` | SQL syntax and completions |
| `toml` | TOML syntax (for config files) |
| `dockerfile` | Dockerfile syntax |
| `env` | `.env` file syntax highlighting |
| `csv` | CSV file viewer |
| `tailwindcss` | Tailwind class completions and hover |
| `astro` | Astro component support |

### Rust

| Extension | Purpose |
|---|---|
| `toml` | TOML syntax for `Cargo.toml` |
| `dockerfile` | Dockerfile syntax |

Rust support (rust-analyzer) is built into Zed — no extension needed.

### Swift / iOS

| Extension | Purpose |
|---|---|
| `swift` | Swift language support via SourceKit-LSP |

### Python

| Extension | Purpose |
|---|---|
| `basedpyright` | Type checking and completions (strict pyright fork) |
| `ruff` | Fast linting and formatting |
| `toml` | TOML for `pyproject.toml` |

### Go

| Extension | Purpose |
|---|---|
| `dockerfile` | Dockerfile syntax |

Go support (gopls) is built into Zed — no extension needed.

### DevOps / Infrastructure

| Extension | Purpose |
|---|---|
| `dockerfile` | Dockerfile syntax |
| `toml` | TOML syntax |
| `yaml` | YAML syntax |
| `terraform` | Terraform/HCL support |

### General (always install)

| Extension | Purpose |
|---|---|
| `git-firefly` | Enhanced git annotations and blame |
| `env` | `.env` file highlighting |
| `csv` | CSV viewer |
| `html` | HTML support |

## Extension Management

### Installing

- Command palette: `zed: install extension` and search by name
- Extensions panel: `Cmd+Shift+X`, search, click Install

### Updating

Extensions auto-update by default. To pin a version or disable auto-update, check the extension's settings in the Extensions panel.

### Removing

Open the Extensions panel, find the extension, click Uninstall.

### Browsing Available Extensions

- In-editor: Extensions panel search
- Online: `zed.dev/extensions`

## Extension vs Built-in Support

Zed has built-in support for many languages without extensions:

| Language | Built-in | Extension needed |
|---|---|---|
| TypeScript/JavaScript | Yes (tsserver) | `biome` for formatting |
| Rust | Yes (rust-analyzer) | No |
| Go | Yes (gopls) | No |
| Python | Partial | `basedpyright` + `ruff` |
| Swift | Partial | `swift` |
| HTML/CSS | Partial | `html` for full support |
| JSON | Yes | No |
| Markdown | Yes | No |
| TOML | No | `toml` |
| YAML | Partial | `yaml` for full support |
| Dockerfile | No | `dockerfile` |

## Troubleshooting Extensions

- **Extension not loading**: restart Zed (`Cmd+Q` and reopen)
- **Extension conflicts**: disable one at a time to isolate
- **Language server from extension not starting**: check the Zed log (`View > Toggle Log`) for binary not found errors
- **Stale extension cache**: `Cmd+Shift+P` → `zed: clear extension cache`
