# Documentation
Documentation skills for repository docs, project context, document templates, design documents, and architecture decision records.

## Skills
- `documentation:closed-source-docs`
- `documentation:create-doc-template`
- `documentation:open-source-docs`
- `documentation:project-context`
- `documentation:project-docs`
- `documentation:write-adr`
- `documentation:write-design-doc`

## Install
Codex:

```bash
codex plugin marketplace add lucasilverentand/skills
```

Claude Code:

```text
/plugin marketplace add lucasilverentand/skills
/plugin install documentation@skills-of-luca
```

Cursor (team marketplace):

1. Dashboard → Settings → Plugins → Import
2. Paste `https://github.com/lucasilverentand/skills`
3. Install `documentation` (Required or Optional)

Cursor (IDE slash commands):

```text
/plugin marketplace add lucasilverentand/skills
/plugin install documentation@skills-of-luca
```

This plugin owns its skill source under `plugins/documentation/skills/`. Edit those files directly, then run `bun run marketplace:write` to refresh generated manifests and marketplaces.

## Documentation surfaces
Use the repository documentation skills for README hubs, contribution docs, codebase navigation, ownership links, onboarding notes, and project context. Use `write-design-doc` and `write-adr` for architecture artifacts. Use `project-docs` for reusable project document templates.

## Template library
Starter templates for the documents kept around a product.

## What's in here
|Template|When to write it|How many|
|---|---|---|
|[Documentation placement rules](skills/project-docs/references/documentation-placement-rules-template.md)|When contributors need one rulebook for where planning, repo, and code-level docs belong.|One per app, product area, or repo|
|[Testing strategy](skills/project-docs/references/testing-strategy-template.md)|When a project needs one shared testing contract across features, packages, services, and releases.|One per app, product area, repo, or long-running project|
|[Project brief](skills/project-docs/references/project-brief-template.md)|At the start of a project, before commitment. The one-pager that justifies it.|One per project|
|[Customer profile](skills/project-docs/references/customer-profile-template.md)|Once there is a rough sense of who this is for. A living document that grows as the team learns.|One per project|
|[Research brief](skills/project-docs/references/research-brief-template.md)|When evidence needs its own source trail before a product, dependency, or implementation decision.|One per focused research question|
|[Platform dependency](skills/project-docs/references/platform-dependency-template.md)|When the product builds on something external — API, OS framework, hardware, vendor.|One per load-bearing dependency|
|[Feature spec](skills/project-docs/references/feature-spec-template.md)|Before building a feature with real scope.|One per feature|
|[Technical design](skills/project-docs/references/technical-design-template.md)|After product scope is clear enough to choose implementation shape.|One per feature, system, or infrastructure change that needs engineering review|
|[Decision record](skills/project-docs/references/decision-record-template.md)|After choosing a product, technical, operational, or process direction that future work may need to understand.|One per important decision|
|[Release readiness](skills/project-docs/references/release-readiness-template.md)|Before shipping a release, feature, service change, library version, CLI update, or infrastructure change.|One per release or launch decision|
|[Post-release review](skills/project-docs/references/post-release-review-template.md)|After something ships, stalls, or gets abandoned and the team needs to preserve what happened.|One per release or abandoned effort|

## Planner guide
Use templates as a chain, not as independent forms. Start with documentation placement rules when a repo or app has more than one possible documentation surface, add testing strategy when shared confidence rules matter, write the project brief, then create customer profile, platform dependency, feature spec, technical design, decision record, release readiness, and post-release review docs as the project earns them.

Agents should use [skills/create-doc-template/SKILL.md](skills/create-doc-template/SKILL.md) when adding or updating the reusable template library.
