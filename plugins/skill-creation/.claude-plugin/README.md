# skill-creation

Toolkit for creating, testing, publishing, and maintaining agent skills for Claude Code.

## Skills

### authoring

Full lifecycle management for skills — scaffolding, writing SKILL.md files, adding tools and references, validating structure and token budgets, running evaluations, optimizing descriptions, and publishing to the marketplace.

**Tools:** `skill-validate`, `token-estimate`, `coverage-gap`, `marketplace-lint`
**Scripts:** `run-eval`, `run-loop`, `aggregate-benchmark`, `generate-report`, `improve-description`, `package-skill`, `quick-validate`

### retrospecting

Mines recent Claude Code conversations and git history for struggles, repeated corrections, rework patterns, and taste signals — then turns findings into new skills or skill improvements.

**Tools:** `conversation-miner`, `rework-detector`

### taste-encoding

Interviews the user to extract their design taste and preferences for a domain, then encodes those into skill reference files, decision rules, conventions, comparison tables, and anti-patterns.

## Installation

Add this plugin to your Claude Code configuration:

```json
{
  "plugins": ["plugins/skill-creation"]
}
```

## Author

Luca Silverentand (<dev@lucasilverentand.com>)
