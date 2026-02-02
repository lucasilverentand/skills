---
name: nvim-config
description: Configure, generate, modify, and troubleshoot Neovim configurations. Use when the user wants to set up Neovim, add plugins, configure LSP, customize keybindings, troubleshoot config issues, or work with LazyVim. Supports modern Lua-based configs with lazy.nvim.
argument-hint: [action or question]
---

# Neovim Configuration Skill

You are a Neovim configuration expert. Help users create, modify, and troubleshoot their Neovim setups using modern Lua-based configurations with lazy.nvim as the plugin manager.

## Your Task

Based on `$ARGUMENTS`, help the user with their Neovim configuration:

1. **Detect the config location** - Check standard paths for existing configs
2. **Understand the current setup** - Read existing files to understand structure
3. **Make targeted changes** - Only modify what's necessary
4. **Validate changes** - Ensure the config is syntactically correct
5. **Provide guidance** - Explain what was done and how to use it

## Configuration Detection

Check these paths in order:

1. `$XDG_CONFIG_HOME/nvim` (if XDG_CONFIG_HOME is set)
2. `~/.config/nvim` (standard location)
3. `~/.nvim` (legacy)

**LazyVim Detection:**

- Check for `lua/config/lazy.lua` with LazyVim spec
- Check for `.lazyvim.json` or `lazyvim.json`
- Look for `LazyVim/LazyVim` in plugin specs

**Standard lazy.nvim Detection:**

- Check for `lua/plugins/` directory
- Look for lazy.nvim bootstrap in `init.lua`

## Actions

### Generate New Config

When creating a fresh Neovim configuration:

```lua
-- init.lua - Bootstrap lazy.nvim
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
        "gzip",
        "tarPlugin",
        "tohtml",
        "tutor",
        "zipPlugin",
      },
    },
  },
})

-- Load configuration
require("config.options")
require("config.keymaps")
require("config.autocmds")
```

**Directory Structure:**

```
~/.config/nvim/
├── init.lua
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

### LazyVim Setup

For users wanting a pre-configured distribution:

```lua
-- init.lua for LazyVim
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

