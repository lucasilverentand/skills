# Starship Prompt Configuration

Cross-shell prompt customization. Config at `~/.config/starship.toml`.

## Recommended Config

```toml
# Minimal prompt with git and language info
format = """
$directory$git_branch$git_status$rust$nodejs$python$golang$swift
$character"""

right_format = "$cmd_duration"

[character]
success_symbol = "[>](bold green)"
error_symbol = "[>](bold red)"

[directory]
truncation_length = 3
truncate_to_repo = true
style = "bold cyan"

[git_branch]
format = "[$branch]($style) "
style = "bold purple"

[git_status]
format = '([$all_status$ahead_behind]($style) )'
style = "bold yellow"

[cmd_duration]
min_time = 2000
format = "[$duration]($style)"
style = "bold yellow"

[nodejs]
format = "[$symbol($version)]($style) "
symbol = "node "
detect_files = ["package.json"]
style = "bold green"

[rust]
format = "[$symbol($version)]($style) "
symbol = "rs "
style = "bold red"

[python]
format = "[$symbol($version)]($style) "
symbol = "py "
style = "bold yellow"

[golang]
format = "[$symbol($version)]($style) "
symbol = "go "
style = "bold cyan"

[swift]
format = "[$symbol($version)]($style) "
symbol = "sw "
style = "bold orange"

[bun]
format = "[$symbol($version)]($style) "
symbol = "bun "
style = "bold white"
```

## Design Principles

- Show directory, git branch, and git status — hide everything else by default
- Show language version only when a relevant project file is detected
- Keep the prompt on one line unless you need two (use `\n` in `format` for two-line prompts)
- Use muted colors for context, bright colors only for actionable info (errors, dirty state)
- Right prompt for non-essential info (command duration)

## Two-Line Prompt Variant

```toml
format = """
$directory$git_branch$git_status
$character"""
```

This puts the cursor on a fresh line, useful for long directory paths.

## Modules Reference

### Commonly used modules

| Module | Shows | Detected by |
|---|---|---|
| `directory` | Current path | Always |
| `git_branch` | Branch name | `.git` directory |
| `git_status` | Modified/staged/untracked | `.git` directory |
| `nodejs` | Node.js version | `package.json` |
| `rust` | Rust version | `Cargo.toml` |
| `python` | Python version | `*.py`, `pyproject.toml` |
| `golang` | Go version | `go.mod` |
| `swift` | Swift version | `Package.swift` |
| `bun` | Bun version | `bun.lockb`, `bunfig.toml` |
| `docker_context` | Docker context | `Dockerfile` |
| `kubernetes` | K8s context | `kubeconfig` |
| `cmd_duration` | Last command time | Time > threshold |

### Disabling a module

```toml
[package]
disabled = true

[docker_context]
disabled = true
```

## Kubernetes Context (for homelab)

```toml
[kubernetes]
format = "[$symbol$context( \\($namespace\\))]($style) "
symbol = "k8s "
style = "bold blue"
disabled = false
```

## SSH Indicator

```toml
[hostname]
ssh_only = true
format = "[$hostname]($style) "
style = "bold dimmed green"
```

## Custom Modules

```toml
[custom.docker]
command = "docker ps -q | wc -l | tr -d ' '"
when = "command -v docker"
format = "[docker:$output]($style) "
style = "blue"
```
