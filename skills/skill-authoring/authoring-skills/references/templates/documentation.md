---
name: {name}
description: {description}. Use when {triggers}.
argument-hint: {hint}
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
---

# {Title}

Generates {doc type} documentation.

## Your Task

1. Identify documentation target
2. Extract relevant information from code
3. Generate documentation following template
4. Write to appropriate location
5. Validate completeness

## Documentation Template

```markdown
# {Title}

{Brief description}

## Overview

{What it does, why it exists}

## Usage

{How to use it}

## API/Interface

{Public interface details}

## Examples

{Usage examples}
```

## Style Guidelines

- Clear, concise language
- Code examples where helpful
- Link to related docs
- Keep up-to-date with code

## Example

```
User: {example request}
Action: Generated {doc type} for {target}
Output: Created {path}
```

## Error Handling

| Error | Response |
|-------|----------|
| Can't parse code | Ask for clarification |
| Missing context | Request additional info |
| Doc exists | Ask: update, replace, or abort |
