---
name: neovim
description: Manages Neovim configuration, plugins, LSP servers, Treesitter, and debug adapters. Use when the user wants to configure Neovim, add or troubleshoot plugins, set up LSP for a language, configure debugging, sync config across machines, or audit plugin health.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Neovim

## Decision Tree

- What do you need to do?
  - **Add or configure a plugin** → see "Plugin management" below, full specs in `references/plugin-configs.md`
  - **Set up LSP for a language** → see `references/lsp-configs.md` for per-language configs
  - **Set up formatting** → see "Formatting" below
  - **Configure Treesitter** → see "Treesitter" below
  - **Set up debugging (DAP)** → see `references/dap-configs.md`
  - **Diagnose a Neovim issue** → see "Troubleshooting" below
  - **Audit plugin health** → run `tools/nvim-plugin-audit.ts`
  - **Check LSP status for the current project** → run `tools/nvim-lsp-check.ts`
  - **Diff local config against a backup** → run `tools/nvim-config-diff.ts`
  - **Sync config to another machine** → see "Config sync" below

## Plugin management

Neovim config lives at `~/.config/nvim/`. Plugins are managed with lazy.nvim — each plugin spec goes in its own file under `lua/plugins/`.

### Adding a plugin with lazy.nvim

Create a file like `lua/plugins/plugin-name.lua`:

```lua
return {
  "author/plugin-name",
  event = "BufReadPost",  -- lazy-load on buffer read
  opts = {
    -- plugin options here
  },
}
```

Reload: `:Lazy sync` inside Neovim, or restart.

### Lazy-loading strategies

| Strategy | When to use | Example |
|---|---|---|
| `event = "BufReadPost"` | Plugins that act on file content | gitsigns, treesitter |
| `event = "InsertEnter"` | Completion, snippets | nvim-cmp |
| `event = "VeryLazy"` | UI plugins not needed at startup | lualine, noice |
| `cmd = "CommandName"` | Plugins triggered by a command | Telescope, Neogit |
| `ft = "rust"` | Language-specific plugins | crates.nvim |
| `keys = { ... }` | Plugins triggered by keybindings | which-key |

### Essential plugin stack

Full lazy.nvim specs for each plugin are in `references/plugin-configs.md`. The recommended stack:

| Plugin | Purpose | Lazy-load |
|---|---|---|
| `nvim-lspconfig` + Mason | LSP management | — |
| `nvim-cmp` | Completion | `InsertEnter` |
| `nvim-treesitter` | Syntax, indentation, text objects | `BufReadPost` |
| `telescope.nvim` | Fuzzy finder | `cmd` / `keys` |
| `conform.nvim` | Formatting | `BufWritePre` |
| `gitsigns.nvim` | Git signs, hunk navigation | `BufReadPost` |
| `oil.nvim` | File explorer | `keys` |
| `which-key.nvim` | Keybinding hints | `VeryLazy` |
| `mini.nvim` | Pairs, surround, comment | various |

Run `tools/nvim-plugin-audit.ts` after changes to detect outdated, unused, or conflicting plugins.

## LSP configuration

Each language server is configured via `nvim-lspconfig`. Install servers via Mason (`:MasonInstall <name>`). Full per-language configs are in `references/lsp-configs.md`.

### Supported languages

| Language | Server | Install |
|---|---|---|
| TypeScript | `ts_ls` | Mason |
| Rust | `rust_analyzer` | Mason or rustup |
| Python | `basedpyright` + `ruff` | Mason |
| Go | `gopls` | Mason |
| Swift | `sourcekit-lsp` | Bundled with Xcode |
| Lua | `lua_ls` | Mason |
| Tailwind | `tailwindcss` | Mason |

### LSP keybindings

Standard keybindings set in the shared `on_attach` callback (see `references/lsp-configs.md`):

| Key | Action |
|---|---|
| `gd` | Go to definition |
| `gr` | Go to references |
| `gI` | Go to implementation |
| `K` | Hover documentation |
| `<leader>ca` | Code action |
| `<leader>rn` | Rename symbol |
| `<leader>D` | Type definition |
| `[d` / `]d` | Previous / next diagnostic |

