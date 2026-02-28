# LSP Configuration

Each language server is configured via `nvim-lspconfig`. Install servers via Mason (`:MasonInstall <name>`) and configure in `lua/plugins/lsp.lua`.

## Shared on_attach and capabilities

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
end
```

Pass both `capabilities` and `on_attach` to every server setup call.

## TypeScript

```lua
-- Server: ts_ls (installed via Mason)
require("lspconfig").ts_ls.setup({
  capabilities = capabilities,
  on_attach = function(client, bufnr)
    on_attach(client, bufnr)
    -- Use Biome for formatting instead of tsserver
    client.server_capabilities.documentFormattingProvider = false
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
      },
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

## Go

```lua
-- Server: gopls (installed via Mason)
require("lspconfig").gopls.setup({
  capabilities = capabilities,
  on_attach = on_attach,
  settings = {
    gopls = {
      analyses = {
        unusedparams = true,
        shadow = true,
      },
      staticcheck = true,
      gofumpt = true,
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
        autoSearchPaths = true,
        useLibraryCodeForTypes = true,
      },
    },
  },
})
```

## Verify LSP is working

1. Open a file of the target language
2. `:LspInfo` — check the server is attached to the buffer
3. Test: hover (`K`), go to definition (`gd`), completions (`<C-Space>`)
4. Run `tools/nvim-lsp-check.ts` for automated verification
