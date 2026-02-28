# LSP Configuration Reference

Per-language LSP setup for Neovim via nvim-lspconfig. Each server is configured in `lua/plugins/lsp.lua`.

## Shared setup

All servers share capabilities from nvim-cmp and an `on_attach` callback:

```lua
local capabilities = require("cmp_nvim_lsp").default_capabilities()

local on_attach = function(_, bufnr)
  local map = function(keys, func, desc)
    vim.keymap.set("n", keys, func, { buffer = bufnr, desc = desc })
  end
  map("gd", vim.lsp.buf.definition, "Go to definition")
  map("gr", vim.lsp.buf.references, "Go to references")
  map("gI", vim.lsp.buf.implementation, "Go to implementation")
  map("K", vim.lsp.buf.hover, "Hover documentation")
  map("<leader>ca", vim.lsp.buf.code_action, "Code action")
  map("<leader>rn", vim.lsp.buf.rename, "Rename symbol")
  map("<leader>D", vim.lsp.buf.type_definition, "Type definition")
  map("[d", vim.diagnostic.goto_prev, "Previous diagnostic")
  map("]d", vim.diagnostic.goto_next, "Next diagnostic")
  map("<leader>e", vim.diagnostic.open_float, "Show diagnostic")
end
```

## TypeScript

```lua
-- Server: ts_ls (installed via Mason)
require("lspconfig").ts_ls.setup({
  capabilities = capabilities,
  on_attach = function(client, bufnr)
    -- Disable tsserver formatting — use Biome via conform.nvim
    client.server_capabilities.documentFormattingProvider = false
    on_attach(client, bufnr)
  end,
  settings = {
    typescript = {
      inlayHints = {
        includeInlayParameterNameHints = "all",
        includeInlayVariableTypeHints = true,
        includeInlayFunctionLikeReturnTypeHints = true,
        includeInlayPropertyDeclarationTypeHints = true,
      },
    },
  },
})
```

## Rust

```lua
-- Server: rust_analyzer (installed via Mason or rustup)
require("lspconfig").rust_analyzer.setup({
  capabilities = capabilities,
  on_attach = on_attach,
  settings = {
    ["rust-analyzer"] = {
      check = { command = "clippy" },
      cargo = { features = "all" },
      procMacro = { enable = true },
      inlayHints = {
        typeHints = { enable = true },
        parameterHints = { enable = true },
        chainingHints = { enable = true },
        closureReturnTypeHints = { enable = "always" },
      },
    },
  },
})
```

## Python

```lua
-- Server: basedpyright (installed via Mason)
require("lspconfig").basedpyright.setup({
  capabilities = capabilities,
  on_attach = on_attach,
  settings = {
    basedpyright = {
      analysis = {
        typeCheckingMode = "standard",
        autoImportCompletions = true,
        inlayHints = {
          variableTypes = true,
          functionReturnTypes = true,
          callArgumentNames = true,
        },
      },
    },
  },
})

-- Ruff for linting (separate from basedpyright)
require("lspconfig").ruff.setup({
  capabilities = capabilities,
  on_attach = function(client, bufnr)
    client.server_capabilities.hoverProvider = false  -- let basedpyright handle hover
    on_attach(client, bufnr)
  end,
})
```

## Go

```lua
-- Server: gopls (installed via Mason)
require("lspconfig").gopls.setup({
  capabilities = capabilities,
  on_attach = on_attach,
  settings = {
    gopls = {
      hints = {
        assignVariableTypes = true,
        compositeLiteralFields = true,
        constantValues = true,
        functionTypeParameters = true,
        parameterNames = true,
        rangeVariableTypes = true,
      },
      analyses = {
        unusedparams = true,
        shadow = true,
        nilness = true,
        unusedwrite = true,
      },
      staticcheck = true,
      gofumpt = true,
    },
  },
})
```

## Swift

```lua
-- Server: sourcekit-lsp (bundled with Xcode, no Mason install needed)
require("lspconfig").sourcekit.setup({
  capabilities = capabilities,
  on_attach = on_attach,
  cmd = { "sourcekit-lsp" },
  filetypes = { "swift", "objective-c", "objective-cpp" },
  root_dir = require("lspconfig.util").root_pattern(
    "Package.swift", "*.xcodeproj", "*.xcworkspace", ".git"
  ),
})
```

## Lua (Neovim config)

```lua
-- Server: lua_ls (installed via Mason)
require("lspconfig").lua_ls.setup({
  capabilities = capabilities,
  on_attach = on_attach,
  settings = {
    Lua = {
      runtime = { version = "LuaJIT" },
      diagnostics = { globals = { "vim" } },
      workspace = {
        library = vim.api.nvim_get_runtime_file("", true),
        checkThirdParty = false,
      },
      telemetry = { enable = false },
    },
  },
})
```

## Tailwind CSS

```lua
-- Server: tailwindcss (installed via Mason)
require("lspconfig").tailwindcss.setup({
  capabilities = capabilities,
  on_attach = on_attach,
  filetypes = { "html", "typescriptreact", "javascriptreact", "astro" },
  settings = {
    tailwindCSS = {
      classAttributes = { "class", "className", "ngClass", "classList" },
    },
  },
})
```

## Diagnostic configuration

Global diagnostic settings (place in `init.lua` or a core config file):

```lua
vim.diagnostic.config({
  virtual_text = { spacing = 4, prefix = "●" },
  signs = true,
  underline = true,
  update_in_insert = false,
  severity_sort = true,
  float = {
    border = "rounded",
    source = true,
  },
})
```
