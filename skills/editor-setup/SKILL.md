---
name: editor-setup
description: Configures editors and IDEs including VS Code, Zed, Neovim, and Xcode. Use when the user wants to set up an editor, configure settings, manage extensions or plugins, set up language servers or formatters, configure debugging, manage code signing (Xcode), or sync settings across machines or team members. Trigger phrases include any editor name, "settings.json", "launch.json", "tasks.json", "extension", "plugin", "LSP", "language server", "formatter", "keybinding", "debug config", "signing", "scheme", "xcodeproj".
allowed-tools: Read Grep Glob Bash Write Edit
---

# Editor Setup

Global, non-project-specific editor configuration and tooling for VS Code, Zed, Neovim, and Xcode.

## Decision Tree

- Which editor?
  - **VS Code** → see "VS Code" below
  - **Zed** → see "Zed" below
  - **Neovim** → see "Neovim" below
  - **Xcode** → see "Xcode" below
  - **Not sure / general** → ask the user which editor they use

---

## VS Code

### What do you need?

- **Configure workspace settings** → see "VS Code Settings"
- **Add or audit extensions** → run `tools/vscode-extension-audit.ts`
- **Generate tasks from package.json** → run `tools/vscode-task-gen.ts`
- **Create or update a debug launch config** → see "VS Code Launch Configs"
- **Sync settings with a team template** → run `tools/vscode-settings-merge.ts`

### VS Code Settings

Three scopes (highest priority wins):
1. **Workspace** `.vscode/settings.json` — committed, shared with the team
2. **User** `~/Library/Application Support/Code/User/settings.json` — personal
3. **Default** — built-in

Workspace settings (committed): formatter, linter, language associations, extension recommendations (`.vscode/extensions.json`).
User settings: appearance (font, theme, zoom), editor behavior, personal tool paths.

### VS Code Extensions

Recommended for TypeScript/Bun projects:
- `biomejs.biome` — formatting and linting (replaces ESLint + Prettier)
- `bradlc.vscode-tailwindcss` — Tailwind IntelliSense
- `ms-vscode.vscode-typescript-next` — latest TypeScript language service
- `eamodio.gitlens` — git blame and history

Document in `.vscode/extensions.json`:
```json
{
  "recommendations": ["biomejs.biome", "bradlc.vscode-tailwindcss"]
}
```

### VS Code Launch Configs

Debug configurations live in `.vscode/launch.json`.

Bun script:
```json
{
  "type": "bun",
  "request": "launch",
  "name": "Run script",
  "program": "${file}"
}
```

Attach to Bun/Node:
```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Bun",
  "port": 9229
}
```

### VS Code Keybindings

User keybindings: `~/Library/Application Support/Code/User/keybindings.json`. Keybindings are always user-scoped (no workspace keybindings).

---

## Zed

### What do you need?

- **Configure settings** → see "Zed Settings"
- **Add or update extensions** → see `references/zed-extensions.md`
- **Set up a language server or formatter** → see `references/zed-lsp-configs.md`
- **Customize keybindings** → see "Zed Keybindings"
- **Sync settings with a team template** → run `tools/zed-settings-merge.ts`
- **Check LSP status** → run `tools/zed-lsp-status.ts`
- **Audit extensions** → run `tools/zed-extension-check.ts`
- **Troubleshoot** → see "Zed Troubleshooting"

### Zed Settings

Two layers:
- **Global**: `~/.config/zed/settings.json` — personal defaults
- **Project**: `.zed/settings.json` — committed, shared

Project settings override global. Put shared formatter/LSP config in project settings, personal preferences in global.

Core global settings:
```json
{
  "theme": "One Dark",
  "buffer_font_family": "Berkeley Mono",
  "buffer_font_size": 14,
  "format_on_save": "on",
  "tab_size": 2,
  "soft_wrap": "editor_width",
  "inlay_hints": { "enabled": true },
  "terminal": { "shell": { "program": "/bin/zsh" } },
  "git": { "inline_blame": { "enabled": true } },
  "telemetry": { "diagnostics": false, "metrics": false }
}
```

### Zed Extensions Quick Picks

| Stack | Extensions |
|---|---|
| TypeScript/Bun | `biome`, `tailwindcss`, `toml`, `dockerfile`, `sql`, `env` |
| Rust | `toml`, `dockerfile` |
| Swift/iOS | `swift` |
| Python | `ruff`, `basedpyright`, `toml` |
| General | `git-firefly`, `html`, `csv`, `env` |