require("lazy").setup({
  spec = {
    { "LazyVim/LazyVim", import = "lazyvim.plugins" },
    -- Import LazyVim extras
    { import = "lazyvim.plugins.extras.lang.typescript" },
    { import = "lazyvim.plugins.extras.lang.json" },
    { import = "lazyvim.plugins.extras.linting.eslint" },
    { import = "lazyvim.plugins.extras.formatting.prettier" },
    -- Your custom plugins
    { import = "plugins" },
  },
  defaults = {
    lazy = false,
    version = false,
  },
  install = { colorscheme = { "tokyonight", "habamax" } },
  checker = { enabled = true },
})
```

**LazyVim Directory Structure:**

```
~/.config/nvim/
├── init.lua
├── lazyvim.json              # LazyVim extras config
├── lua/
│   ├── config/
│   │   ├── lazy.lua          # lazy.nvim setup
│   │   ├── options.lua       # Override LazyVim options
│   │   ├── keymaps.lua       # Additional keymaps
│   │   └── autocmds.lua      # Additional autocmds
│   └── plugins/
│       ├── disabled.lua      # Disable LazyVim plugins
│       └── extend.lua        # Extend/override plugins
```

### Add Plugins

Plugin spec format for lazy.nvim:

```lua
-- lua/plugins/example.lua
return {
  -- Simple plugin
  "username/repo",

  -- Plugin with options
  {
    "username/repo",
    dependencies = { "other/plugin" },
    event = "VeryLazy",          -- Lazy load on event
    cmd = "CommandName",         -- Lazy load on command
    ft = { "lua", "python" },    -- Lazy load on filetype
    keys = {                     -- Lazy load on keymap
      { "<leader>xx", "<cmd>Command<cr>", desc = "Description" },
    },
    opts = {                     -- Passed to setup()
      option = "value",
    },
    config = function(_, opts)   -- Custom config function
      require("plugin").setup(opts)
    end,
  },

  -- Disable a LazyVim default plugin
  { "plugin/name", enabled = false },

  -- Extend a LazyVim plugin
  {
    "nvim-telescope/telescope.nvim",
    opts = function(_, opts)
      opts.defaults = opts.defaults or {}
      opts.defaults.layout_strategy = "horizontal"
    end,
  },
}
```

**Common Plugin Categories:**

#### Colorschemes

```lua
-- lua/plugins/colorscheme.lua
return {
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    opts = {
      style = "night",
      transparent = false,
    },
    config = function(_, opts)
      require("tokyonight").setup(opts)
      vim.cmd.colorscheme("tokyonight")
    end,
  },
  -- Alternatives
  { "catppuccin/nvim", name = "catppuccin" },
  { "rebelot/kanagawa.nvim" },
  { "rose-pine/neovim", name = "rose-pine" },
}
```

#### File Explorer

```lua
-- lua/plugins/explorer.lua
return {
  {
    "nvim-neo-tree/neo-tree.nvim",
    branch = "v3.x",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-tree/nvim-web-devicons",
      "MunifTanjim/nui.nvim",
    },
    cmd = "Neotree",
    keys = {
      { "<leader>e", "<cmd>Neotree toggle<cr>", desc = "Explorer" },
    },
    opts = {
      filesystem = {
        follow_current_file = { enabled = true },
        hijack_netrw_behavior = "open_current",
      },
    },
  },
}
```

#### Fuzzy Finder

```lua
-- lua/plugins/telescope.lua
return {
  {
    "nvim-telescope/telescope.nvim",
    tag = "0.1.8",
    dependencies = {
      "nvim-lua/plenary.nvim",
      { "nvim-telescope/telescope-fzf-native.nvim", build = "make" },
    },
    cmd = "Telescope",
    keys = {
      { "<leader>ff", "<cmd>Telescope find_files<cr>", desc = "Find Files" },
      { "<leader>fg", "<cmd>Telescope live_grep<cr>", desc = "Live Grep" },
      { "<leader>fb", "<cmd>Telescope buffers<cr>", desc = "Buffers" },
      { "<leader>fh", "<cmd>Telescope help_tags<cr>", desc = "Help Tags" },
      { "<leader>fr", "<cmd>Telescope oldfiles<cr>", desc = "Recent Files" },
      { "<leader><leader>", "<cmd>Telescope find_files<cr>", desc = "Find Files" },
    },
    opts = {
      defaults = {
        layout_strategy = "horizontal",
        sorting_strategy = "ascending",
        layout_config = {
          horizontal = { prompt_position = "top" },
        },
      },
    },
    config = function(_, opts)
      local telescope = require("telescope")
      telescope.setup(opts)
      telescope.load_extension("fzf")
    end,
  },
}
```

### LSP Configuration

#### mason.nvim + nvim-lspconfig Setup

```lua
-- lua/plugins/lsp.lua
return {
  -- LSP installer
  {
    "williamboman/mason.nvim",
    cmd = "Mason",
    build = ":MasonUpdate",
    opts = {
      ensure_installed = {
        "stylua",
        "shfmt",
        "prettier",
        "eslint_d",
      },
    },
    config = function(_, opts)
      require("mason").setup(opts)
      local mr = require("mason-registry")
      mr:on("package:install:success", function()
        vim.defer_fn(function()
          require("lazy.core.handler.event").trigger({
            event = "FileType",
            buf = vim.api.nvim_get_current_buf(),
          })
        end, 100)
      end)
      local ensure_installed = opts.ensure_installed or {}
      mr.refresh(function()
        for _, tool in ipairs(ensure_installed) do
          local p = mr.get_package(tool)
          if not p:is_installed() then
            p:install()
          end
        end
      end)
    end,
  },

  -- LSP config
  {
    "neovim/nvim-lspconfig",
    event = { "BufReadPre", "BufNewFile" },
    dependencies = {
      "mason.nvim",
      "williamboman/mason-lspconfig.nvim",
    },
    opts = {
      servers = {
        lua_ls = {
          settings = {
            Lua = {
              workspace = { checkThirdParty = false },
              completion = { callSnippet = "Replace" },
              diagnostics = { globals = { "vim" } },
            },
          },
        },
        ts_ls = {},
        pyright = {},
        rust_analyzer = {},
        gopls = {},
      },
    },
    config = function(_, opts)
      local lspconfig = require("lspconfig")
      local mason_lspconfig = require("mason-lspconfig")

      -- Default capabilities with nvim-cmp
      local capabilities = vim.lsp.protocol.make_client_capabilities()
      local has_cmp, cmp_nvim_lsp = pcall(require, "cmp_nvim_lsp")
      if has_cmp then
        capabilities = vim.tbl_deep_extend("force", capabilities, cmp_nvim_lsp.default_capabilities())
      end

      -- Default on_attach
      local on_attach = function(client, bufnr)
        local map = function(mode, lhs, rhs, desc)
          vim.keymap.set(mode, lhs, rhs, { buffer = bufnr, desc = desc })
        end

        map("n", "gd", vim.lsp.buf.definition, "Go to Definition")
        map("n", "gD", vim.lsp.buf.declaration, "Go to Declaration")
        map("n", "gr", vim.lsp.buf.references, "Go to References")
        map("n", "gi", vim.lsp.buf.implementation, "Go to Implementation")
        map("n", "K", vim.lsp.buf.hover, "Hover Documentation")
        map("n", "<leader>ca", vim.lsp.buf.code_action, "Code Action")
        map("n", "<leader>cr", vim.lsp.buf.rename, "Rename Symbol")
        map("n", "<leader>cf", function() vim.lsp.buf.format({ async = true }) end, "Format")
        map("n", "[d", vim.diagnostic.goto_prev, "Previous Diagnostic")
        map("n", "]d", vim.diagnostic.goto_next, "Next Diagnostic")
      end

      mason_lspconfig.setup({
        ensure_installed = vim.tbl_keys(opts.servers),
      })

      mason_lspconfig.setup_handlers({
        function(server_name)
          local server_opts = opts.servers[server_name] or {}
          server_opts.capabilities = vim.tbl_deep_extend("force", capabilities, server_opts.capabilities or {})
          server_opts.on_attach = on_attach
          lspconfig[server_name].setup(server_opts)
        end,
      })
    end,
  },
}
```

#### Autocompletion

```lua
-- lua/plugins/completion.lua
return {
  {
    "hrsh7th/nvim-cmp",
    event = "InsertEnter",
    dependencies = {
      "hrsh7th/cmp-nvim-lsp",
      "hrsh7th/cmp-buffer",
      "hrsh7th/cmp-path",
      "L3MON4D3/LuaSnip",
      "saadparwaiz1/cmp_luasnip",
      "rafamadriz/friendly-snippets",
    },
    opts = function()
      local cmp = require("cmp")
      local luasnip = require("luasnip")

      require("luasnip.loaders.from_vscode").lazy_load()

      return {
        snippet = {
          expand = function(args)
            luasnip.lsp_expand(args.body)
          end,
        },
        mapping = cmp.mapping.preset.insert({
          ["<C-n>"] = cmp.mapping.select_next_item(),
          ["<C-p>"] = cmp.mapping.select_prev_item(),
          ["<C-b>"] = cmp.mapping.scroll_docs(-4),
          ["<C-f>"] = cmp.mapping.scroll_docs(4),
          ["<C-Space>"] = cmp.mapping.complete(),
          ["<C-e>"] = cmp.mapping.abort(),
          ["<CR>"] = cmp.mapping.confirm({ select = true }),
          ["<Tab>"] = cmp.mapping(function(fallback)
            if cmp.visible() then
              cmp.select_next_item()
            elseif luasnip.expand_or_jumpable() then
              luasnip.expand_or_jump()
            else
              fallback()
            end
          end, { "i", "s" }),
          ["<S-Tab>"] = cmp.mapping(function(fallback)
            if cmp.visible() then
              cmp.select_prev_item()
            elseif luasnip.jumpable(-1) then
              luasnip.jump(-1)
            else
              fallback()
            end
          end, { "i", "s" }),
        }),
        sources = cmp.config.sources({
          { name = "nvim_lsp" },
          { name = "luasnip" },
          { name = "path" },
        }, {
          { name = "buffer" },
        }),
        formatting = {
          format = function(entry, vim_item)
            vim_item.menu = ({
              nvim_lsp = "[LSP]",
              luasnip = "[Snip]",
              buffer = "[Buf]",
              path = "[Path]",
            })[entry.source.name]
            return vim_item
          end,
        },
      }
    end,
  },
}
```

#### Treesitter

```lua
-- lua/plugins/treesitter.lua
return {
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    event = { "BufReadPost", "BufNewFile" },
    dependencies = {
      "nvim-treesitter/nvim-treesitter-textobjects",
    },
    opts = {
      ensure_installed = {
        "bash",
        "c",
        "html",
        "javascript",
        "json",
        "lua",
        "luadoc",
        "luap",
        "markdown",
        "markdown_inline",
        "python",
        "query",
        "regex",
        "tsx",
        "typescript",
        "vim",
        "vimdoc",
        "yaml",
      },
      auto_install = true,
      highlight = { enable = true },
      indent = { enable = true },
      textobjects = {
        select = {
          enable = true,
          lookahead = true,
          keymaps = {
            ["af"] = "@function.outer",
            ["if"] = "@function.inner",
            ["ac"] = "@class.outer",
            ["ic"] = "@class.inner",
          },
        },
        move = {
          enable = true,
          goto_next_start = { ["]f"] = "@function.outer", ["]c"] = "@class.outer" },
          goto_next_end = { ["]F"] = "@function.outer", ["]C"] = "@class.outer" },
          goto_previous_start = { ["[f"] = "@function.outer", ["[c"] = "@class.outer" },
          goto_previous_end = { ["[F"] = "@function.outer", ["[C"] = "@class.outer" },
        },
      },
    },
    config = function(_, opts)
      require("nvim-treesitter.configs").setup(opts)
    end,
  },
}
```

### Options Configuration

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

### Keymaps Configuration

```lua
-- lua/config/keymaps.lua
local map = vim.keymap.set

