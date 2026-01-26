# Plugin Validation

This repository includes comprehensive validation for Claude Code plugins and marketplace configuration.

## Validation Tools

### Automatic Validation (Git Hook)

Validation runs automatically on every commit via pre-commit hook configured in `devenv.nix`:

```nix
git-hooks.hooks = {
  validate-skills = {
    enable = true;
    entry = "./scripts/validate-skills.sh";
  };
};
```

### Manual Validation

Run validation manually at any time:

```bash
# Comprehensive validation (recommended)
./scripts/validate-skills.sh

# Just marketplace validation
claude plugin validate .

# Custom metadata checks
./scripts/validate-claude-metadata.sh

# All validations (most thorough)
./scripts/validate-all-plugins.sh
```

## What Gets Validated

### 1. Claude CLI Validation (`claude plugin validate .`)

The official Claude Code validator checks:

- ✓ Marketplace.json schema compliance
- ✓ Required fields (name, version, owner, plugins)
- ✓ Plugin source paths exist
- ✓ Valid semver versions
- ✓ Proper field formats (kebab-case names, etc.)
- ✓ Skills, mcpServers, and other component configurations

### 2. Custom Metadata Validation (`validate-claude-metadata.sh`)

Additional checks for:

- ✓ JSON syntax
- ✓ Semantic versioning format
- ✓ Plugin source directory existence
- ✓ Handles both `./` and `@` path prefixes
- ✓ Author/owner information completeness

### 3. Skill Structure Validation

Checks all skills in `skills/` directory:

- ✓ Each skill directory has `SKILL.md`
- ✓ SKILL.md has frontmatter with `description`
- ✓ No orphaned SKILL.md files outside `skills/`
- ✓ Description fields are non-empty

## Current Plugin Structure

This marketplace uses **marketplace-level plugin definitions** with `source: "./"` to avoid path traversal issues:

```json
{
  "plugins": [
    {
      "name": "devenv",
      "source": "./",
      "skills": [
        "./skills/devenv-search",
        "./skills/devenv-init",
        "./skills/devenv-config"
      ],
      "mcpServers": { ... },
      "strict": false
    }
  ]
}
```

### Why This Structure?

1. **No path traversal**: Claude Code blocks `..` in paths for security
2. **Single source of truth**: All config in `marketplace.json`
3. **Shared skills**: Skills at root level, shared across plugins
4. **Full repo copied**: Using `source: "./"` copies entire repo to plugin cache

## Validation Results

All validations currently pass:

```text
✔ Claude CLI validation (claude plugin validate .)
✔ Custom metadata validation
✔ Skill structure validation
```

## Common Issues and Solutions

### Issue: "Path contains '..' which could be a path traversal attempt"

**Solution**: Use `source: "./"` in marketplace.json and define explicit paths:

```json
{
  "source": "./",
  "skills": ["./skills/my-skill"],
  "strict": false
}
```

### Issue: "Unrecognized key: 'mcp'"

**Solution**: Use `mcpServers` not `mcp`:

```json
{
  "mcpServers": {
    "server-name": {
      "type": "http",
      "url": "https://example.com"
    }
  }
}
```

### Issue: "skills: Invalid input"

**Solution**: Point to skill directories, not use relative parent paths:

```json
// ❌ Wrong
"skills": ["../../skills/my-skill"]

// ✓ Correct
"skills": ["./skills/my-skill"]
```

## CI/CD Integration

The pre-commit hook ensures validation runs locally. For CI/CD:

```yaml
# GitHub Actions example
- name: Validate plugins
  run: |
    direnv allow
    direnv exec . ./scripts/validate-skills.sh
```

## Testing Plugin Installation Locally

To test plugin installation before publishing:

```bash
# Install from local directory
claude plugin install . --scope local

# Verify installation
claude plugin list

# Test the skills
/devenv-search python
```

## References

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Plugin Schema](https://anthropic.com/claude-code/marketplace.schema.json)

## Getting Help

If validation fails:

1. Run `claude plugin validate . --verbose` for detailed errors
2. Check `VALIDATION.md` (this file) for common issues
3. Review the official [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
4. Open an issue with the validation error output
