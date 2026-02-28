---
name: terminal
description: Configures zsh, shell environments, CLI tools, aliases, dotfiles, prompt, and terminal multiplexers. Use when the user wants to configure their shell, add or audit aliases, improve shell startup time, set up a CLI tool, customize the prompt, manage dotfiles, or configure tmux/zellij.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Terminal

## Decision Tree

- What do you need to do?
  - **Add or update an alias or shell function** → see "Aliases and functions" below
  - **Shell startup is slow** → run `tools/shell-startup-profile.ts`
  - **Audit existing aliases** → run `tools/alias-audit.ts`
  - **Set up a CLI tool** → see `references/cli-tools.md` for install + config
  - **Manage dotfiles** → see "Dotfiles management" below
  - **Customize the prompt** → see `references/starship.md`
  - **Set up tmux** → see `references/tmux.md`
  - **Set up zellij** → see `references/zellij.md`
  - **Add shell functions for a workflow** → see `references/shell-functions.md`
  - **Update PATH or environment variables** → see "Environment variables" below
  - **Sync dotfiles across machines** → run `tools/dotfiles-diff.ts` then see "Dotfiles management" below
  - **Set up SSH config** → see `references/cli-tools.md` for SSH config patterns

## Aliases and functions

Aliases and functions live in `~/.zshrc` or sourced files (e.g. `~/.zsh/aliases.zsh`):

```zsh
# Alias — simple substitution
alias gs='git status'
alias ll='eza -la --git --icons'
alias cat='bat'

# Function — when you need arguments or logic
mkcd() {
  mkdir -p "$1" && cd "$1"
}
```

Rules:
- Prefer functions over aliases when you need arguments or conditional logic
- Group related aliases in separate files (`~/.zsh/git.zsh`, `~/.zsh/dev.zsh`) and source them in `.zshrc`
- Run `tools/alias-audit.ts` after changes to detect duplicates or commands that shadow system tools
- Full function patterns: `references/shell-functions.md`

## CLI tool setup

Install tools via Homebrew, then add shell init lines to `~/.zshrc`. Full tool index and configs in `references/cli-tools.md`.

### Essential tools

| Tool | Purpose | Init needed |
|---|---|---|
| `starship` | Prompt | `eval "$(starship init zsh)"` |
| `zoxide` | Smarter `cd` | `eval "$(zoxide init zsh)"` |
| `fzf` | Fuzzy finder | `source <(fzf --zsh)` |
| `fnm` | Node version manager | `eval "$(fnm env --use-on-cd)"` |
| `direnv` | Per-directory env vars | `eval "$(direnv hook zsh)"` |
| `bat` | Better `cat` | alias |
| `eza` | Better `ls` | alias |
| `fd` | Better `find` | — |
| `ripgrep` | Better `grep` | — |
| `delta` | Better git diffs | git config |

See `references/cli-tools.md` for complete setup including fzf integration, git-delta config, and direnv patterns.

## Shell startup performance

1. Profile: `tools/shell-startup-profile.ts` — measures total startup time and identifies slow segments
2. Target: shell startup under 100ms. Measure with `time zsh -i -c exit`

### Common culprits and fixes

| Culprit | Fix |
|---|---|
| `nvm` | Replace with `fnm` (10x faster) |
| `brew shellenv` | Cache output: `export HOMEBREW_PREFIX="/opt/homebrew"` etc. |
| `rbenv`/`pyenv` init | Lazy-load: only initialize when first used |
| Many `source` files | Consolidate or lazy-load |
| `compinit` (zsh completions) | Run once daily with a cache: see below |

### Cached compinit

```zsh
autoload -Uz compinit
if [[ -n ${ZDOTDIR:-$HOME}/.zcompdump(#qN.mh+24) ]]; then
  compinit
else
  compinit -C  # use cache
fi
```

### Lazy-loading pattern

```zsh
nvm() {
  unset -f nvm
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
  nvm "$@"
}
```

## Environment variables

Set persistent env vars in `~/.zshenv` (sourced for all zsh instances, including non-interactive):