-- Better up/down
map({ "n", "x" }, "j", "v:count == 0 ? 'gj' : 'j'", { expr = true, silent = true })
map({ "n", "x" }, "k", "v:count == 0 ? 'gk' : 'k'", { expr = true, silent = true })

-- Move lines
map("n", "<A-j>", "<cmd>m .+1<cr>==", { desc = "Move Down" })
map("n", "<A-k>", "<cmd>m .-2<cr>==", { desc = "Move Up" })
map("v", "<A-j>", ":m '>+1<cr>gv=gv", { desc = "Move Down" })
map("v", "<A-k>", ":m '<-2<cr>gv=gv", { desc = "Move Up" })

-- Clear search highlight
map("n", "<Esc>", "<cmd>nohlsearch<cr>", { desc = "Clear Highlight" })

-- Better indenting
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

-- Save
map({ "i", "x", "n", "s" }, "<C-s>", "<cmd>w<cr><esc>", { desc = "Save File" })

-- Quit
map("n", "<leader>qq", "<cmd>qa<cr>", { desc = "Quit All" })

-- Diagnostic
map("n", "<leader>cd", vim.diagnostic.open_float, { desc = "Line Diagnostics" })
```

### Autocommands Configuration

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
  pattern = {
    "help",
    "lspinfo",
    "man",
    "notify",
    "qf",
    "checkhealth",
  },
  callback = function(event)
    vim.bo[event.buf].buflisted = false
    vim.keymap.set("n", "q", "<cmd>close<cr>", { buffer = event.buf, silent = true })
  end,
})

-- Auto create dir when saving a file
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

-- Wrap and check for spelling in text filetypes
autocmd("FileType", {
  group = augroup("wrap_spell", {}),
  pattern = { "gitcommit", "markdown" },
  callback = function()
    vim.opt_local.wrap = true
    vim.opt_local.spell = true
  end,
})
```

