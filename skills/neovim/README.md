# Neovim Skills

Skills for configuring and troubleshooting Neovim.

## Skills

| Skill | Description |
|-------|-------------|
| [config](./config/) | Generate, modify, and troubleshoot Neovim configurations |

## Usage

```
/nvim-config                   # Help with Neovim configuration
/nvim-config add telescope     # Add telescope.nvim plugin
/nvim-config lsp rust          # Configure Rust LSP
```

## Supported Features

- **Plugin Management** - lazy.nvim, packer.nvim
- **Distributions** - LazyVim, LunarVim, AstroNvim, NvChad
- **LSP Configuration** - mason.nvim, nvim-lspconfig
- **Treesitter** - Syntax highlighting and code navigation
- **Keybindings** - which-key, custom mappings
- **Colorschemes** - Popular themes and customization

## Config Detection

Automatically detects config location:

1. `$XDG_CONFIG_HOME/nvim`
2. `~/.config/nvim`
3. `~/.nvim`

Identifies LazyVim by checking for `lua/config/lazy.lua`.
