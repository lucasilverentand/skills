---
name: zed
description: Manages Zed editor settings, extensions, language server configuration, keybindings, themes, and workflow optimization. Use when the user wants to configure Zed, add or update extensions, set up a language server or formatter, customize keybindings or panels, sync settings across projects or machines, or troubleshoot Zed issues.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Zed

## Decision Tree

- What do you need to do?
  - **Configure global or project settings** → see "Settings" below
  - **Add or update extensions** → see "Extensions" below, full list in `references/extensions.md`
  - **Set up a language server or formatter** → see `references/lsp-configs.md` for per-language configs
  - **Customize keybindings** → see "Keybindings" below
  - **Adjust theme or panel layout** → see "Theme and layout" below
  - **Optimize Zed for a specific stack** → see "Stack-specific config" below
  - **Sync settings with a team template** → run `tools/zed-settings-merge.ts`
  - **Check LSP status for the current project** → run `tools/zed-lsp-status.ts`
  - **Audit installed extensions** → run `tools/zed-extension-check.ts`
  - **Troubleshoot an issue** → see "Troubleshooting" below

## Settings

Zed has two layers of settings:
- **Global**: `~/.config/zed/settings.json` — personal defaults for all projects
- **Project**: `.zed/settings.json` in the repo root — committed, shared with the team

Project settings override global settings. Put shared formatter/LSP config in project settings, personal preferences in global.

### Core global settings

```json
{
  "theme": "One Dark",
  "buffer_font_family": "Berkeley Mono",
  "buffer_font_size": 14,
  "ui_font_size": 14,
  "format_on_save": "on",
  "autosave": { "after_delay": { "milliseconds": 1000 } },
  "tab_size": 2,
  "soft_wrap": "editor_width",
  "show_whitespaces": "selection",
  "inlay_hints": { "enabled": true },
  "terminal": {
    "shell": { "program": "/bin/zsh" },
    "font_family": "Berkeley Mono",
    "font_size": 13
  },
  "git": { "inline_blame": { "enabled": true } },
  "file_finder": { "file_icons": true },
  "telemetry": { "diagnostics": false, "metrics": false }
}
```

### Project settings

Project `.zed/settings.json` configures formatter, LSP, and language-specific options. See `references/lsp-configs.md` for full per-language configs.

Minimal TypeScript/Biome example:

```json
{
  "formatter": "language_server",
  "tab_size": 2,
  "languages": {
    "TypeScript": {
      "language_servers": ["typescript-language-server", "biome"],
      "formatter": {
        "external": {
          "command": "bunx",
          "arguments": ["biome", "format", "--write", "--stdin-file-path", "{buffer_path}"]
        }
      }
    }
  }
}
```

## Extensions

Install via the Extensions panel (`Cmd+Shift+X`) or the `zed: install extension` command. Full list in `references/extensions.md`.

### Quick picks by stack

| Stack | Extensions |
|---|---|
| TypeScript/Bun | `biome`, `tailwindcss`, `toml`, `dockerfile`, `sql`, `env` |
| Rust | `toml`, `dockerfile` |
| Swift/iOS | `swift` |
| Python | `ruff`, `basedpyright`, `toml` |
| Go | `dockerfile` |
| General | `git-firefly`, `html`, `csv`, `env` |

### Built-in vs extension language support

Zed includes built-in LSP support for TypeScript, Rust, Go, JSON, and Markdown. Extensions are needed for Biome formatting, Python (basedpyright/ruff), Swift, TOML, Dockerfile, and Tailwind.

## Language servers

Zed auto-installs many LSPs via its built-in registry. Configure them in the `"lsp"` key of settings. See `references/lsp-configs.md` for complete per-language configs including TypeScript, Rust, Python, Go, Swift, Lua, and Tailwind.

### Using Biome as both formatter and linter

In project `.zed/settings.json`, set Biome as the formatter for each language you want it to handle. Biome provides both formatting and lint diagnostics as an LSP. Add `"require_config_file": true` to only activate when `biome.json` is present.

### Disabling a built-in language server

Prefix with `!` in the `language_servers` array:

```json
{
  "languages": {
    "CSS": {
      "language_servers": ["tailwindcss-language-server", "!vscode-css-language-server"]
    }
  }
}
```

### Check LSP status

Run `tools/zed-lsp-status.ts` to verify servers are configured and running for the current project. In-editor: check the status bar at the bottom.

## Keybindings

Keybindings live in `~/.config/zed/keymap.json`. Each entry maps a keystroke to a command in a specific context.

```json
[
  {
    "context": "Editor",
    "bindings": {
      "cmd-shift-d": "editor::DuplicateLineDown",
      "cmd-shift-k": "editor::DeleteLine",
      "cmd-shift-l": "editor::SelectAllMatches",
      "alt-up": "editor::MoveLineUp",
      "alt-down": "editor::MoveLineDown",
      "cmd-shift-p": "command_palette::Toggle"
    }
  },
  {
    "context": "Terminal",
    "bindings": {
      "cmd-t": "workspace::NewTerminal",
      "cmd-shift-]": "pane::ActivateNextItem",
      "cmd-shift-[": "pane::ActivatePrevItem"
    }
  },
  {
    "context": "Workspace",
    "bindings": {
      "cmd-\\": "workspace::ToggleLeftDock",
      "cmd-shift-\\": "workspace::ToggleRightDock",
      "cmd-j": "workspace::ToggleBottomDock"
    }
  }
]
```

