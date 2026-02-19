# Terminal

Shell configuration (zsh), CLI tool setup, and configuration.

## Responsibilities

- Configure zsh and shell environments
- Set up and configure CLI tools
- Manage shell aliases and functions
- Audit and optimize shell startup performance
- Keep dotfiles in sync across machines

## Tools

- `tools/shell-startup-profile.ts` — measure zsh startup time and identify slow plugins or scripts
- `tools/alias-audit.ts` — list all shell aliases and flag duplicates or shadowed commands
- `tools/dotfiles-diff.ts` — compare local dotfiles against a dotfiles repo for drift detection
