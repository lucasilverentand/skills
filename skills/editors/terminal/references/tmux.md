# tmux Configuration Reference

Full tmux configuration and common patterns.

## Complete Config

Place at `~/.tmux.conf`:

```tmux
# Terminal and colors
set -g default-terminal "tmux-256color"
set -ag terminal-overrides ",xterm-256color:RGB"

# General
set -g mouse on
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g history-limit 50000
set -g escape-time 0
set -g focus-events on
set -g set-clipboard on

# Prefix
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Split panes (keep current path)
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
unbind '"'
unbind %

# New window (keep current path)
bind c new-window -c "#{pane_current_path}"

# Navigate panes (vim-style)
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# Resize panes
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# Copy mode (vi keys)
setw -g mode-keys vi
bind -T copy-mode-vi v send-keys -X begin-selection
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "pbcopy"
bind -T copy-mode-vi MouseDragEnd1Pane send-keys -X copy-pipe-and-cancel "pbcopy"

# Quick window switching
bind -r p previous-window
bind -r n next-window

# Reload config
bind r source-file ~/.tmux.conf \; display "Config reloaded"

# Status bar
set -g status-position top
set -g status-interval 5
set -g status-left-length 40
set -g status-right-length 80
set -g status-style "fg=white,bg=black"
set -g status-left "#[fg=green,bold] #S "
set -g status-right "#[fg=yellow] %H:%M #[fg=white]│ #[fg=cyan]%d %b "
set -g window-status-current-format "#[fg=green,bold] #I:#W "
set -g window-status-format " #I:#W "

# Pane borders
set -g pane-border-style "fg=brightblack"
set -g pane-active-border-style "fg=green"
```

## Session Management

### Named sessions

```zsh
tmux new -s project-name       # create named session
tmux attach -t project-name    # attach to session
tmux switch -t project-name    # switch session
tmux kill-session -t name      # kill session
tmux ls                        # list sessions
```

### Session scripts

Create a script to set up a dev environment:

```zsh
#!/bin/zsh
# ~/.local/bin/dev-session
SESSION="dev"

tmux new-session -d -s $SESSION -c ~/Developer/project

# Editor window
tmux rename-window -t $SESSION:1 "editor"
tmux send-keys -t $SESSION:1 "nvim" Enter

# Server window
tmux new-window -t $SESSION -n "server" -c ~/Developer/project
tmux send-keys -t $SESSION:2 "bun run dev" Enter

# Terminal window
tmux new-window -t $SESSION -n "term" -c ~/Developer/project

tmux select-window -t $SESSION:1
tmux attach -t $SESSION
```

## TPM (tmux Plugin Manager)

### Setup

```tmux
# At the bottom of ~/.tmux.conf
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'

# Initialize TPM (keep this line at the very bottom)
run '~/.tmux/plugins/tpm/tpm'
```

### Useful plugins

| Plugin | Purpose |
|---|---|
| `tmux-resurrect` | Save and restore sessions across restarts |
| `tmux-continuum` | Auto-save sessions every 15 minutes |
| `tmux-sensible` | Sensible defaults |
| `tmux-yank` | Better copy-paste integration |
| `tmux-fzf` | Fuzzy session/window/pane switching |

### Plugin commands

- `prefix + I` — install plugins
- `prefix + U` — update plugins
- `prefix + Alt+u` — remove unused plugins

## Common Keybinding Reference

| Key | Action |
|---|---|
| `C-a` | Prefix (remapped from C-b) |
| `C-a \|` | Split vertically |
| `C-a -` | Split horizontally |
| `C-a h/j/k/l` | Navigate panes |
| `C-a H/J/K/L` | Resize panes |
| `C-a c` | New window |
| `C-a n/p` | Next/previous window |
| `C-a 1-9` | Switch to window N |
| `C-a d` | Detach |
| `C-a [` | Enter copy mode |
| `C-a r` | Reload config |
| `C-a :` | Command prompt |
| `C-a ?` | List keybindings |