### Multi-cursor

| Shortcut | Action |
|---|---|
| `Cmd+D` | Add selection for next occurrence |
| `Cmd+Shift+L` | Select all occurrences |
| `Alt+Click` | Add cursor at click position |
| `Cmd+Alt+Up/Down` | Add cursor above/below |

### Finding command names

- Open the command palette (`Cmd+Shift+P`) and search — the command ID is shown next to each entry
- Check `zed: open default keymap` to see all built-in bindings

## Theme and layout

### Themes

```json
{
  "theme": {
    "mode": "dark",
    "dark": "One Dark",
    "light": "One Light"
  }
}
```

Zed supports system theme switching — set both `dark` and `light` and Zed follows the OS appearance.

### Panel layout

```json
{
  "project_panel": { "dock": "left", "default_width": 240 },
  "outline_panel": { "dock": "right", "default_width": 260 },
  "terminal": { "dock": "bottom", "default_height": 300 },
  "collaboration_panel": { "dock": "left" }
}
```

### Buffer appearance

```json
{
  "buffer_font_family": "Berkeley Mono",
  "buffer_font_size": 14,
  "buffer_line_height": { "custom": 1.6 },
  "show_whitespaces": "selection",
  "cursor_blink": false,
  "scrollbar": { "show": "auto" },
  "gutter": { "line_numbers": true, "code_actions": true, "folds": true }
}
```

## Stack-specific config

### TypeScript + Bun + Biome

1. Install extensions: `biome`, `toml`, `tailwindcss`
2. Create `.zed/settings.json` — see `references/lsp-configs.md` for full config
3. Add `biome.json` to project root
4. Verify: open a `.ts` file, check format on save works

### Rust

1. Zed includes built-in Rust support (rust-analyzer)
2. Create `.zed/settings.json` — see `references/lsp-configs.md` for clippy + inlay hints config
3. Install `toml` extension for `Cargo.toml` support
4. Verify: open a `.rs` file, check diagnostics and format on save

### Python

1. Install extensions: `basedpyright`, `ruff`, `toml`
2. Create `.zed/settings.json` — see `references/lsp-configs.md` for basedpyright + ruff config
3. Verify: open a `.py` file, check type checking and format on save

### Go

1. Zed includes built-in Go support (gopls)
2. Create `.zed/settings.json` — see `references/lsp-configs.md` for gopls + gofumpt config
3. Verify: open a `.go` file, check completions and formatting

### Swift

1. Install `swift` extension
2. SourceKit-LSP is used automatically if Xcode is installed
3. For SPM projects, ensure `Package.swift` is at the workspace root

## Collaboration

Zed supports real-time collaboration natively:

1. Sign in to Zed (top-right avatar)
2. Share a project: `Cmd+Shift+P` → `collaboration: share project`
3. Invite collaborators by Zed username or link
4. Collaborators see cursors, selections, and edits in real-time
5. Voice chat: built-in, activated from the collaboration panel

### Channel-based collaboration

- Create channels in the collaboration panel for persistent project spaces
- Channel members can join shared projects any time
- Use channels for code review, pair programming, or standups

## File scan exclusions

For large repos, exclude directories from indexing:

```json
{
  "file_scan_exclusions": [
    "**/.git",
    "**/node_modules",
    "**/target",
    "**/.next",
    "**/dist",
    "**/.turbo"
  ]
}
```

## Troubleshooting

- **LSP not starting** → check the log pane (View > Toggle Log), look for binary not found errors. Verify the language server is installed
- **Formatter not running on save** → verify `"format_on_save": "on"` is set, check that the formatter configuration matches the file type
- **Wrong formatter used** → check language-specific `formatter` overrides in project settings; project settings override global
- **Extension not loading** → restart Zed (`Cmd+Q` and reopen), check the Extensions panel for error badges
- **Slow performance** → disable unused extensions, add large directories to `file_scan_exclusions`
- **Inlay hints missing** → set `"inlay_hints": { "enabled": true }` in settings and configure the LSP's inlay hint options

### Useful diagnostics

- Log pane: `View > Toggle Log` or `Cmd+Shift+M`
- Command palette: `Cmd+Shift+P` — search for any command
- LSP status: status bar at the bottom shows active language servers

## Key references

| File | What it covers |
|---|---|
| `references/lsp-configs.md` | Per-language LSP config: TypeScript, Rust, Python, Go, Swift, Lua, Tailwind |
| `references/extensions.md` | Extension recommendations by stack, built-in vs extension support |
| `tools/zed-extension-check.ts` | List installed Zed extensions and check for available updates |
| `tools/zed-lsp-status.ts` | Verify language servers are configured and running for the current project |
| `tools/zed-settings-merge.ts` | Merge project-level Zed settings from a shared team template |
