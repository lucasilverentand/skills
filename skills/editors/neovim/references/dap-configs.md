# Debug Adapter Protocol (DAP) Configuration

Integrated debugging via nvim-dap with language-specific adapters.

## Core DAP Setup

```lua
-- lua/plugins/dap.lua
return {
  {
    "mfussenegger/nvim-dap",
    dependencies = {
      "rcarriga/nvim-dap-ui",
      "nvim-neotest/nvim-nio",
    },
    keys = {
      { "<leader>db", function() require("dap").toggle_breakpoint() end, desc = "Toggle breakpoint" },
      { "<leader>dB", function() require("dap").set_breakpoint(vim.fn.input("Condition: ")) end, desc = "Conditional breakpoint" },
      { "<leader>dc", function() require("dap").continue() end, desc = "Continue" },
      { "<leader>do", function() require("dap").step_over() end, desc = "Step over" },
      { "<leader>di", function() require("dap").step_into() end, desc = "Step into" },
      { "<leader>dO", function() require("dap").step_out() end, desc = "Step out" },
      { "<leader>dr", function() require("dap").repl.open() end, desc = "Open REPL" },
      { "<leader>dl", function() require("dap").run_last() end, desc = "Run last" },
      { "<leader>du", function() require("dapui").toggle() end, desc = "Toggle DAP UI" },
    },
    config = function()
      local dapui = require("dapui")
      dapui.setup()
      local dap = require("dap")
      dap.listeners.after.event_initialized["dapui"] = function() dapui.open() end
      dap.listeners.before.event_terminated["dapui"] = function() dapui.close() end
      dap.listeners.before.event_exited["dapui"] = function() dapui.close() end
    end,
  },
}
```

## TypeScript / Node Debugging

```lua
-- Install: :MasonInstall js-debug-adapter
local dap = require("dap")

dap.adapters["pwa-node"] = {
  type = "server",
  host = "localhost",
  port = "${port}",
  executable = {
    command = "node",
    args = {
      vim.fn.stdpath("data") .. "/mason/packages/js-debug-adapter/js-debug/src/dapDebugServer.js",
      "${port}",
    },
  },
}

dap.configurations.typescript = {
  {
    type = "pwa-node",
    request = "launch",
    name = "Launch file (bun)",
    runtimeExecutable = "bun",
    program = "${file}",
    cwd = "${workspaceFolder}",
  },
  {
    type = "pwa-node",
    request = "launch",
    name = "Launch file (node)",
    program = "${file}",
    cwd = "${workspaceFolder}",
  },
  {
    type = "pwa-node",
    request = "attach",
    name = "Attach to process",
    processId = require("dap.utils").pick_process,
    cwd = "${workspaceFolder}",
  },
}

-- Reuse for JavaScript
dap.configurations.javascript = dap.configurations.typescript
```

## Rust Debugging

```lua
-- Install: :MasonInstall codelldb
local dap = require("dap")

dap.adapters.codelldb = {
  type = "server",
  port = "${port}",
  executable = {
    command = vim.fn.stdpath("data") .. "/mason/packages/codelldb/extension/adapter/codelldb",
    args = { "--port", "${port}" },
  },
}

dap.configurations.rust = {
  {
    name = "Launch",
    type = "codelldb",
    request = "launch",
    program = function()
      return vim.fn.input("Path to executable: ", vim.fn.getcwd() .. "/target/debug/", "file")
    end,
    cwd = "${workspaceFolder}",
    stopOnEntry = false,
  },
  {
    name = "Launch (release)",
    type = "codelldb",
    request = "launch",
    program = function()
      return vim.fn.input("Path to executable: ", vim.fn.getcwd() .. "/target/release/", "file")
    end,
    cwd = "${workspaceFolder}",
    stopOnEntry = false,
  },
}
```

## Go Debugging

```lua
-- Install: :MasonInstall delve
local dap = require("dap")

dap.adapters.delve = {
  type = "server",
  port = "${port}",
  executable = {
    command = "dlv",
    args = { "dap", "-l", "127.0.0.1:${port}" },
  },
}

dap.configurations.go = {
  {
    type = "delve",
    name = "Launch file",
    request = "launch",
    program = "${file}",
  },
  {
    type = "delve",
    name = "Launch package",
    request = "launch",
    program = "${workspaceFolder}",
  },
  {
    type = "delve",
    name = "Debug test",
    request = "launch",
    mode = "test",
    program = "${file}",
  },
}
```

## Python Debugging

```lua
-- Install: :MasonInstall debugpy
local dap = require("dap")

dap.adapters.python = {
  type = "executable",
  command = vim.fn.stdpath("data") .. "/mason/packages/debugpy/venv/bin/python",
  args = { "-m", "debugpy.adapter" },
}

dap.configurations.python = {
  {
    type = "python",
    request = "launch",
    name = "Launch file",
    program = "${file}",
    pythonPath = function()
      local venv = os.getenv("VIRTUAL_ENV")
      if venv then return venv .. "/bin/python" end
      return "python3"
    end,
  },
}
```

## DAP UI Layout

Default dap-ui layout configuration:

```lua
require("dapui").setup({
  layouts = {
    {
      elements = {
        { id = "scopes", size = 0.4 },
        { id = "breakpoints", size = 0.2 },
        { id = "stacks", size = 0.2 },
        { id = "watches", size = 0.2 },
      },
      position = "left",
      size = 40,
    },
    {
      elements = {
        { id = "repl", size = 0.5 },
        { id = "console", size = 0.5 },
      },
      position = "bottom",
      size = 10,
    },
  },
})
```

## Troubleshooting DAP

- **Adapter not found**: check `:Mason` for install status
- **Breakpoints not hitting**: verify the source maps match (TypeScript), or the binary was compiled with debug info (Rust: use debug profile)
- **Variables not showing**: check that dap-ui is open (`<leader>du`) and the scopes panel is visible
- **Process exits immediately**: check the launch configuration `program` path
