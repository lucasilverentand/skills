---
name: vscode
description: Manages VS Code settings, extensions, tasks, launch configurations, and keybindings. Use when the user wants to configure VS Code, add or audit extensions, generate tasks.json from package.json scripts, set up a debug launch config, sync workspace settings with a team, or configure keybindings. Trigger phrases: "VS Code", "vscode", "settings.json", "launch.json", "tasks.json", "extension", "keybinding", "debug config", "workspace settings".
allowed-tools: Read Grep Glob Bash
---

# VS Code

## Decision Tree

- What do you need to do?
  - **Configure workspace settings** → follow "Settings" below
  - **Add or audit extensions** → follow "Extensions" below
  - **Set up tasks from package.json** → run `tools/vscode-task-gen.ts`
  - **Create or update a debug launch config** → follow "Launch configs" below
  - **Configure keybindings** → follow "Keybindings" below
  - **Sync settings with the team template** → run `tools/vscode-settings-merge.ts`
  - **Audit extensions for conflicts** → run `tools/vscode-extension-audit.ts`

## Settings

VS Code settings have three scopes (highest priority wins):
1. **Workspace** — `.vscode/settings.json` — committed to the repo, shared with the team
2. **User** — `~/Library/Application Support/Code/User/settings.json` — personal overrides
3. **Default** — built-in

What to put in workspace settings (committed):
- Formatter, linter, and type-check settings specific to the project
- Language associations (`"files.associations"`)
- Extension recommendations (`.vscode/extensions.json`)

What to keep in user settings:
- Appearance (font, theme, zoom)
- Editor behavior preferences (autosave, minimap)
- Personal tool paths

## Extensions

Recommended extensions for TypeScript/Bun projects:
- `biomejs.biome` — formatting and linting (replaces ESLint + Prettier)
- `dbaeumer.vscode-eslint` — only if the project still uses ESLint
- `bradlc.vscode-tailwindcss` — Tailwind IntelliSense
- `ms-vscode.vscode-typescript-next` — latest TypeScript language service
- `eamodio.gitlens` — git blame and history inline

Document recommended extensions in `.vscode/extensions.json`:
```json
{
  "recommendations": ["biomejs.biome", "bradlc.vscode-tailwindcss"]
}
```

Audit installed extensions: `tools/vscode-extension-audit.ts` — flags deprecated or conflicting ones.

## Launch configs

Debug configurations live in `.vscode/launch.json`. Generate common configs:

Bun script:
```json
{
  "type": "bun",
  "request": "launch",
  "name": "Run script",
  "program": "${file}"
}
```

Node/Bun server with attach:
```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Bun",
  "port": 9229
}
```

## Keybindings

User keybindings: `~/Library/Application Support/Code/User/keybindings.json`

Common customizations:
```json
[
  { "key": "cmd+shift+t", "command": "workbench.action.terminal.new" },
  { "key": "cmd+k cmd+f", "command": "editor.action.formatDocument" }
]
```

Workspace keybindings are not supported — keybindings are always user-scoped.

## Key references

| File | What it covers |
|---|---|
| `tools/vscode-extension-audit.ts` | List installed extensions and flag deprecated or conflicting ones |
| `tools/vscode-settings-merge.ts` | Merge workspace settings from a team template into the local config |
| `tools/vscode-task-gen.ts` | Generate tasks.json entries from package.json scripts and Makefiles |
