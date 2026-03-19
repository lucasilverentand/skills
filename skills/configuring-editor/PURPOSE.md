# Editor Setup

Global editor configuration across VS Code, Zed, Neovim, and Xcode.

## Responsibilities

- Configure editor settings, extensions, and plugins
- Set up language servers, formatters, and linters
- Manage keybindings and themes
- Sync settings across machines and team members
- Audit extensions/plugins for conflicts and deprecation
- Configure Xcode projects, schemes, signing, and build settings
- Set up debug configurations (VS Code launch.json, Neovim DAP)

## Tools

- `tools/vscode-extension-audit.ts` — list VS Code extensions and flag deprecated or conflicting ones
- `tools/vscode-settings-merge.ts` — merge workspace settings from a team template
- `tools/vscode-task-gen.ts` — generate tasks.json from package.json scripts and Makefiles
- `tools/zed-extension-check.ts` — list installed Zed extensions and check for updates
- `tools/zed-lsp-status.ts` — verify Zed language servers are configured and running
- `tools/zed-settings-merge.ts` — merge Zed project settings from a team template
- `tools/nvim-plugin-audit.ts` — check for outdated, unused, or conflicting Neovim plugins
- `tools/nvim-lsp-check.ts` — verify LSP servers are installed and configured for the project
- `tools/nvim-config-diff.ts` — diff local Neovim config against a remote or backup
- `tools/xcode-build-settings-diff.ts` — compare Xcode build settings between two schemes or targets
- `tools/xcode-signing-check.ts` — verify code signing and provisioning profiles
- `tools/xcodeproj-lint.ts` — detect common .xcodeproj issues
