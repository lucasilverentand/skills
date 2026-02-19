# VS Code

Settings and extensions, task/launch config, and keybinding setup.

## Responsibilities

- Manage settings and extensions
- Configure tasks and launch configurations
- Set up keybindings
- Sync workspace settings across team members
- Audit extensions for conflicts and performance impact
- Generate recommended extension lists per project type

## Tools

- `tools/vscode-extension-audit.ts` — list installed extensions and flag deprecated or conflicting ones
- `tools/vscode-settings-merge.ts` — merge workspace settings from a team template into the local config
- `tools/vscode-task-gen.ts` — generate tasks.json entries from package.json scripts and Makefiles
