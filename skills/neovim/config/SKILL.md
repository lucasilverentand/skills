---
name: nvim-config
description: Configures, generates, and troubleshoots modern Neovim setups with Lua and lazy.nvim plugin manager. Use when setting up Neovim, adding plugins, configuring LSP, customizing keybindings, troubleshooting config issues, or working with LazyVim distribution.
argument-hint: [action or question]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Neovim Configuration

Helps with modern Lua-based Neovim configurations using lazy.nvim.

## Your Task

Based on $ARGUMENTS, help with Neovim configuration:

1. **Detect config location**: Check `~/.config/nvim` or `$XDG_CONFIG_HOME/nvim`
2. **Understand current setup**: Read existing files
3. **Make targeted changes**: Only modify what's necessary
4. **Validate changes**: Ensure syntax is correct
5. **Provide guidance**: Explain what was done

## Configuration Detection

Check in order:

1. `$XDG_CONFIG_HOME/nvim` (if set)
2. `~/.config/nvim` (standard)
3. `~/.nvim` (legacy)

**LazyVim Detection**: Look for `LazyVim/LazyVim` in plugin specs or `lazyvim.json`.

## Quick Actions

### Generate New Config

Create `~/.config/nvim/init.lua`:

```lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

vim.g.mapleader = " "
vim.g.maplocalleader = "\\"

require("lazy").setup({
  spec = { { import = "plugins" } },
  defaults = { lazy = false },
  install = { colorscheme = { "tokyonight", "habamax" } },
  checker = { enabled = true },
})

require("config.options")
require("config.keymaps")
require("config.autocmds")
```

### Add a Plugin

Plugin spec format for `lua/plugins/*.lua`:

```lua
return {
  {
    "username/repo",
    event = "VeryLazy",        -- Lazy load event
    cmd = "CommandName",       -- Or load on command
    keys = {                   -- Or load on keymap
      { "<leader>xx", "<cmd>Command<cr>", desc = "Description" },
    },
    opts = {                   -- Passed to setup()
      option = "value",
    },
  },
}
```

### Disable a Plugin (LazyVim)

```lua
return {
  { "plugin/name", enabled = false },
}
```

### Extend a Plugin (LazyVim)

```lua
return {
  {
    "nvim-telescope/telescope.nvim",
    opts = function(_, opts)
      opts.defaults = opts.defaults or {}
      opts.defaults.layout_strategy = "horizontal"
    end,
  },
}
```

## Common Configurations

### Essential Options

```lua
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true
vim.opt.termguicolors = true
vim.opt.clipboard = "unnamedplus"
vim.opt.undofile = true
```

### Essential Keymaps

```lua
local map = vim.keymap.set
map("n", "<C-h>", "<C-w>h", { desc = "Go to Left Window" })
map("n", "<C-j>", "<C-w>j", { desc = "Go to Lower Window" })
map("n", "<C-k>", "<C-w>k", { desc = "Go to Upper Window" })
map("n", "<C-l>", "<C-w>l", { desc = "Go to Right Window" })
map("n", "<S-h>", "<cmd>bprevious<cr>", { desc = "Previous Buffer" })
map("n", "<S-l>", "<cmd>bnext<cr>", { desc = "Next Buffer" })
map({ "i", "n" }, "<C-s>", "<cmd>w<cr><esc>", { desc = "Save File" })
```

## Validation

### Check Lua Syntax

```bash
luac -p ~/.config/nvim/init.lua
find ~/.config/nvim -name "*.lua" -exec luac -p {} \;
```

### Headless Config Test

```bash
nvim --headless -c 'quitall'
```

### Health Check

```vim
:checkhealth
:checkhealth lazy
:checkhealth lspconfig
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Plugins not loading | `:Lazy sync` and `:Lazy health` |
| LSP not starting | `:LspInfo` and `:Mason` to install servers |
| Treesitter issues | `:TSUpdate` and `:TSInstallInfo` |
| Syntax error | `luac -p <file>` to find issue |

### Reset Configuration

```bash
# Backup and remove
mv ~/.config/nvim ~/.config/nvim.bak
mv ~/.local/share/nvim ~/.local/share/nvim.bak
mv ~/.local/state/nvim ~/.local/state/nvim.bak
mv ~/.cache/nvim ~/.cache/nvim.bak
```

### Debug Loading

```lua
-- Add to init.lua temporarily
vim.opt.verbose = 1
vim.opt.verbosefile = "/tmp/nvim.log"
```

## Detailed References

For complete configurations:

- **Plugins**: See [references/PLUGINS.md](references/PLUGINS.md) for LSP, completion, treesitter, telescope, and more
- **Core Config**: See [references/CORE-CONFIG.md](references/CORE-CONFIG.md) for options, keymaps, autocmds, and init.lua

## Documentation Lookup

Use Context7 MCP tools for current plugin documentation:

1. `mcp__context7__resolve-library-id` - Find library ID
2. `mcp__context7__query-docs` - Query documentation

Example queries:

- "lazy.nvim event types"
- "nvim-lspconfig server settings"
- "LazyVim custom plugins"

## Tips

- Start simple, add plugins as needed
- Use lazy loading (`event`, `cmd`, `ft`, `keys`) to improve startup
- Run `:checkhealth` regularly
- Keep config in a git repository
- Split config into logical files
- For LazyVim, use extras instead of manual configuration