Full list: `references/zed-extensions.md`. Per-language LSP configs: `references/zed-lsp-configs.md`.

### Zed Keybindings

Keybindings live in `~/.config/zed/keymap.json`. Each entry maps a keystroke to a command in a context:

```json
[
  {
    "context": "Editor",
    "bindings": {
      "cmd-shift-d": "editor::DuplicateLineDown",
      "cmd-shift-k": "editor::DeleteLine",
      "cmd-shift-l": "editor::SelectAllMatches"
    }
  },
  {
    "context": "Workspace",
    "bindings": {
      "cmd-\\": "workspace::ToggleLeftDock",
      "cmd-j": "workspace::ToggleBottomDock"
    }
  }
]
```

Find command names: open command palette (`Cmd+Shift+P`) or check `zed: open default keymap`.

### Zed File Scan Exclusions

For large repos, exclude directories from indexing:
```json
{
  "file_scan_exclusions": [
    "**/.git", "**/node_modules", "**/target", "**/.next", "**/dist"
  ]
}
```

### Zed Troubleshooting

- **LSP not starting** → check `View > Toggle Log` for errors, verify the server is installed
- **Formatter not running** → verify `"format_on_save": "on"` and formatter config matches the file type
- **Extension not loading** → restart Zed, check Extensions panel for error badges
- **Slow performance** → disable unused extensions, add large dirs to `file_scan_exclusions`

---

## Neovim

### What do you need?

- **Add or configure a plugin** → see `references/nvim-plugin-configs.md`
- **Set up LSP for a language** → see `references/nvim-lsp-configs.md`
- **Set up debugging (DAP)** → see `references/nvim-dap-configs.md`
- **Audit plugin health** → run `tools/nvim-plugin-audit.ts`
- **Check LSP status** → run `tools/nvim-lsp-check.ts`
- **Diff config against a backup** → run `tools/nvim-config-diff.ts`
- **Diagnose an issue** → see "Neovim Troubleshooting"

### Neovim Config Structure

Config lives at `~/.config/nvim/`. Plugins are managed with lazy.nvim -- each spec goes in `lua/plugins/`.

### Neovim Plugin Stack

| Plugin | Purpose | Lazy-load |
|---|---|---|
| `nvim-lspconfig` + Mason | LSP management | -- |
| `nvim-cmp` | Completion | `InsertEnter` |
| `nvim-treesitter` | Syntax, indentation, text objects | `BufReadPost` |
| `telescope.nvim` | Fuzzy finder | `cmd` / `keys` |
| `conform.nvim` | Formatting | `BufWritePre` |
| `gitsigns.nvim` | Git signs, hunk navigation | `BufReadPost` |
| `oil.nvim` | File explorer | `keys` |
| `which-key.nvim` | Keybinding hints | `VeryLazy` |
| `mini.nvim` | Pairs, surround, comment | various |

Full specs: `references/nvim-plugin-configs.md`.

### Neovim Formatting

Use conform.nvim for format on save with external formatters (Biome, rustfmt, gofumpt, etc.) instead of LSP formatting:

```lua
return {
  "stevearc/conform.nvim",
  event = "BufWritePre",
  opts = {
    formatters_by_ft = {
      typescript = { "biome" },
      typescriptreact = { "biome" },
      javascript = { "biome" },
      json = { "biome" },
      lua = { "stylua" },
      python = { "ruff_format" },
      go = { "gofumpt" },
      rust = { "rustfmt" },
    },
    format_on_save = { timeout_ms = 2000, lsp_fallback = true },
  },
}
```

### Neovim LSP Keybindings

| Key | Action |
|---|---|
| `gd` | Go to definition |
| `gr` | Go to references |
| `K` | Hover documentation |
| `<leader>ca` | Code action |
| `<leader>rn` | Rename symbol |
| `[d` / `]d` | Previous / next diagnostic |

### Neovim Config Sync

- Keep config in a dotfiles repo, symlink to `~/.config/nvim`
- Use `tools/nvim-config-diff.ts` to compare local state against remote/backup
- Commit `lazy-lock.json` for reproducible plugin versions across machines
- Machine-specific overrides: `lua/local.lua` excluded by `.gitignore`

### Neovim Troubleshooting

