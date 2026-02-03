---
name: fastapi-init
description: Creates FastAPI projects with best practices. Use when setting up FastAPI applications, configuring routers, or implementing API patterns.
argument-hint:
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# FastAPI Init

Creates FastAPI projects with modern Python patterns.

## Your Task

1. **Set up project**: Create project structure
2. **Configure app**: Set up FastAPI application
3. **Add routes**: Create API endpoints
4. **Add validation**: Use Pydantic models
5. **Test**: Verify API works

## Project Structure

```
src/
├── main.py
├── config.py
├── routers/
│   ├── __init__.py
│   └── users.py
├── models/
│   ├── __init__.py
│   └── user.py
├── schemas/
│   ├── __init__.py
│   └── user.py
└── services/
    └── user.py
```

## Main Application

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .routers import users
from .config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown

app = FastAPI(
    title="My API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/health")
async def health():
    return {"status": "ok"}
```

## Router Example

```python
# routers/users.py
from fastapi import APIRouter, HTTPException, Depends
from ..schemas.user import UserCreate, UserResponse
from ..services.user import UserService

router = APIRouter()

@router.get("/", response_model=list[UserResponse])
async def list_users(
    limit: int = 20,
    offset: int = 0,
    service: UserService = Depends(),
):
    return await service.list_users(limit=limit, offset=offset)

@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(),
):
    return await service.create_user(data)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, service: UserService = Depends()):
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Pydantic Schema

```python
# schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    name: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True
```

## Tips

- Use dependency injection for services
- Use Pydantic for validation
- Use async for I/O operations
- Add OpenAPI documentation
