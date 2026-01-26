# Skills

A collection of reusable AI coding assistant skills.

## Installation

### Claude Code

Add this repository as a marketplace, then install the plugin:

```bash
/plugin marketplace add lucasilverentand/skills
/plugin install luca-skills@luca-skills
```

Or test locally:

```bash
claude --plugin-dir /path/to/skills
```

### Other Tools (Cursor, Copilot, Windsurf)

Reference the `skills/` directory in your project's AI instructions, or copy relevant SKILL.md content into your tool's configuration format.

## Available Skills

| Skill | Description |
|-------|-------------|
| `code-review` | Review code for bugs, security, performance, and best practices |
| `example` | Template showing SKILL.md format |

## Creating New Skills

1. Create a directory under `skills/` with your skill name
2. Add a `SKILL.md` file with YAML frontmatter and instructions
3. See `skills/example/SKILL.md` for the full format reference

## Development

```bash
direnv allow                    # Auto-activates devenv + pre-commit hooks
./scripts/validate-skills.sh    # Run validation manually
```

## License

MIT
