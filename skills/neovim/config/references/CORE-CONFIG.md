# Neovim Core Configuration

Options, keymaps, and autocommands for Neovim.

## Table of Contents

- [Options](#options)
- [Keymaps](#keymaps)
- [Autocommands](#autocommands)
- [Init.lua Bootstrap](#initlua-bootstrap)
- [Directory Structure](#directory-structure)

## Options

```lua
-- lua/config/options.lua
local opt = vim.opt

-- Line numbers
opt.number = true
opt.relativenumber = true

-- Tabs & indentation
opt.tabstop = 2
opt.shiftwidth = 2
opt.expandtab = true
opt.autoindent = true
opt.smartindent = true

-- Line wrapping
opt.wrap = false

-- Search settings
opt.ignorecase = true
opt.smartcase = true
opt.hlsearch = true
opt.incsearch = true

-- Appearance
opt.termguicolors = true
opt.signcolumn = "yes"
opt.cursorline = true
opt.scrolloff = 8
opt.sidescrolloff = 8

-- Behavior
opt.splitright = true
opt.splitbelow = true
opt.clipboard = "unnamedplus"
opt.undofile = true
opt.undolevels = 10000
opt.updatetime = 200
opt.timeoutlen = 300
opt.confirm = true

-- Completion
opt.completeopt = "menu,menuone,noselect"
opt.pumheight = 10

-- Disable some built-in plugins
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1
```

## Keymaps

```lua
-- lua/config/keymaps.lua
local map = vim.keymap.set

-- Better up/down (respect wrapped lines)
map({ "n", "x" }, "j", "v:count == 0 ? 'gj' : 'j'", { expr = true, silent = true })
map({ "n", "x" }, "k", "v:count == 0 ? 'gk' : 'k'", { expr = true, silent = true })

-- Move lines
map("n", "<A-j>", "<cmd>m .+1<cr>==", { desc = "Move Down" })
map("n", "<A-k>", "<cmd>m .-2<cr>==", { desc = "Move Up" })
map("v", "<A-j>", ":m '>+1<cr>gv=gv", { desc = "Move Down" })
map("v", "<A-k>", ":m '<-2<cr>gv=gv", { desc = "Move Up" })

-- Clear search highlight
map("n", "<Esc>", "<cmd>nohlsearch<cr>", { desc = "Clear Highlight" })

-- Better indenting (stay in visual mode)
map("v", "<", "<gv")
map("v", ">", ">gv")

-- Window navigation
map("n", "<C-h>", "<C-w>h", { desc = "Go to Left Window" })
map("n", "<C-j>", "<C-w>j", { desc = "Go to Lower Window" })
map("n", "<C-k>", "<C-w>k", { desc = "Go to Upper Window" })
map("n", "<C-l>", "<C-w>l", { desc = "Go to Right Window" })

-- Resize windows
map("n", "<C-Up>", "<cmd>resize +2<cr>", { desc = "Increase Height" })
map("n", "<C-Down>", "<cmd>resize -2<cr>", { desc = "Decrease Height" })
map("n", "<C-Left>", "<cmd>vertical resize -2<cr>", { desc = "Decrease Width" })
map("n", "<C-Right>", "<cmd>vertical resize +2<cr>", { desc = "Increase Width" })

-- Buffers
map("n", "<S-h>", "<cmd>bprevious<cr>", { desc = "Previous Buffer" })
map("n", "<S-l>", "<cmd>bnext<cr>", { desc = "Next Buffer" })
map("n", "<leader>bd", "<cmd>bdelete<cr>", { desc = "Delete Buffer" })

-- Save and quit
map({ "i", "x", "n", "s" }, "<C-s>", "<cmd>w<cr><esc>", { desc = "Save File" })
map("n", "<leader>qq", "<cmd>qa<cr>", { desc = "Quit All" })

-- Diagnostic
map("n", "<leader>cd", vim.diagnostic.open_float, { desc = "Line Diagnostics" })
```

## Autocommands

```lua
-- lua/config/autocmds.lua
local autocmd = vim.api.nvim_create_autocmd
local augroup = vim.api.nvim_create_augroup

-- Highlight on yank
autocmd("TextYankPost", {
  group = augroup("highlight_yank", {}),
  callback = function()
    vim.highlight.on_yank()
  end,
})

-- Resize splits on window resize
autocmd("VimResized", {
  group = augroup("resize_splits", {}),
  callback = function()
    vim.cmd("tabdo wincmd =")
  end,
})

-- Go to last location when opening a buffer
autocmd("BufReadPost", {
  group = augroup("last_loc", {}),
  callback = function()
    local mark = vim.api.nvim_buf_get_mark(0, '"')
    local lcount = vim.api.nvim_buf_line_count(0)
    if mark[1] > 0 and mark[1] <= lcount then
      pcall(vim.api.nvim_win_set_cursor, 0, mark)
    end
  end,
})

-- Close some filetypes with q
autocmd("FileType", {
  group = augroup("close_with_q", {}),
  pattern = { "help", "lspinfo", "man", "notify", "qf", "checkhealth" },
  callback = function(event)
    vim.bo[event.buf].buflisted = false
    vim.keymap.set("n", "q", "<cmd>close<cr>", { buffer = event.buf, silent = true })
  end,
})

-- Auto create directory when saving
autocmd("BufWritePre", {
  group = augroup("auto_create_dir", {}),
  callback = function(event)
    if event.match:match("^%w%w+://") then
      return
    end
    local file = vim.loop.fs_realpath(event.match) or event.match
    vim.fn.mkdir(vim.fn.fnamemodify(file, ":p:h"), "p")
  end,
})

-- Wrap and spell in text filetypes
autocmd("FileType", {
  group = augroup("wrap_spell", {}),
  pattern = { "gitcommit", "markdown" },
  callback = function()
    vim.opt_local.wrap = true
    vim.opt_local.spell = true
  end,
})
```

## Init.lua Bootstrap

```lua
-- init.lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- Leader key (must be before lazy)
vim.g.mapleader = " "
vim.g.maplocalleader = "\\"

-- Load lazy.nvim
require("lazy").setup({
  spec = {
    { import = "plugins" },
  },
  defaults = {
    lazy = false,
    version = false,
  },
  install = { colorscheme = { "tokyonight", "habamax" } },
  checker = { enabled = true },
  performance = {
    rtp = {
      disabled_plugins = {
        "gzip", "tarPlugin", "tohtml", "tutor", "zipPlugin",
      },
    },
  },
})

-- Load configuration
require("config.options")
require("config.keymaps")
require("config.autocmds")
```

## Directory Structure

```
~/.config/nvim/
├── init.lua                 # Entry point (bootstrap lazy.nvim)
├── lua/
│   ├── config/
│   │   ├── options.lua      # Vim options
│   │   ├── keymaps.lua      # Key mappings
│   │   └── autocmds.lua     # Autocommands
│   └── plugins/
│       ├── colorscheme.lua  # Theme
│       ├── editor.lua       # Core editing plugins
│       ├── lsp.lua          # LSP configuration
│       ├── completion.lua   # Autocompletion
│       ├── treesitter.lua   # Syntax highlighting
│       └── ui.lua           # UI enhancements
```

## LazyVim Structure (Alternative)

For users using LazyVim distribution:

```
~/.config/nvim/
├── init.lua
├── lazyvim.json              # LazyVim extras config
├── lua/
│   ├── config/
│   │   ├── lazy.lua          # lazy.nvim setup with LazyVim
│   │   ├── options.lua       # Override LazyVim options
│   │   ├── keymaps.lua       # Additional keymaps
│   │   └── autocmds.lua      # Additional autocmds
│   └── plugins/
│       ├── disabled.lua      # Disable LazyVim plugins
│       └── extend.lua        # Extend/override plugins
```
