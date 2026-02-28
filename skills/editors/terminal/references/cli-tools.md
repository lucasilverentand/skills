# CLI Tools Reference

Setup and configuration for essential CLI tools.

## Tool Index

| Tool | Install | Purpose |
|---|---|---|
| `starship` | `brew install starship` | Cross-shell prompt |
| `zoxide` | `brew install zoxide` | Smarter `cd` |
| `fnm` | `brew install fnm` | Fast Node version manager |
| `direnv` | `brew install direnv` | Per-directory env vars |
| `bat` | `brew install bat` | Better `cat` |
| `eza` | `brew install eza` | Better `ls` |
| `fd` | `brew install fd` | Better `find` |
| `ripgrep` | `brew install ripgrep` | Better `grep` |
| `fzf` | `brew install fzf` | Fuzzy finder |
| `jq` | `brew install jq` | JSON processor |
| `gh` | `brew install gh` | GitHub CLI |
| `delta` | `brew install git-delta` | Better git diffs |
| `hyperfine` | `brew install hyperfine` | Command benchmarking |
| `tokei` | `brew install tokei` | Code statistics |
| `dust` | `brew install dust` | Better `du` |
| `procs` | `brew install procs` | Better `ps` |
| `bottom` | `brew install bottom` | Better `top` |

## Shell Init Lines

Add to `~/.zshrc`:

```zsh
# Fast tools — safe to eval at startup
eval "$(starship init zsh)"
eval "$(zoxide init zsh)"
eval "$(fnm env --use-on-cd)"
eval "$(direnv hook zsh)"
source <(fzf --zsh)
```

## git-delta Setup

Better git diffs with syntax highlighting and side-by-side view.

Add to `~/.gitconfig`:

```ini
[core]
  pager = delta

[interactive]
  diffFilter = delta --color-only

[delta]
  navigate = true
  side-by-side = true
  line-numbers = true
  syntax-theme = "Dracula"

[merge]
  conflictstyle = zdiff3
```

## fzf Integration

### Shell keybindings (auto-configured by `source <(fzf --zsh)`)

| Key | Action |
|---|---|
| `Ctrl+T` | Fuzzy file finder (paste path) |
| `Ctrl+R` | Fuzzy command history |
| `Alt+C` | Fuzzy `cd` into directory |

### Custom fzf defaults

```zsh
export FZF_DEFAULT_COMMAND='fd --type f --hidden --follow --exclude .git'
export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
export FZF_ALT_C_COMMAND='fd --type d --hidden --follow --exclude .git'
```

### fzf + git integration

```zsh
# Fuzzy checkout branch
alias gcb='git branch --sort=-committerdate | fzf --height 40% | xargs git checkout'

# Fuzzy add files
alias gaf='git ls-files -m -o --exclude-standard | fzf -m --height 40% | xargs git add'

# Fuzzy log
alias glf='git log --oneline | fzf --preview "git show {1}" | cut -d" " -f1'
```

## bat Configuration

```zsh
export BAT_THEME="Dracula"
alias cat='bat'
alias bathelp='bat --plain --language=help'
help() { "$@" --help 2>&1 | bathelp; }
```

## eza Configuration

```zsh
alias ls='eza'
alias ll='eza -la --git --icons'
alias lt='eza --tree --level=2 --icons'
alias la='eza -a --icons'
```

## zoxide Usage

```zsh
# After init, use z instead of cd
z project-name    # jump to most-visited matching directory
zi               # interactive selection with fzf
```

## direnv Usage

```zsh
# Create .envrc in project root
echo 'export DATABASE_URL="postgres://localhost:5432/mydb"' > .envrc
direnv allow     # approve the .envrc

# direnv automatically loads/unloads env vars when entering/leaving the directory
```

### Common .envrc patterns

```zsh
# Load .env file
dotenv

# Use specific Node version
use node 22

# Use specific Python venv
layout python3

# Add local bin to PATH
PATH_add bin
```

## SSH Config Management

Place at `~/.ssh/config`:

```
# Default settings
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519

# GitHub
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github

# Homelab
Host homelab
  HostName 192.168.1.100
  User luca
  IdentityFile ~/.ssh/id_ed25519_homelab
  ForwardAgent yes

# Jump host pattern
Host internal-*
  ProxyJump homelab
  User luca
```

### SSH key generation

```zsh
ssh-keygen -t ed25519 -C "email@example.com" -f ~/.ssh/id_ed25519_github
ssh-add --apple-use-keychain ~/.ssh/id_ed25519_github
```
