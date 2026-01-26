# Skills

A collection of reusable Claude Code skills for development workflows. Install bundled plugins for complete workflows or individual skills as needed.

## Installation

### Claude Code

Add this marketplace in Claude Code:

```
lucasilverentand/skills
```

Then install either:
- **Bundled plugins** (recommended) - Complete themed workflows
- **Individual skills** - Pick only what you need

## Bundled Plugins

### 🛠️ devenv
**Complete devenv toolkit**

Includes: `devenv-search`, `devenv-init`, `devenv-config`

Perfect for:
- Setting up reproducible development environments
- Full-stack application development
- CI/CD workflow optimization
- Local-to-production parity

Features:
- Package discovery with MCP integration
- Production-ready project templates (Python, Node.js, Rust, Go, Full-stack)
- Process orchestration (Frontend + Backend + Database)
- CI/CD optimization (same scripts locally and in CI)
- Comprehensive validation and error correction

[Learn more →](./plugins/devenv/README.md)

### 🔍 code-quality
**Code quality analysis tools**

Includes: `code-review`

Perfect for:
- Pull request reviews
- Security audits
- Performance analysis
- Code maintainability

Features:
- Multi-level severity analysis (Critical/High/Medium/Low)
- Security vulnerability detection
- Performance issue identification
- Best practices enforcement

[Learn more →](./plugins/code-quality/README.md)

## Individual Skills

Install specific skills without bundles:

| Skill              | Description                                                  | Category |
|--------------------|--------------------------------------------------------------|----------|
| `devenv-search`    | Search for devenv packages and configuration options         | devtools |
| `devenv-init`      | Initialize devenv with templates for various stacks          | devtools |
| `devenv-config`    | Configure devenv with full-stack and CI/CD support           | devtools |
| `code-review`      | Review code for bugs, security, performance, best practices  | quality  |
| `example`          | Template showing SKILL.md format                             | template |

## Quick Start

### Using Bundled Plugins

```bash
# Install devenv bundle
"Install devenv plugin"

# Then use any included skill
"Find Python packages for devenv"      # Uses devenv-search
"Set up devenv for my project"         # Uses devenv-init
"Add PostgreSQL to devenv"             # Uses devenv-config
```

### Using Individual Skills

```bash
# Install specific skill
"Install devenv-search skill"

# Use it
/devenv-search python
```

## Example Workflows

### Full-Stack Development (devenv)

1. **Initialize**: Start with full-stack template
   ```
   /devenv-init
   ```

2. **Configure**: Add services and processes
   ```
   "Add PostgreSQL and Redis to my devenv setup"
   ```

3. **Develop**: Run entire stack locally
   ```bash
   devenv up  # Starts frontend, backend, database
   ```

4. **Deploy**: Same environment everywhere

### Code Review (code-quality)

```bash
# Review PR
"Review this PR for security issues"

# Audit specific files
/code-review src/auth/

# Pre-commit check
"Review my staged changes"
```

## Repository Structure

```
.
├── plugins/              # Bundled plugin collections
│   ├── devenv/          # Complete devenv toolkit
│   └── code-quality/    # Code analysis tools
├── skills/              # Individual skills
│   ├── devenv-search/
│   ├── devenv-init/
│   ├── devenv-config/
│   ├── code-review/
│   └── example/
└── scripts/             # Validation and tooling
```

## Creating New Skills

1. Create a directory under `skills/` with your skill name
2. Add a `SKILL.md` file with YAML frontmatter and instructions
3. See `skills/example/SKILL.md` for the full format reference

### Creating Plugin Bundles

1. Create a directory under `plugins/` with your bundle name
2. Add a `plugin.json` with metadata and skill references
3. Add a `README.md` documenting the bundle
4. Update `.claude-plugin/marketplace.json` to include the bundle

Example plugin.json:
```json
{
  "name": "my-bundle",
  "description": "Description of the bundle",
  "skills": [
    "../../skills/skill-1",
    "../../skills/skill-2"
  ]
}
```

## Development

```bash
# Setup
direnv allow                             # Auto-activates devenv + pre-commit hooks

# Validation
./scripts/validate-skills.sh             # Validate skills
./scripts/validate-claude-metadata.sh    # Validate Claude metadata

# Testing
claude plugin validate .                 # Validate with Claude CLI
```

## MCP Integration

The devenv plugin includes the `mcp.devenv.sh` MCP server for dynamic package lookups:
- Real-time package search
- Configuration option discovery
- Always up-to-date package information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your skill or bundle
4. Run validation: `./scripts/validate-skills.sh`
5. Submit a pull request

## Support

- Issues: [GitHub Issues](https://github.com/lucasilverentand/skills/issues)
- Discussions: [GitHub Discussions](https://github.com/lucasilverentand/skills/discussions)

## License

MIT License - see [LICENSE](LICENSE) file for details