## Headless Testing

Test your Neovim configuration without launching the UI. This is useful for CI/CD pipelines, automated validation, and quick syntax checks.

### Quick Syntax Validation

```bash
# Check Lua syntax for all config files
find ~/.config/nvim -name "*.lua" -exec luac -p {} \;

# Check a specific file
luac -p ~/.config/nvim/init.lua
```

### Headless Config Test

Test that your config loads without errors:

```bash
# Basic headless test - exits with error code if config fails
nvim --headless -c 'quitall'

# With startup time profiling
nvim --headless --startuptime /tmp/nvim-startup.log -c 'quitall'
cat /tmp/nvim-startup.log

# Capture any error messages
nvim --headless -c 'quitall' 2>&1
```

### Test Specific Lua Code

```bash
# Execute Lua code and exit
nvim --headless -c 'lua print(vim.fn.stdpath("config"))' -c 'quitall'

# Test that a module loads correctly
nvim --headless -c 'lua require("config.options")' -c 'quitall'

# Test plugin loading
nvim --headless -c 'lua require("lazy").sync()' -c 'quitall'
```

### Isolated Environment Testing

Test config changes in an isolated environment without affecting your main setup:

```bash
# Create temporary config directory
export NVIM_TEST_DIR=$(mktemp -d)
mkdir -p "$NVIM_TEST_DIR/config/nvim"
mkdir -p "$NVIM_TEST_DIR/data"
mkdir -p "$NVIM_TEST_DIR/state"
mkdir -p "$NVIM_TEST_DIR/cache"

# Copy your config to test
cp -r ~/.config/nvim/* "$NVIM_TEST_DIR/config/nvim/"

# Run Neovim with isolated paths
XDG_CONFIG_HOME="$NVIM_TEST_DIR/config" \
XDG_DATA_HOME="$NVIM_TEST_DIR/data" \
XDG_STATE_HOME="$NVIM_TEST_DIR/state" \
XDG_CACHE_HOME="$NVIM_TEST_DIR/cache" \
nvim --headless -c 'quitall'

# Check exit code
echo "Exit code: $?"

# Cleanup
rm -rf "$NVIM_TEST_DIR"
```

