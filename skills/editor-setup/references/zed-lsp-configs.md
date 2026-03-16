# LSP Configuration Reference

Per-language LSP setup for Zed. Place in project `.zed/settings.json` or global `~/.config/zed/settings.json`.

## TypeScript

```json
{
  "languages": {
    "TypeScript": {
      "language_servers": ["typescript-language-server", "biome"],
      "formatter": {
        "external": {
          "command": "bunx",
          "arguments": ["biome", "format", "--write", "--stdin-file-path", "{buffer_path}"]
        }
      }
    },
    "TSX": {
      "language_servers": ["typescript-language-server", "biome"],
      "formatter": {
        "external": {
          "command": "bunx",
          "arguments": ["biome", "format", "--write", "--stdin-file-path", "{buffer_path}"]
        }
      }
    }
  },
  "lsp": {
    "typescript-language-server": {
      "initialization_options": {
        "preferences": {
          "includeInlayParameterNameHints": "all",
          "includeInlayVariableTypeHints": true,
          "includeInlayFunctionLikeReturnTypeHints": true,
          "importModuleSpecifierPreference": "non-relative"
        }
      }
    },
    "biome": {
      "settings": {
        "require_config_file": true
      }
    }
  }
}
```

## Rust

```json
{
  "languages": {
    "Rust": {
      "language_servers": ["rust-analyzer"],
      "formatter": "language_server",
      "tab_size": 4
    }
  },
  "lsp": {
    "rust-analyzer": {
      "initialization_options": {
        "check": { "command": "clippy" },
        "cargo": { "features": "all" },
        "procMacro": { "enable": true },
        "diagnostics": { "experimental": { "enable": true } },
        "inlayHints": {
          "typeHints": { "enable": true },
          "parameterHints": { "enable": true },
          "chainingHints": { "enable": true },
          "closureReturnTypeHints": { "enable": "always" }
        }
      }
    }
  }
}
```

## Python

```json
{
  "languages": {
    "Python": {
      "language_servers": ["basedpyright", "ruff"],
      "formatter": {
        "external": {
          "command": "ruff",
          "arguments": ["format", "--stdin-filename", "{buffer_path}", "-"]
        }
      },
      "tab_size": 4
    }
  },
  "lsp": {
    "basedpyright": {
      "initialization_options": {
        "basedpyright": {
          "analysis": {
            "typeCheckingMode": "standard",
            "autoImportCompletions": true,
            "inlayHints": {
              "variableTypes": true,
              "functionReturnTypes": true,
              "callArgumentNames": true
            }
          }
        }
      }
    },
    "ruff": {
      "initialization_options": {
        "settings": {
          "lineLength": 88,
          "lint": {
            "preview": true
          }
        }
      }
    }
  }
}
```

## Go

```json
{
  "languages": {
    "Go": {
      "language_servers": ["gopls"],
      "formatter": "language_server",
      "tab_size": 4,
      "hard_tabs": true
    }
  },
  "lsp": {
    "gopls": {
      "initialization_options": {
        "hints": {
          "assignVariableTypes": true,
          "compositeLiteralFields": true,
          "constantValues": true,
          "functionTypeParameters": true,
          "parameterNames": true,
          "rangeVariableTypes": true
        },
        "analyses": {
          "unusedparams": true,
          "shadow": true,
          "nilness": true,
          "unusedwrite": true
        },
        "staticcheck": true,
        "gofumpt": true
      }
    }
  }
}
```

## Swift

SourceKit-LSP is bundled with Xcode. No additional LSP config needed — Zed picks it up automatically.

```json
{
  "languages": {
    "Swift": {
      "language_servers": ["sourcekit-lsp"],
      "formatter": "language_server",
      "tab_size": 4
    }
  }
}
```

For SPM projects, ensure `Package.swift` is at the workspace root. For Xcode projects, open the directory containing the `.xcodeproj`.

## Lua (Neovim config)

```json
{
  "languages": {
    "Lua": {
      "language_servers": ["lua-language-server"],
      "tab_size": 2
    }
  },
  "lsp": {
    "lua-language-server": {
      "initialization_options": {
        "runtime": { "version": "LuaJIT" },
        "diagnostics": { "globals": ["vim"] },
        "workspace": {
          "library": [],
          "checkThirdParty": false
        },
        "telemetry": { "enable": false }
      }
    }
  }
}
```

## Tailwind CSS

Install the `tailwindcss` extension. It provides completions and hover for Tailwind classes.

```json
{
  "lsp": {
    "tailwindcss-language-server": {
      "settings": {
        "classAttributes": ["class", "className", "ngClass", "classList"],
        "includeLanguages": {
          "typescriptreact": "html",
          "javascript": "html"
        }
      }
    }
  }
}
```

## JSON / TOML / YAML

These use built-in language servers. For JSON schema validation:

```json
{
  "languages": {
    "JSON": {
      "formatter": {
        "external": {
          "command": "bunx",
          "arguments": ["biome", "format", "--write", "--stdin-file-path", "{buffer_path}"]
        }
      }
    },
    "TOML": {
      "language_servers": ["taplo"]
    }
  }
}
```

## Combining Multiple Languages

A full-stack project `.zed/settings.json` combining TypeScript + Tailwind:

```json
{
  "tab_size": 2,
  "formatter": "language_server",
  "format_on_save": "on",
  "languages": {
    "TypeScript": {
      "language_servers": ["typescript-language-server", "biome"],
      "formatter": {
        "external": {
          "command": "bunx",
          "arguments": ["biome", "format", "--write", "--stdin-file-path", "{buffer_path}"]
        }
      }
    },
    "TSX": {
      "language_servers": ["typescript-language-server", "biome"],
      "formatter": {
        "external": {
          "command": "bunx",
          "arguments": ["biome", "format", "--write", "--stdin-file-path", "{buffer_path}"]
        }
      }
    },
    "JSON": {
      "formatter": {
        "external": {
          "command": "bunx",
          "arguments": ["biome", "format", "--write", "--stdin-file-path", "{buffer_path}"]
        }
      }
    },
    "CSS": {
      "language_servers": ["tailwindcss-language-server", "!vscode-css-language-server"]
    }
  },
  "lsp": {
    "typescript-language-server": {
      "initialization_options": {
        "preferences": {
          "includeInlayParameterNameHints": "all",
          "importModuleSpecifierPreference": "non-relative"
        }
      }
    },
    "biome": {
      "settings": { "require_config_file": true }
    }
  }
}
```

## Disabling a Built-in Language Server

Prefix with `!` to exclude a server:

```json
{
  "languages": {
    "CSS": {
      "language_servers": ["tailwindcss-language-server", "!vscode-css-language-server"]
    }
  }
}
```
