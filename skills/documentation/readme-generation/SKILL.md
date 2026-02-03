---
name: readme-generation
description: Generates comprehensive README files for projects. Use when creating project documentation, onboarding guides, or improving existing READMEs.
argument-hint:
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# README Generation

Creates comprehensive README files for projects.

## Your Task

1. **Analyze project**: Understand the codebase
2. **Identify sections**: Determine what to document
3. **Write content**: Create clear, helpful documentation
4. **Add examples**: Include usage examples
5. **Review**: Ensure completeness

## README Template

```markdown
# Project Name

Brief description of what the project does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Quick Start

\`\`\`typescript
import { something } from 'package-name';

// Basic usage example
const result = something();
\`\`\`

## Usage

### Basic Usage

Detailed explanation with code examples.

### Configuration

Available configuration options.

## API Reference

### `functionName(param)`

- `param` (type): Description
- Returns: Description

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT
```

## Section Checklist

| Section | Purpose | Required? |
|---------|---------|-----------|
| Title + Description | What is this? | Yes |
| Installation | How to install | Yes |
| Quick Start | Get running fast | Yes |
| Usage | Detailed examples | Yes |
| API Reference | Function docs | For libraries |
| Configuration | Options/env vars | If applicable |
| Contributing | How to contribute | For open source |
| License | Legal terms | Yes |

## Tips

- Lead with the value proposition
- Include working code examples
- Keep installation steps minimal
- Add badges for build status, coverage
- Update README when features change
