---
name: retrospecting
description: Mines recent Codex or Claude agent conversations and git history for struggles, repeated corrections, rework patterns, and taste signals — then turns findings into new skills or updates to existing ones. Use when retrospecting on recent coding sessions, extracting learnings, identifying skill gaps, improving skills from real usage patterns, codifying recurring preferences, or when the user says "retro this repo", "mine recent conversations", "what should become a skill", or "find repeated agent mistakes".
allowed-tools: Read Grep Glob Bash Write Edit Agent
---

# Retro
Retrospective analysis of recent agent sessions and code changes to continuously improve the skill library.

## Decision tree
- What do you want to do?
  - **Full retro** (conversations + git) -> follow "Running a full retro" below
  - **Just mine conversations** -> run `tools/conversation-miner.ts --project $(git rev-parse --show-toplevel) --source auto` and review findings
  - **Just check git rework** -> run `tools/rework-detector.ts` and review findings
  - **Create skills from findings** -> follow "Acting on findings" below

## Running a full retro
A full retro has two phases: gathering data and cross-referencing existing skills. For larger skill libraries or longer time ranges, offer to use agents — a Miner to gather and cluster, and a Cross-Referrer to classify findings against existing skills. For smaller retros, single-agent is fine. Let the user decide.

### Single-agent flow
Start by identifying the current project root and, if useful for the report, the branch:

```bash
git rev-parse --show-toplevel
git branch --show-current
```

#### 1. Gather data
Run both tools in parallel to collect findings:

```bash
tools/conversation-miner.ts --project $(git rev-parse --show-toplevel) --source auto --days 7 --json
tools/rework-detector.ts --days 7 --json
```

Adjust `--days` based on how far back the user wants to look (default: 7 days). Use `--source codex` or `--source claude` when the user wants a specific agent's transcript store. Use `--transcripts <path>` for exported JSONL sessions or custom transcript archives.

#### 2. Review and cluster
Read the JSON output from both tools. Look for clusters — multiple findings that point to the same underlying issue or preference. Group them by theme:

- **Repeated struggles** — the same kind of correction or retry across multiple conversations
- **Taste patterns** — consistent preferences that aren't yet codified in a skill
- **Rework hotspots** — files or areas where git shows repeated churn alongside conversation struggles
- **Skill gaps** — tasks that required many turns but could be streamlined with a skill

#### 3. Cross-reference existing skills
Before proposing new skills, check what already exists:

Use Glob to list existing skills:

```
Glob pattern: plugins/*/skills/*/SKILL.md
```

For each cluster, search existing skills for overlap:

```
Grep pattern: "<keyword>" in plugins/*/skills/*/SKILL.md
```

Classify each cluster as:

- **New skill needed** — no existing skill covers this area
- **Existing skill update** — a skill exists but misses this pattern
- **Project instruction addition** — too small for a skill, better in AGENTS.md, CLAUDE.md, or another repo instruction file
- **Memory entry** — a personal preference that should be saved to memory

### Agent flow (optional)
When the skill library is large or the retro covers many days, agents keep context focused:

**Miner** (general-purpose agent) — runs both tools, uses `--source auto` unless the user asks for a specific transcript source, clusters raw findings by theme, produces a structured findings document with clusters, evidence, and frequency counts.

**Cross-Referrer** (Explore agent, read-only) — receives the Miner's clusters, reads all existing skills in the repo (Glob for `plugins/*/skills/*/SKILL.md`), searches for overlap, and classifies each cluster as new skill / skill update / project-instructions addition / memory entry. Returns an annotated report.

Flow: spawn Miner → read its clusters → spawn Cross-Referrer with clusters → read its classifications → format the report below.

### 4. Present the retro report
Present findings to the user as a structured report:

```markdown
## Retro Report — [date range]

### Struggles Found
For each struggle:
- **Pattern**: what kept going wrong
- **Evidence**: quotes from conversations, git commits
- **Frequency**: how many times it appeared
- **Suggested action**: new skill / skill update / project instructions / memory

### Taste Signals Found
For each taste:
- **Preference**: what the user consistently wants
- **Evidence**: quotes showing the pattern
- **Suggested action**: where to codify this

### Rework Hotspots
For each hotspot:
- **Files**: which files had high churn
- **Pattern**: what kind of rework (fix-after-feat, reverts, etc.)
- **Suggested action**: skill that could prevent this
```

Wait for user input before acting on any findings.

## Acting on findings
For each approved finding:

- **New skill** -> use the authoring skill to create it. Pass the finding's evidence as context for intent capture — the struggle patterns become the skill's decision tree branches, the taste signals become its conventions.
- **Skill update** -> read the existing SKILL.md, identify where the new pattern fits, and edit it in. Add new decision tree branches, conventions, or tool behaviors as needed.
- **Project instruction addition** -> append the preference or rule to the repo's agent instruction file, such as AGENTS.md or CLAUDE.md.
- **Memory entry** -> save to memory using the appropriate memory type (feedback for corrections, user for preferences).

## Key references
|File|What it covers|
|---|---|
|`references/pattern-catalog.md`|Catalog of recognizable struggle and taste patterns with detection heuristics|
