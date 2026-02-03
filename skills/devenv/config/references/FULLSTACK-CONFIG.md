# Full-Stack Configuration Reference

Complete guide for configuring full-stack applications with devenv.

## Table of Contents

- [Overview](#overview)
- [Complete Full-Stack Example](#complete-full-stack-example)
- [Services Configuration](#services-configuration)
- [Processes Configuration](#processes-configuration)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)

## Overview

Full-stack applications typically need:

- **Languages**: Multiple languages (frontend + backend)
- **Services**: Databases and caches (postgres, redis)
- **Processes**: Running frontend, backend, workers together
- **Environment variables**: Connecting services

## Complete Full-Stack Example

```nix
{ pkgs, ... }:

{
  # Multiple languages
  languages = {
    javascript = {
      enable = true;
      npm.enable = true;  # Or bun.enable = true for Bun
    };
    python = {
      enable = true;
      version = "3.11";
      venv.enable = true;
    };
  };

  # Services for local development
  services = {
    postgres = {
      enable = true;
      initialDatabases = [{ name = "myapp_dev"; }];
      listen_addresses = "127.0.0.1";
    };

    redis = {
      enable = true;
      bind = "127.0.0.1";
    };
  };

  # Environment variables for different services
  env = {
    # Database
    DATABASE_URL = "postgresql://localhost:5432/myapp_dev";
    REDIS_URL = "redis://localhost:6379";

    # API configuration
    API_HOST = "0.0.0.0";
    API_PORT = "8000";
    API_URL = "http://localhost:8000";

    # Frontend configuration
    VITE_API_URL = "http://localhost:8000";  # For Vite
    NEXT_PUBLIC_API_URL = "http://localhost:8000";  # For Next.js
    FRONTEND_PORT = "5173";
  };

  # Run entire stack together
  processes = {
    # Backend API server
    backend = {
      exec = "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000";
      process-compose = {
        depends_on = {
          postgres.condition = "process_healthy";
          redis.condition = "process_healthy";
        };
        readiness_probe = {
          http_get = {
            host = "localhost";
            port = 8000;
            path = "/health";
          };
          initial_delay_seconds = 2;
          period_seconds = 10;
        };
      };
    };

    # Frontend dev server
    frontend = {
      exec = "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173";
      process-compose = {
        depends_on = {
          backend.condition = "process_healthy";
        };
        readiness_probe = {
          http_get = {
            host = "localhost";
            port = 5173;
          };
          initial_delay_seconds = 3;
          period_seconds = 10;
        };
      };
    };

    # Worker processes (optional)
    worker = {
      exec = "cd backend && celery -A tasks worker --loglevel=info";
      process-compose = {
        depends_on = {
          redis.condition = "process_healthy";
        };
      };
    };
  };

  # Scripts for full-stack operations
  scripts = {
    # Start entire stack
    dev.exec = "devenv up";

    # Individual services
    backend-only.exec = "cd backend && uvicorn main:app --reload";
    frontend-only.exec = "cd frontend && npm run dev";

    # Database operations
    db-reset.exec = ''
      dropdb myapp_dev --if-exists
      createdb myapp_dev
      cd backend && alembic upgrade head
    '';
    db-migrate.exec = "cd backend && alembic upgrade head";
    db-seed.exec = "cd backend && python scripts/seed.py";

    # Testing full stack
    test-all.exec = ''
      cd backend && pytest
      cd frontend && npm test
    '';
    test-e2e.exec = "cd e2e && playwright test";

    # Build for production
    build-all.exec = ''
      cd frontend && npm run build
      cd backend && python -m build
    '';
  };
}
```

## Services Configuration

### PostgreSQL

```nix
services.postgres = {
  enable = true;
  initialDatabases = [{ name = "myapp_dev"; }];
  listen_addresses = "127.0.0.1";
  port = 5432;  # default
};
```

### Redis

```nix
services.redis = {
  enable = true;
  bind = "127.0.0.1";
  port = 6379;  # default
};
```

### MySQL

```nix
services.mysql = {
  enable = true;
  initialDatabases = [{ name = "myapp"; }];
};
```

## Processes Configuration

### Process Dependencies

Use `depends_on` to ensure correct startup order:

```nix
processes.backend = {
  exec = "uvicorn main:app";
  process-compose = {
    depends_on = {
      postgres.condition = "process_healthy";  # Wait for healthy
      redis.condition = "process_started";      # Just wait for start
    };
  };
};
```

### Health Probes

HTTP health check:

```nix
readiness_probe = {
  http_get = {
    host = "localhost";
    port = 8000;
    path = "/health";
  };
  initial_delay_seconds = 2;
  period_seconds = 10;
};
```

Command health check:

```nix
readiness_probe = {
  exec.command = "pg_isready";
  initial_delay_seconds = 2;
  period_seconds = 10;
};
```

## Environment Variables

### Common Patterns

```nix
env = {
  # Database URLs
  DATABASE_URL = "postgresql://localhost:5432/myapp_dev";
  REDIS_URL = "redis://localhost:6379";

  # API endpoints
  API_URL = "http://localhost:8000";

  # Frontend framework-specific
  VITE_API_URL = "http://localhost:8000";          # Vite
  NEXT_PUBLIC_API_URL = "http://localhost:8000";   # Next.js
  REACT_APP_API_URL = "http://localhost:8000";     # Create React App
};
```

## Scripts

### Database Operations

```nix
scripts = {
  db-reset.exec = ''
    dropdb myapp_dev --if-exists
    createdb myapp_dev
    psql myapp_dev < schema.sql
  '';

  db-migrate.exec = "alembic upgrade head";
  db-seed.exec = "python scripts/seed.py";
};
```

### Testing

```nix
scripts = {
  test-all.exec = ''
    cd backend && pytest
    cd frontend && npm test
  '';

  test-e2e.exec = "playwright test";
};
```

## Troubleshooting

### Port Conflicts

Common ports to check:

- Frontend: 3000 (Next.js), 5173 (Vite), 8080 (Vue)
- Backend: 8000 (FastAPI), 3000 (Express), 4000 (Apollo)
- Database: 5432 (Postgres), 3306 (MySQL), 6379 (Redis)

```bash
# Check for port conflicts
lsof -i :5432  # Postgres
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
```

### Process Failures

```bash
# Check process logs
cat $DEVENV_STATE/process-compose/process-compose.log

# Test processes individually
cd backend && uvicorn main:app  # Backend alone
cd frontend && npm run dev       # Frontend alone
```

### Database Connection Issues

```bash
# Test connection
pg_isready
psql $DATABASE_URL -c "SELECT 1"

# Check service status
devenv info | grep -A 20 "Services:"
```

### CORS Issues

Ensure API_URL matches in both backend CORS config and frontend environment:

```nix
env = {
  API_URL = "http://localhost:8000";
  VITE_API_URL = "http://localhost:8000";  # Must match
};
```

Configure backend to allow frontend origin.
