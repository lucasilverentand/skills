---
name: pytest-testing
description: Sets up pytest for Python testing. Use when configuring pytest, writing tests, or setting up test fixtures.
argument-hint: [test-file]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Pytest Testing

Sets up pytest for Python testing.

## Your Task

1. **Install pytest**: Add testing dependencies
2. **Configure**: Set up pytest.ini or pyproject.toml
3. **Write tests**: Create test files
4. **Add fixtures**: Set up shared test data
5. **Run tests**: Execute and verify

## Quick Start

```bash
poetry add --group dev pytest pytest-asyncio pytest-cov
```

## Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "-v --tb=short"
markers = [
    "slow: marks tests as slow",
    "integration: marks integration tests",
]
```

## Test Examples

```python
# tests/test_users.py
import pytest
from myapp.services import UserService

class TestUserService:
    def test_create_user(self, user_service):
        user = user_service.create_user(
            email="test@example.com",
            name="Test User"
        )
        assert user.email == "test@example.com"
        assert user.name == "Test User"

    def test_create_user_duplicate_email(self, user_service):
        user_service.create_user(email="test@example.com", name="First")
        with pytest.raises(ValueError, match="Email already exists"):
            user_service.create_user(email="test@example.com", name="Second")

    @pytest.mark.parametrize("email,valid", [
        ("user@example.com", True),
        ("invalid-email", False),
        ("", False),
    ])
    def test_email_validation(self, email, valid):
        if valid:
            assert validate_email(email)
        else:
            with pytest.raises(ValueError):
                validate_email(email)
```

## Fixtures

```python
# tests/conftest.py
import pytest
from myapp.database import Database
from myapp.services import UserService

@pytest.fixture
def db():
    database = Database(":memory:")
    database.create_tables()
    yield database
    database.close()

@pytest.fixture
def user_service(db):
    return UserService(db)

@pytest.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
```

## Async Tests

```python
import pytest

@pytest.mark.asyncio
async def test_async_endpoint(async_client):
    response = await async_client.get("/users")
    assert response.status_code == 200
```

## Tips

- Use fixtures for setup/teardown
- Use parametrize for multiple test cases
- Use marks to categorize tests
- Run with `-x` to stop on first failure
