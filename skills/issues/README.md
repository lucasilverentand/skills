# Issues Skills

Skills for managing issues across platforms (GitHub, GitLab, Jira, and more).

## Skills

| Skill | Description |
|-------|-------------|
| [create](./create/) | Create well-structured bug reports, feature requests, and tasks |
| [analyze](./analyze/) | Analyze issues against codebase to validate claims and find gaps |
| [cleanup](./cleanup/) | Format issues to match templates, apply labels, and manage project fields |

## Usage

```
/create-issue bug              # Create a bug report with proper context
/analyze-issue 123             # Analyze issue #123 against the codebase
/cleanup-issue 456             # Format and label issue #456
```

## Supported Platforms

- **GitHub** - Full support via `gh` CLI
- **GitLab** - Full support via `glab` CLI
- **Jira/Linear/Azure DevOps** - Formatted markdown output for manual entry

## Features

- Platform detection from `.git/config`
- Issue templates (bug, feature, task)
- Automatic label suggestions
- GitHub Projects integration
- Codebase validation for referenced files and line numbers