1. `:checkhealth` — covers providers, plugins, LSP
2. `:messages` or `nvim --startuptime /tmp/nvim-startup.log` — startup errors
3. `tools/nvim-plugin-audit.ts` — detect plugin conflicts
4. `nvim --clean` — isolate config issues
5. `:Lazy log` — plugin errors

Common issues:
- **LSP not attaching** → `:LspInfo`, check `root_dir` pattern, check `:Mason` install status
- **No completions** → verify nvim-cmp sources include `nvim_lsp`, check `capabilities` passed to LSP
- **Formatter not running** → check conform.nvim config, verify formatter binary is installed
- **Slow startup** → profile with `nvim --startuptime`, lazy-load more plugins

---

## Xcode

### What do you need?

- **Configure a target or scheme** → see "Xcode Targets and Schemes"
- **Set up code signing** → run `tools/xcode-signing-check.ts`
- **Inspect or fix build settings** → run `tools/xcode-build-settings-diff.ts <scheme1> <scheme2>`
- **Detect .xcodeproj issues** → run `tools/xcodeproj-lint.ts`

### Xcode Targets and Schemes

- **Target** — a build product (app, framework, test bundle, extension)
- **Scheme** — defines build/run/test/archive actions for a target

When adding a target: set bundle identifier, deployment target, and Swift version consistently. Verify with `tools/xcode-build-settings-diff.ts` against an existing target.

### Xcode Code Signing

Signing requires: a certificate, a provisioning profile, and a matching bundle ID.

1. Check current state: `tools/xcode-signing-check.ts`
2. Development: use "Automatically manage signing" (team account required)
3. CI/distribution: use manual signing with certificates in keychain or `CERTIFICATE_BASE64` env var, profiles from developer.apple.com or `fastlane match`

Common errors:
- **"No profiles for bundle ID"** → bundle ID mismatch or profile not downloaded
- **"Certificate has expired"** → renew on developer.apple.com
- **"Entitlements do not match"** → capabilities in app and profile are out of sync

### Xcode Build Settings

Build settings cascade: project defaults -> target overrides -> configuration overrides.

- Keep configuration-specific settings (API URLs, feature flags) in `.xcconfig` files
- Key settings to standardize: `SWIFT_VERSION` (6.2), `IPHONEOS_DEPLOYMENT_TARGET`, `ENABLE_STRICT_CONCURRENCY_CHECKING` (complete)

### Xcode Swift Packages

For Xcode projects: dependencies stored in `project.xcworkspace/xcshareddata/swiftpm/` -- commit this directory. For zero-dependency philosophy: prefer in-tree code over packages where practical.

---

## Key References

| File | What it covers |
|---|---|
| `references/zed-lsp-configs.md` | Per-language Zed LSP config: TypeScript, Rust, Python, Go, Swift, Lua, Tailwind |
| `references/zed-extensions.md` | Zed extension recommendations by stack, built-in vs extension support |
| `references/nvim-lsp-configs.md` | Per-language Neovim LSP config: TypeScript, Rust, Python, Go, Swift, Lua, Tailwind |
| `references/nvim-plugin-configs.md` | Full lazy.nvim specs: LSP, completion, treesitter, telescope, conform, git, oil, mini.nvim |
| `references/nvim-dap-configs.md` | Debug adapter configs: TypeScript/Node, Rust, Go, Python, DAP UI layout |
| `tools/vscode-extension-audit.ts` | List VS Code extensions, flag deprecated or conflicting ones |
| `tools/vscode-settings-merge.ts` | Merge workspace settings from a team template |
| `tools/vscode-task-gen.ts` | Generate tasks.json from package.json scripts and Makefiles |
| `tools/zed-extension-check.ts` | List installed Zed extensions and check for updates |
| `tools/zed-lsp-status.ts` | Verify Zed language servers are configured and running |
| `tools/zed-settings-merge.ts` | Merge Zed project settings from a team template |
| `tools/nvim-plugin-audit.ts` | Check for outdated, unused, or conflicting Neovim plugins |
| `tools/nvim-lsp-check.ts` | Verify LSP servers are installed and configured for the project |
| `tools/nvim-config-diff.ts` | Diff local Neovim config against a remote or backup |
| `tools/xcode-build-settings-diff.ts` | Compare Xcode build settings between two schemes or targets |
| `tools/xcode-signing-check.ts` | Verify code signing and provisioning profiles |
| `tools/xcodeproj-lint.ts` | Detect common .xcodeproj issues |
