# Code Quality Skills

Skills for analyzing and improving code quality.

## Skills

| Skill | Description |
|-------|-------------|
| [review](./review/) | Review code for bugs, security issues, performance problems, and best practices |

## Usage

```
/code-review src/auth/         # Review authentication code
/code-review app.ts            # Review a specific file
```

## Review Categories

- **Correctness** - Logic errors, edge cases, type mismatches
- **Security** - Input validation, injection attacks, data exposure
- **Performance** - N+1 queries, memory leaks, unnecessary computation
- **Maintainability** - Code clarity, DRY violations, error handling

## Output Format

Issues are reported with:

- Location (`file:line`)
- Severity (Critical / High / Medium / Low)
- Issue description
- Suggested fix
