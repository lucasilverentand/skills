---
name: poetry-setup
description: Sets up Python projects with Poetry. Use when initializing Python projects, managing dependencies, or configuring virtual environments.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Poetry Setup

Sets up Python projects with Poetry for dependency management.

## Your Task

1. **Initialize project**: Create pyproject.toml
2. **Add dependencies**: Install required packages
3. **Configure tools**: Set up linting, testing
4. **Set up scripts**: Add common commands
5. **Document**: Update README

## Quick Start

```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Create new project
poetry new my-project

# Or init in existing directory
poetry init
```

## pyproject.toml

```toml
[tool.poetry]
name = "my-project"
version = "0.1.0"
description = "Project description"
authors = ["Your Name <you@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.109.0"
uvicorn = {extras = ["standard"], version = "^0.27.0"}
pydantic = "^2.5.0"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0.0"
pytest-asyncio = "^0.23.0"
ruff = "^0.2.0"
mypy = "^1.8.0"

[tool.poetry.scripts]
start = "my_project.main:main"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]

[tool.mypy]
python_version = "3.11"
strict = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

## Common Commands

```bash
# Install dependencies
poetry install

# Add dependency
poetry add fastapi
poetry add --group dev pytest

# Update dependencies
poetry update

# Run command in venv
poetry run python main.py
poetry run pytest

# Activate shell
poetry shell

# Export requirements.txt
poetry export -f requirements.txt > requirements.txt

# Build package
poetry build

# Publish to PyPI
poetry publish
```

## Tips

- Use dependency groups for dev/test deps
- Lock file ensures reproducible builds
- Use `poetry run` or `poetry shell`
- Configure tools in pyproject.toml
