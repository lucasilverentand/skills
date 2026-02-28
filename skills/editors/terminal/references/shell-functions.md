# Shell Function Patterns

## Git workflow functions

```zsh
# Create a feature branch and push it
gfeat() {
  git checkout -b "feat/$1" && git push -u origin "feat/$1"
}

# Quick commit with conventional message
gc() {
  git add -A && git commit -m "$*"
}

# Interactive branch switcher (requires fzf)
gbr() {
  git branch --sort=-committerdate | fzf --height 40% | xargs git checkout
}
```

## Development functions

```zsh
# Run a command in all workspace packages
workspaces() {
  for dir in packages/*/; do
    echo "==> $dir"
    (cd "$dir" && "$@")
  done
}

# Kill process on a port
killport() {
  lsof -ti:"$1" | xargs kill -9 2>/dev/null || echo "No process on port $1"
}

# Quick HTTP server
serve() {
  python3 -m http.server "${1:-8000}"
}
```

## Utility functions

```zsh
# Extract any archive
extract() {
  case "$1" in
    *.tar.gz|*.tgz) tar xzf "$1" ;;
    *.tar.bz2|*.tbz2) tar xjf "$1" ;;
    *.tar.xz) tar xJf "$1" ;;
    *.zip) unzip "$1" ;;
    *.gz) gunzip "$1" ;;
    *.7z) 7z x "$1" ;;
    *) echo "Unknown format: $1" ;;
  esac
}

# Weather in terminal
weather() {
  curl -s "wttr.in/${1:-}"
}
```

## fzf integration patterns

fzf enables fuzzy finding across many workflows. Install: `brew install fzf`, init: `source <(fzf --zsh)`.

### File search

```zsh
# Open a file in $EDITOR via fzf
fe() {
  local file
  file=$(fzf --preview 'bat --color=always --line-range :50 {}') && $EDITOR "$file"
}
```

### Process management

```zsh
# Kill a process selected via fzf
fkill() {
  local pid
  pid=$(ps aux | fzf --header-lines=1 | awk '{print $2}')
  [ -n "$pid" ] && kill -9 "$pid"
}
```

### Environment variable browser

```zsh
# Browse and copy env vars
fenv() {
  printenv | sort | fzf | cut -d= -f2- | tr -d '\n' | pbcopy
}
```

### Docker integration

```zsh
# Attach to a running container
fdocker() {
  local container
  container=$(docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}' | fzf | awk '{print $1}')
  [ -n "$container" ] && docker exec -it "$container" /bin/sh
}
```

## SSH management functions

```zsh
# Quick SSH with fzf host selection from ~/.ssh/config
fssh() {
  local host
  host=$(grep "^Host " ~/.ssh/config | awk '{print $2}' | fzf)
  [ -n "$host" ] && ssh "$host"
}
```
