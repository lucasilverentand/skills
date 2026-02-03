# Devenv Configuration Templates

Ready-to-use templates for common project types.

## Table of Contents

- [Python Project](#python-project)
- [Node.js Project](#nodejs-project)
- [Rust Project](#rust-project)
- [Go Project](#go-project)
- [Multi-Language Project](#multi-language-project)
- [Full-Stack Project](#full-stack-project)
- [CI/CD Optimized Project](#cicd-optimized-project)

## Python Project

```nix
{ pkgs, ... }:

{
  languages.python = {
    enable = true;
    version = "3.11";
    venv.enable = true;
  };

  packages = with pkgs; [
    # Add additional tools here
  ];

  scripts = {
    test.exec = "pytest";
    lint.exec = "ruff check .";
    format.exec = "black .";
  };

  git-hooks.hooks = {
    black.enable = true;
    ruff.enable = true;
  };
}
```

## Node.js Project

```nix
{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    npm.enable = true;
  };

  scripts = {
    dev.exec = "npm run dev";
    test.exec = "npm test";
    build.exec = "npm run build";
  };

  git-hooks.hooks = {
    prettier.enable = true;
    eslint.enable = true;
  };
}
```

### With Bun Instead

```nix
{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    bun.enable = true;
  };

  scripts = {
    dev.exec = "bun run dev";
    test.exec = "bun test";
  };
}
```

## Rust Project

```nix
{ pkgs, ... }:

{
  languages.rust = {
    enable = true;
    channel = "stable";  # or "nightly", "beta"
  };

  packages = with pkgs; [
    cargo-watch
    cargo-audit
  ];

  scripts = {
    dev.exec = "cargo watch -x run";
    test.exec = "cargo test";
    lint.exec = "cargo clippy";
  };

  git-hooks.hooks = {
    rustfmt.enable = true;
    clippy.enable = true;
  };
}
```

## Go Project

```nix
{ pkgs, ... }:

{
  languages.go = {
    enable = true;
  };

  packages = with pkgs; [
    golangci-lint
    air  # Hot reload
  ];

  scripts = {
    dev.exec = "air";
    test.exec = "go test ./...";
    lint.exec = "golangci-lint run";
  };

  git-hooks.hooks = {
    gofmt.enable = true;
    govet.enable = true;
  };
}
```

## Multi-Language Project

```nix
{ pkgs, ... }:

{
  languages = {
    javascript = {
      enable = true;
      npm.enable = true;
    };
    python = {
      enable = true;
      version = "3.11";
    };
  };

  packages = with pkgs; [
    gh
    jq
  ];

  scripts = {
    dev.exec = "npm run dev";
  };

  git-hooks.hooks = {
    prettier.enable = true;
    black.enable = true;
  };
}
```

## Full-Stack Project

Frontend + Backend + Database:

```nix
{ pkgs, ... }:

{
  languages = {
    javascript = {
      enable = true;
      npm.enable = true;
    };
    python = {
      enable = true;
      version = "3.11";
      venv.enable = true;
    };
  };

  packages = with pkgs; [
    gh
    jq
    curl
    postgresql  # psql client
  ];

  env = {
    DATABASE_URL = "postgresql://localhost:5432/myapp_dev";
    API_URL = "http://localhost:8000";
    FRONTEND_URL = "http://localhost:5173";
  };

  services.postgres = {
    enable = true;
    initialDatabases = [{ name = "myapp_dev"; }];
    listen_addresses = "127.0.0.1";
  };

  processes = {
    backend = {
      exec = "cd backend && uvicorn main:app --reload --port 8000";
      process-compose = {
        depends_on = {
          postgres.condition = "process_healthy";
        };
      };
    };
    frontend = {
      exec = "cd frontend && npm run dev";
      process-compose = {
        depends_on = {
          backend.condition = "process_healthy";
        };
      };
    };
  };

  scripts = {
    dev.exec = "devenv up";
    backend.exec = "cd backend && uvicorn main:app --reload";
    frontend.exec = "cd frontend && npm run dev";
    db-reset.exec = ''
      dropdb myapp_dev --if-exists
      createdb myapp_dev
      psql myapp_dev < schema.sql
    '';
    test.exec = ''
      cd backend && pytest
      cd frontend && npm test
    '';
  };

  git-hooks.hooks = {
    pre-commit.enable = true;
    prettier.enable = true;
    eslint.enable = true;
    black.enable = true;
  };
}
```

## CI/CD Optimized Project

```nix
{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    npm.enable = true;
  };

  packages = with pkgs; [
    gh
    act             # Test GitHub Actions locally
    docker
    docker-compose
    nodePackages.eslint
    nodePackages.prettier
  ];

  env = {
    CI = "false";
    NODE_ENV = "development";
  };

  scripts = {
    install.exec = "npm ci";
    lint.exec = "npm run lint";
    format.exec = "npm run format";
    format-check.exec = "npm run format -- --check";
    test.exec = "npm test";
    test-ci.exec = "npm test -- --coverage --maxWorkers=2 --ci";
    build.exec = "npm run build";
    docker-build.exec = "docker build -t myapp:latest .";
    ci-local.exec = "act push";
    ci-full.exec = ''
      echo "Running full CI pipeline locally..."
      npm ci
      npm run lint
      npm test -- --ci
      npm run build
      echo "CI pipeline completed!"
    '';
  };

  git-hooks.hooks = {
    pre-commit.enable = true;
    prettier = {
      enable = true;
      types_or = [ "javascript" "typescript" "json" "yaml" "markdown" ];
    };
    eslint.enable = true;
    shellcheck.enable = true;
    gitleaks.enable = true;
    end-of-file-fixer.enable = true;
    trim-trailing-whitespace.enable = true;
  };
}
```

## Full-Stack with Docker

For CI/CD consistency with containers:

```nix
{ pkgs, ... }:

{
  languages = {
    javascript = {
      enable = true;
      npm.enable = true;
    };
    python = {
      enable = true;
      version = "3.11";
    };
  };

  packages = with pkgs; [
    docker
    docker-compose
    gh
    act
    playwright-driver
  ];

  env = {
    NODE_ENV = "development";
    DATABASE_URL = "postgresql://localhost:5432/myapp_dev";
  };

  # Use docker-compose for services (CI/CD parity)
  processes = {
    docker-services = {
      exec = "docker-compose up";
    };
    backend = {
      exec = "cd backend && npm run dev";
      process-compose = {
        depends_on = {
          docker-services.condition = "process_started";
        };
      };
    };
    frontend = {
      exec = "cd frontend && npm run dev";
    };
  };

  scripts = {
    dev.exec = "devenv up";
    test.exec = ''
      npm run test:backend
      npm run test:frontend
      npm run test:e2e
    '';
    build.exec = "docker build -t myapp:latest .";
    ci-local.exec = "act push";
    clean.exec = ''
      docker-compose down -v
      rm -rf node_modules
    '';
  };

  git-hooks.hooks = {
    pre-commit.enable = true;
    prettier.enable = true;
    eslint.enable = true;
    shellcheck.enable = true;
  };
}
```