### Health Check in Headless Mode

```bash
# Run checkhealth and capture output
nvim --headless -c 'checkhealth' -c 'write! /tmp/nvim-health.txt' -c 'quitall'
cat /tmp/nvim-health.txt

# Run specific health checks
nvim --headless -c 'checkhealth lazy' -c 'write! /tmp/lazy-health.txt' -c 'quitall'
nvim --headless -c 'checkhealth lspconfig' -c 'write! /tmp/lsp-health.txt' -c 'quitall'
```

### Plugin Sync in Headless Mode

```bash
# Install/update all plugins headlessly
nvim --headless "+Lazy! sync" +qa

# Install plugins and show output
nvim --headless -c 'lua require("lazy").sync({ wait = true })' -c 'quitall'
```

### CI/CD Integration Script

Create a test script for your Neovim config repository:

```bash
#!/bin/bash
# test-nvim-config.sh

set -e

NVIM_CONFIG_DIR="${1:-$HOME/.config/nvim}"

echo "=== Testing Neovim Configuration ==="
echo "Config directory: $NVIM_CONFIG_DIR"

# Check Lua syntax
echo -e "\n--- Checking Lua syntax ---"
find "$NVIM_CONFIG_DIR" -name "*.lua" -exec luac -p {} \;
echo "✓ All Lua files have valid syntax"

# Test config loads
echo -e "\n--- Testing config loads ---"
if nvim --headless -c 'quitall' 2>&1; then
    echo "✓ Config loads without errors"
else
    echo "✗ Config failed to load"
    exit 1
fi

# Profile startup time
echo -e "\n--- Startup time profile ---"
nvim --headless --startuptime /tmp/nvim-startup.log -c 'quitall'
tail -1 /tmp/nvim-startup.log

# Run health check
echo -e "\n--- Running health checks ---"
nvim --headless -c 'redir! > /tmp/nvim-health.txt | silent checkhealth | redir END' -c 'quitall' 2>/dev/null
if grep -q "ERROR" /tmp/nvim-health.txt; then
    echo "⚠ Health check found errors:"
    grep "ERROR" /tmp/nvim-health.txt
else
    echo "✓ Health checks passed"
fi

echo -e "\n=== All tests passed ==="
```

