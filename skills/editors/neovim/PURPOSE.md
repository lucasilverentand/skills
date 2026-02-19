# Neovim

Config management, plugin setup, and troubleshooting issues.

## Responsibilities

- Manage Neovim configuration
- Set up and configure plugins
- Troubleshoot Neovim issues
- Sync configuration across machines
- Audit plugin health and detect conflicts
- Manage LSP server configurations

## Tools

- `tools/nvim-plugin-audit.ts` — check for outdated, unused, or conflicting plugins in the config
- `tools/nvim-lsp-check.ts` — verify LSP servers are installed and configured for the current project
- `tools/nvim-config-diff.ts` — diff local Neovim config against a remote or backup version