### Verify LSP is working

1. Open a file of the target language
2. `:LspInfo` — check the server is attached to the buffer
3. Test: hover (`K`), go to definition (`gd`), completions (`<C-Space>`)
4. Run `tools/nvim-lsp-check.ts` for automated verification

## Formatting

Use conform.nvim for formatting on save. It runs external formatters (Biome, rustfmt, gofumpt, etc.) instead of relying on LSP formatting.

```lua
-- lua/plugins/conform.lua
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

Disable tsserver formatting in the LSP config so conform.nvim handles it via Biome. See `references/lsp-configs.md` for the TypeScript setup.

## Treesitter

Treesitter provides syntax highlighting, indentation, and text objects. Full config in `references/plugin-configs.md`.

### Adding a language

Add to `ensure_installed` in the treesitter config, then run `:TSUpdate`.

### Text objects

With `nvim-treesitter-textobjects` (see `references/plugin-configs.md`):

| Keymap | Selects |
|---|---|
| `af` / `if` | Function (outer/inner) |
| `ac` / `ic` | Class (outer/inner) |
| `aa` / `ia` | Parameter (outer/inner) |
| `]f` / `[f` | Next/previous function |
| `]c` / `[c` | Next/previous class |

## Debug adapters

DAP (Debug Adapter Protocol) provides integrated debugging. Full configs for TypeScript, Rust, Go, and Python are in `references/dap-configs.md`.

### DAP keybindings

| Key | Action |
|---|---|
| `<leader>db` | Toggle breakpoint |
| `<leader>dB` | Conditional breakpoint |
| `<leader>dc` | Continue |
| `<leader>do` | Step over |
| `<leader>di` | Step into |
| `<leader>dO` | Step out |
| `<leader>du` | Toggle DAP UI |

## Troubleshooting

1. Start with `:checkhealth` — covers providers, plugins, and LSP
2. Check startup errors: `:messages` or `nvim --startuptime /tmp/nvim-startup.log`
3. Run `tools/nvim-plugin-audit.ts` to detect plugin conflicts
4. Isolate: `nvim --clean` to confirm the issue is config-related
5. Check plugin errors: `:Lazy log`

### Common issues

- **LSP not attaching** → `:LspInfo` to check. Verify `root_dir` pattern matches the project. Check `:Mason` for install status
- **No completions** → verify `nvim-cmp` sources include `nvim_lsp`. Check `capabilities` is passed to the LSP setup
- **Formatter not running** → check conform.nvim config. Verify the formatter binary is installed
- **Treesitter highlighting broken** → `:TSUpdate` to update parsers. Check `:TSInstallInfo` for installed parsers
- **Slow startup** → profile with `nvim --startuptime`. Lazy-load more plugins. Check for blocking `require()` calls in init.lua

## Config sync

- Keep config in a dotfiles repo (e.g. `~/.dotfiles/nvim/`) and symlink to `~/.config/nvim`
- Use `tools/nvim-config-diff.ts` to compare local state against the remote or backup
- Machine-specific overrides: `lua/local.lua` excluded by `.gitignore`
- Lock file: commit `lazy-lock.json` so plugin versions are reproducible across machines

## Key references

| File | What it covers |
|---|---|
| `references/plugin-configs.md` | Full lazy.nvim specs: LSP, completion, treesitter, telescope, conform, git, oil, mini.nvim |
| `references/lsp-configs.md` | Per-language LSP config: TypeScript, Rust, Python, Go, Swift, Lua, Tailwind |
| `references/dap-configs.md` | Debug adapter configs: TypeScript/Node, Rust, Go, Python, DAP UI layout |
| `tools/nvim-plugin-audit.ts` | Check for outdated, unused, or conflicting plugins |
| `tools/nvim-lsp-check.ts` | Verify LSP servers are installed and configured for the current project |
| `tools/nvim-config-diff.ts` | Diff local Neovim config against a remote or backup version |