```zsh
export EDITOR=nvim
export VISUAL=nvim
export LANG=en_US.UTF-8

# Tool paths
export BUN_INSTALL="$HOME/.bun"
export CARGO_HOME="$HOME/.cargo"
export PATH="$BUN_INSTALL/bin:$CARGO_HOME/bin:$PATH"
```

### PATH management

- Add to PATH in `~/.zshenv`, not `.zshrc` (so non-interactive shells see it too)
- Order matters: first entry wins. Put local tools first
- Never add `.` to PATH (security risk)
- Check for duplicate PATH entries: `echo $PATH | tr ':' '\n' | sort | uniq -d`

### Per-project env vars with direnv

Use `direnv` with `.envrc` files for project-local variables. See `references/cli-tools.md` for patterns.

## Dotfiles management

### Recommended structure with GNU Stow

```
~/.dotfiles/
  zsh/
    .zshrc
    .zshenv
    .zsh/
      aliases.zsh
      git.zsh
      dev.zsh
  git/
    .gitconfig
    .gitignore_global
  nvim/
    .config/nvim/
      init.lua
      lua/
  starship/
    .config/starship.toml
  tmux/
    .tmux.conf
```

### Stow commands

```zsh
cd ~/.dotfiles
stow zsh       # symlinks ~/.zshrc → ~/.dotfiles/zsh/.zshrc
stow git       # symlinks ~/.gitconfig → ~/.dotfiles/git/.gitconfig
stow nvim      # symlinks ~/.config/nvim → ~/.dotfiles/nvim/.config/nvim
stow starship  # symlinks ~/.config/starship.toml → ...
```

### Alternative: bare git repo

```zsh
git init --bare ~/.dotfiles.git
alias dotfiles='git --git-dir=$HOME/.dotfiles.git --work-tree=$HOME'
dotfiles config --local status.showUntrackedFiles no
```

Then use `dotfiles add`, `dotfiles commit`, `dotfiles push` to manage.

### Drift detection

Run `tools/dotfiles-diff.ts` to compare local dotfiles against the dotfiles repo. Sync regularly.

### Machine-specific overrides

Use a `~/.zshrc.local` file sourced at the end of `.zshrc` and excluded from the dotfiles repo:

```zsh
# At the end of ~/.zshrc
[[ -f ~/.zshrc.local ]] && source ~/.zshrc.local
```

## Prompt customization

Use Starship for cross-shell prompt customization. Full config in `references/starship.md`.

### Quick setup

```zsh
brew install starship
echo 'eval "$(starship init zsh)"' >> ~/.zshrc
```

Config at `~/.config/starship.toml`. Design principles:
- Show directory, git branch, and git status
- Show language version only when a relevant project file is detected
- Use muted colors for context, bright for actionable info

## Terminal multiplexers

### tmux vs zellij

| Aspect | tmux | zellij |
|---|---|---|
| Maturity | Very mature, widely used | Newer, actively developed |
| Config | Plain text | KDL format |
| Layouts | Manual or scripted | Built-in layout system |
| Plugins | Via TPM | Native WASM plugins |
| Learning curve | Steeper | Gentler (on-screen hints) |

Choose tmux for maximum compatibility and scripting. Choose zellij for a more modern default experience.

Full configs: `references/tmux.md` and `references/zellij.md`.

## Key references

| File | What it covers |
|---|---|
| `references/cli-tools.md` | Tool index, install commands, fzf integration, git-delta, direnv, SSH config |
| `references/starship.md` | Prompt config, modules, custom modules, kubernetes context |
| `references/tmux.md` | Full tmux config, session management, TPM plugins, keybindings |
| `references/zellij.md` | Zellij config, layouts, sessions, mode shortcuts |
| `references/shell-functions.md` | Git, dev, utility, fzf, SSH, and Docker shell functions |
| `tools/shell-startup-profile.ts` | Measure zsh startup time and identify slow plugins or scripts |
| `tools/alias-audit.ts` | List all shell aliases and flag duplicates or shadowed commands |
| `tools/dotfiles-diff.ts` | Compare local dotfiles against a dotfiles repo for drift detection |
