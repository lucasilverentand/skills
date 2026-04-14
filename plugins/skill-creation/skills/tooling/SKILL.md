---
name: tooling
description: Creates and improves bun-based tools for skills — decides when a tool earns its place, scaffolds zero-dependency scripts with dual output, validates tool quality, and wires tools into SKILL.md decision trees. Use when adding a tool to a skill, improving an existing tool, deciding whether something should be a tool or inline instructions, or reviewing tool quality.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Tool Creation

## Decision tree

- What are you doing?
  - **Deciding whether to create a tool** -> read `references/when-to-create-tools.md`, apply the earning criteria
  - **Creating a new tool for a skill** -> follow "Creating a tool" below
  - **Improving an existing tool** -> what's wrong?
    - **Output is hard to parse programmatically** -> add `--json` output mode per `references/tool-conventions.md`
    - **Tool is a thin wrapper around a single command** -> it probably shouldn't be a tool. Inline the command in SKILL.md and delete the tool file
    - **Tool lacks help text or error handling** -> fix per `references/tool-conventions.md`
    - **Tool has external dependencies** -> rewrite using only bun built-ins and node stdlib
  - **Wiring a tool into a skill** -> follow "Wiring into SKILL.md" below
  - **Reviewing tool quality** -> check against `references/tool-conventions.md` "Quality checklist"

## Creating a tool

### 1. Validate the need

Before writing any code, confirm the tool passes at least one bar from `references/when-to-create-tools.md`. If it doesn't, put the command inline in SKILL.md instead.

### 2. Write the tool

Create `tools/<tool-name>.ts` following the conventions in `references/tool-conventions.md`. The structural patterns there reflect how tools in this repo are built — follow them for consistency.

Key principles:
- Zero external dependencies. Bun built-ins and node stdlib only.
- Dual output: human-readable by default, `--json` for programmatic consumption.
- Fail loudly: errors to stderr, non-zero exit codes, never silently swallow failures.
- Self-documenting: `--help` describes what the tool does, its arguments, and its options.

### 3. Validate

After writing:
1. Run the tool with `--help` to verify the help text is clear
2. Run against a real target to verify it produces correct output
3. Run with `--json` to verify structured output is valid JSON
4. Run with missing/bad arguments to verify it fails cleanly

## Wiring into SKILL.md

1. Add the tool to the appropriate decision tree branch — point to it from the action where it's useful
2. Reference it in the key references table at the bottom of SKILL.md
3. Don't duplicate the tool's logic in SKILL.md — just say when to run it and what to do with the output

## Key references

| File | What it covers |
| --- | --- |
| `references/when-to-create-tools.md` | Decision criteria for whether something should be a tool vs inline instructions |
| `references/tool-conventions.md` | Structural patterns, conventions, and quality checklist for building tools |
