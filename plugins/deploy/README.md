# Deploy
Deployment skills for environment topology, infrastructure readiness, CI/CD automation, release pipelines, rollback, and post-deploy verification.

## Skills
- `deploy:deployment-automation`
- `deploy:deployment-environments`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install deploy@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `deploy` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install deploy@skills-of-luca
```

This plugin owns its skill source under `plugins/deploy/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.