### Verbose Debugging

```bash
# Maximum verbosity for debugging
nvim --headless -V10/tmp/nvim-verbose.log -c 'quitall'
cat /tmp/nvim-verbose.log

# Debug specific plugin loading
nvim --headless -c 'lua vim.lsp.set_log_level("debug")' -c 'edit test.lua' -c 'sleep 2' -c 'quitall'
cat ~/.local/state/nvim/lsp.log
```

## Troubleshooting

### Common Issues

**1. Plugins not loading**

```vim
:Lazy           " Open lazy.nvim UI
:Lazy sync      " Update all plugins
:Lazy health    " Check plugin health
:checkhealth    " Run Neovim health checks
```

**2. LSP not starting**

```vim
:LspInfo        " Check LSP status for current buffer
:LspLog         " View LSP logs
:Mason          " Open Mason UI to install servers
:MasonLog       " View Mason installation logs
```

**3. Treesitter issues**

```vim
:TSUpdate       " Update all parsers
:TSInstall <lang>   " Install specific parser
:TSInstallInfo  " View installed parsers
```

**4. Verify Lua syntax**

```bash
# Check init.lua syntax
luac -p ~/.config/nvim/init.lua

# Check all Lua files
find ~/.config/nvim -name "*.lua" -exec luac -p {} \;
```

**5. Debug loading order**

```lua
-- Add to init.lua temporarily
vim.opt.verbose = 1
vim.opt.verbosefile = "/tmp/nvim.log"
```

**6. Reset configuration**

```bash
# Backup current config
mv ~/.config/nvim ~/.config/nvim.bak
mv ~/.local/share/nvim ~/.local/share/nvim.bak
mv ~/.local/state/nvim ~/.local/state/nvim.bak
mv ~/.cache/nvim ~/.cache/nvim.bak
```

### Error Correction Checklist

When modifying configs:

1. **Before changes:**
   - Read the existing file structure
   - Identify if using LazyVim or custom setup
   - Note any custom keymaps that might conflict

2. **After changes:**
   - Verify Lua syntax with `luac -p <file>`
   - Test by opening Neovim
   - Check `:messages` for errors
   - Run `:checkhealth` for issues

3. **Common mistakes:**
   - Missing `return` statement in plugin specs
   - Duplicate keys in opts tables
   - Wrong lazy.nvim event names
   - Missing dependencies
   - Circular requires

## Documentation Lookup

When you need current documentation for plugins or Neovim APIs, use the Context7 MCP tools:

1. **Resolve library ID first:**
   - Use `mcp__context7__resolve-library-id` to find the correct library
   - Common libraries: `folke/lazy.nvim`, `neovim/nvim-lspconfig`, `LazyVim/LazyVim`

2. **Query documentation:**
   - Use `mcp__context7__query-docs` with specific questions
   - Ask about configuration options, APIs, events

**Example queries:**

- "lazy.nvim event types and when to use them"
- "nvim-lspconfig server settings for typescript"
- "LazyVim how to add custom plugins"
- "nvim-treesitter textobjects configuration"

## Tips

- **Start simple:** Begin with a minimal config and add plugins as needed
- **Use lazy loading:** Set appropriate `event`, `cmd`, `ft`, or `keys` to improve startup time
- **Read plugin docs:** Most plugins have excellent documentation
- **Check health:** Run `:checkhealth` regularly to catch issues
- **Version control:** Keep your config in a git repository
- **Modular structure:** Split config into logical files for maintainability
- **LazyVim extras:** Use LazyVim's extras for common language setups instead of manual configuration
