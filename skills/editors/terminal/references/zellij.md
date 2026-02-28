# Zellij Configuration Reference

Modern terminal multiplexer with built-in layout system and WASM plugins.

## Config

Place at `~/.config/zellij/config.kdl`:

```kdl
theme "catppuccin-mocha"
default_layout "compact"
pane_frames false
simplified_ui true
scroll_buffer_size 50000
copy_on_select true

// Use system clipboard
copy_command "pbcopy"

keybinds {
    normal {
        bind "Alt h" { MoveFocus "Left"; }
        bind "Alt l" { MoveFocus "Right"; }
        bind "Alt j" { MoveFocus "Down"; }
        bind "Alt k" { MoveFocus "Up"; }
        bind "Alt n" { NewPane; }
        bind "Alt d" { NewPane "Down"; }
        bind "Alt r" { NewPane "Right"; }
        bind "Alt w" { CloseFocus; }
        bind "Alt 1" { GoToTab 1; }
        bind "Alt 2" { GoToTab 2; }
        bind "Alt 3" { GoToTab 3; }
        bind "Alt 4" { GoToTab 4; }
    }
}
```

## Layouts

Place custom layouts at `~/.config/zellij/layouts/`.

### Dev layout

```kdl
// ~/.config/zellij/layouts/dev.kdl
layout {
    pane size=1 borderless=true {
        plugin location="zellij:tab-bar"
    }
    pane split_direction="vertical" {
        pane size="60%" {
            command "nvim"
        }
        pane split_direction="horizontal" {
            pane {
                command "bun"
                args "run" "dev"
            }
            pane
        }
    }
    pane size=2 borderless=true {
        plugin location="zellij:status-bar"
    }
}
```

### Use a layout

```zsh
zellij --layout dev
```

## Common Actions

| Shortcut | Action |
|---|---|
| `Alt h/j/k/l` | Navigate panes |
| `Alt n` | New pane |
| `Alt d` | New pane below |
| `Alt r` | New pane right |
| `Alt w` | Close pane |
| `Alt 1-4` | Go to tab |
| `Ctrl+p` → `n` | New tab (in pane mode) |

### Default mode shortcuts

Zellij shows available actions on-screen. Press `Ctrl+<key>` to enter a mode:

| Mode key | Mode | Purpose |
|---|---|---|
| `Ctrl+p` | Pane | Create, close, resize panes |
| `Ctrl+t` | Tab | Create, close, rename tabs |
| `Ctrl+n` | Resize | Resize current pane |
| `Ctrl+s` | Scroll | Scroll through pane output |
| `Ctrl+o` | Session | Detach, manage sessions |
| `Ctrl+q` | Quit | Exit zellij |

## Sessions

```zsh
zellij --session project-name    # create/attach named session
zellij list-sessions             # list sessions
zellij attach project-name       # attach to session
zellij kill-session project-name # kill session
zellij delete-session name       # delete session data
```

## tmux vs Zellij

| Aspect | tmux | Zellij |
|---|---|---|
| Maturity | Very mature, widely used | Newer, actively developed |
| Config | Plain text, manual | KDL format, built-in UI |
| Layouts | Manual or scripted | Built-in layout system |
| Plugins | Via TPM | Native WASM plugins |
| Learning curve | Steeper | Gentler (on-screen hints) |
| Session scripts | Shell scripts | KDL layout files |
| Clipboard | Requires config | Built-in |

Choose tmux for maximum compatibility and scripting. Choose zellij for a more modern default experience.
