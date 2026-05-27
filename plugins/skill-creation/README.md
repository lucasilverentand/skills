# Skill Creation
End-to-end toolkit for authoring, publishing, tooling, and improving reusable agent skills.

## Skills
- `skill-creation:authoring`
- `skill-creation:publishing`
- `skill-creation:retrospecting`
- `skill-creation:taste-encoding`
- `skill-creation:tooling`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install skill-creation@skills-of-luca
```

Cursor:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install skill-creation@skills-of-luca
```

This plugin owns its skill source under `plugins/skill-creation/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
