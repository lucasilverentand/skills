---
name: retrospecting
description: Mines recent Claude Code conversations and git history for struggles, repeated corrections, rework patterns, and taste signals — then turns findings into new skills or updates to existing ones. Use when you want to retrospect on recent coding sessions to extract learnings, identify skill gaps, improve existing skills based on real usage patterns, or codify preferences that keep coming up in conversations.
allowed-tools: Read Grep Glob Bash Write Edit Agent
---

# Retro

Retrospective analysis of recent Claude sessions and code changes to continuously improve the skill library.

## Current context

- Branch: !`git branch --show-current`
- Project: !`basename $(git rev-parse --show-toplevel)`

## Decision tree

- What do you want to do?
  - **Full retro** (conversations + git) -> follow "Running a full retro" below
  - **Just mine conversations** -> run `tools/conversation-miner.ts --project $(git rev-parse --show-toplevel)` and review findings
  - **Just check git rework** -> run `tools/rework-detector.ts` and review findings
  - **Create skills from findings** -> follow "Acting on findings" below

## Running a full retro

### 1. Gather data

Run both tools in parallel to collect findings:

```
tools/conversation-miner.ts --project $(git rev-parse --show-toplevel) --days 7 --json
tools/rework-detector.ts --days 7 --json
```

Adjust `--days` based on how far back the user wants to look (default: 7 days).

### 2. Review and cluster

Read the JSON output from both tools. Look for clusters — multiple findings that point to the same underlying issue or preference. Group them by theme:

- **Repeated struggles** — the same kind of correction or retry across multiple conversations
- **Taste patterns** — consistent preferences that aren't yet codified in a skill
- **Rework hotspots** — files or areas where git shows repeated churn alongside conversation struggles
- **Skill gaps** — tasks that required many turns but could be streamlined with a skill

### 3. Cross-reference existing skills

Before proposing new skills, check what already exists:

```
ls skills/
```

For each cluster, search existing skills for overlap:

```
grep -r "<keyword>" skills/*/SKILL.md
```

Classify each cluster as:
- **New skill needed** — no existing skill covers this area
- **Existing skill update** — a skill exists but misses this pattern
- **CLAUDE.md addition** — too small for a skill, better as a project instruction
- **Memory entry** — a personal preference that should be saved to memory

### 4. Present the retro report

Present findings to the user as a structured report:

```
## Retro Report — [date range]

### Struggles Found
For each struggle:
- **Pattern**: what kept going wrong
- **Evidence**: quotes from conversations, git commits
- **Frequency**: how many times it appeared
- **Suggested action**: new skill / skill update / CLAUDE.md / memory

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

- **New skill** -> use the lifecycle skill to create it. Pass the finding's evidence as context for intent capture — the struggle patterns become the skill's decision tree branches, the taste signals become its conventions.
- **Skill update** -> read the existing SKILL.md, identify where the new pattern fits, and edit it in. Add new decision tree branches, conventions, or tool behaviors as needed.
- **CLAUDE.md addition** -> append the preference or rule to the project's CLAUDE.md file.
- **Memory entry** -> save to memory using the appropriate memory type (feedback for corrections, user for preferences).

## Key references

| File | What it covers |
|---|---|
| `references/pattern-catalog.md` | Catalog of recognizable struggle and taste patterns with detection heuristics |
