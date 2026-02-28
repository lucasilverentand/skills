# Plugin Configs

## Adding a plugin with lazy.nvim

Create a file like `lua/plugins/plugin-name.lua`:

```lua
return {
  "author/plugin-name",
  event = "BufReadPost",  -- lazy-load on buffer read
  opts = {
    -- plugin options here
  },
}
```

Reload: `:Lazy sync` inside Neovim, or restart.

## Lazy-loading strategies

| Strategy | When to use | Example |
|---|---|---|
| `event = "BufReadPost"` | Plugins that act on file content | gitsigns, treesitter |
| `event = "InsertEnter"` | Completion, snippets | nvim-cmp |
| `event = "VeryLazy"` | UI plugins not needed at startup | lualine, noice |
| `cmd = "CommandName"` | Plugins triggered by a command | Telescope, Neogit |
| `ft = "rust"` | Language-specific plugins | crates.nvim |
| `keys = { ... }` | Plugins triggered by keybindings | which-key |

## Essential plugin stack

```lua
-- lua/plugins/lsp.lua
return {
  {
    "neovim/nvim-lspconfig",
    dependencies = {
      "mason-org/mason.nvim",
      "mason-org/mason-lspconfig.nvim",
    },
    config = function()
      require("mason").setup()
      require("mason-lspconfig").setup({
        ensure_installed = {
          "ts_ls",
          "rust_analyzer",
          "lua_ls",
          "sourcekit",
        },
      })
    end,
  },
}

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
    },
    config = function()
      local cmp = require("cmp")
      local luasnip = require("luasnip")
      cmp.setup({
        snippet = {
          expand = function(args) luasnip.lsp_expand(args.body) end,
        },
        sources = cmp.config.sources({
          { name = "nvim_lsp" },
          { name = "luasnip" },
          { name = "buffer" },
          { name = "path" },
        }),
        mapping = cmp.mapping.preset.insert({
          ["<C-Space>"] = cmp.mapping.complete(),
          ["<CR>"] = cmp.mapping.confirm({ select = true }),
          ["<C-n>"] = cmp.mapping.select_next_item(),
          ["<C-p>"] = cmp.mapping.select_prev_item(),
        }),
      })
    end,
  },
}

-- lua/plugins/treesitter.lua
return {
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    event = "BufReadPost",
    opts = {
      ensure_installed = {
        "typescript", "tsx", "javascript",
        "rust", "lua", "swift",
        "json", "toml", "yaml", "markdown",
        "html", "css", "bash",
      },
      highlight = { enable = true },
      indent = { enable = true },
      incremental_selection = {
        enable = true,
        keymaps = {
          init_selection = "<C-space>",
          node_incremental = "<C-space>",
          scope_incremental = false,
          node_decremental = "<BS>",
        },
      },
    },
  },
}

-- lua/plugins/telescope.lua
return {
  {
    "nvim-telescope/telescope.nvim",
    cmd = "Telescope",
    dependencies = { "nvim-lua/plenary.nvim" },
    keys = {
      { "<leader>ff", "<cmd>Telescope find_files<cr>" },
      { "<leader>fg", "<cmd>Telescope live_grep<cr>" },
      { "<leader>fb", "<cmd>Telescope buffers<cr>" },
      { "<leader>fh", "<cmd>Telescope help_tags<cr>" },
    },
  },
}

-- lua/plugins/git.lua
return {
  {
    "lewis6991/gitsigns.nvim",
    event = "BufReadPost",
    opts = {},
  },
  {
    "NeogitOrg/neogit",
    cmd = "Neogit",
    dependencies = { "nvim-lua/plenary.nvim" },
    opts = {},
  },
}
```

## conform.nvim (formatting)

```lua
-- lua/plugins/conform.lua
return {
  "stevearc/conform.nvim",
  event = "BufWritePre",
  opts = {
    formatters_by_ft = {
      typescript = { "biome" },
      typescriptreact = { "biome" },
      javascript = { "biome" },
      json = { "biome" },
      lua = { "stylua" },
      rust = { "rustfmt" },
      swift = { "swiftformat" },
      markdown = { "prettier" },
    },
    format_on_save = {
      timeout_ms = 2000,
      lsp_fallback = true,
    },
  },
}
```

## oil.nvim (file explorer)

```lua
-- lua/plugins/oil.lua
return {
  "stevearc/oil.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  keys = {
    { "-", "<cmd>Oil<cr>", desc = "Open parent directory" },
  },
  opts = {
    view_options = {
      show_hidden = true,
    },
    keymaps = {
      ["<C-h>"] = false,  -- free up for window navigation
      ["<C-l>"] = false,
    },
  },
}
```

## mini.nvim patterns

mini.nvim provides modular Lua plugins. Pick individual modules instead of installing many small plugins:

```lua
-- lua/plugins/mini.lua
return {
  {
    "echasnovski/mini.nvim",
    event = "VeryLazy",
    config = function()
      require("mini.ai").setup()           -- better text objects (around/inside)
      require("mini.surround").setup()     -- add/change/delete surroundings
      require("mini.pairs").setup()        -- auto-close brackets
      require("mini.comment").setup()      -- gcc to toggle comments
      require("mini.statusline").setup()   -- lightweight statusline
    end,
  },
}
```

## Treesitter text objects

```lua
return {
  "nvim-treesitter/nvim-treesitter-textobjects",
  dependencies = { "nvim-treesitter/nvim-treesitter" },
  config = function()
    require("nvim-treesitter.configs").setup({
      textobjects = {
        select = {
          enable = true,
          lookahead = true,
          keymaps = {
            ["af"] = "@function.outer",
            ["if"] = "@function.inner",
            ["ac"] = "@class.outer",
            ["ic"] = "@class.inner",
            ["aa"] = "@parameter.outer",
            ["ia"] = "@parameter.inner",
          },
        },
        move = {
          enable = true,
          goto_next_start = { ["]f"] = "@function.outer", ["]c"] = "@class.outer" },
          goto_previous_start = { ["[f"] = "@function.outer", ["[c"] = "@class.outer" },
        },
      },
    })
  end,
}
```
