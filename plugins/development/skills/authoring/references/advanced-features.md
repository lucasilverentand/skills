# Agent-Specific Advanced Features
Start from the portable Agent Skills baseline: `name`, `description`, Markdown instructions, and supporting files such as `references/`, `scripts/`, and `assets/`. Add the features below only when the target agent client documents support for them, and label product-specific behavior clearly so shared skills stay usable in Codex, Claude Code, Cursor, and future Agent Skills clients.

## Codex app metadata
Codex-specific UI metadata, invocation policy, and MCP dependencies live in `agents/openai.yaml`, not in `SKILL.md` frontmatter. Use it when the skill needs install-surface display copy, a default prompt, implicit-invocation policy, or an app/tool dependency declaration.

Keep `agents/openai.yaml` in sync with the skill's `description`, but do not move portable trigger guidance out of `SKILL.md`; other clients will not read Codex app metadata.

## Claude Code dynamic context injection
Claude Code can run shell commands before the skill content reaches the model:

```markdown
## Current changes

!`git diff HEAD`
```

Use dynamic context injection when the skill needs a small, fresh snapshot such as current branch, diff, or dependency metadata. Avoid commands that are slow, destructive, or leak sensitive data. The `shell` frontmatter field controls which shell runs injected commands.

## Claude Code invocation control
Claude Code supports two frontmatter fields for visibility and invocation:

|Field|Effect|
|---|---|
|`disable-model-invocation: true`|The user can invoke the skill directly, but Claude will not auto-load it. Use for side-effectful tasks like deploys.|
|`user-invocable: false`|The skill is hidden from the `/` menu but can still be auto-loaded by Claude. Use for background context.|

Use permission rules or `skillOverrides` for user-level visibility decisions you do not want to encode in shared skill source.

## Claude Code tool permission fields
`allowed-tools` pre-approves the listed tools while the skill is active; it does not restrict every other tool. `disallowed-tools` removes tools from Claude's available pool while the skill is active.

Keep tool permissions narrow and concrete. For project skills, remember that users must trust the workspace before skill tool grants take effect.

## Claude Code extended thinking
Include the word `ultrathink` in the skill content to request deeper reasoning when the skill runs. Use this sparingly for work that genuinely needs more deliberation, such as complex architecture analysis or multi-file safety review. Do not add it to routine formatting or small edit skills.

## Claude Code forked execution
Add `context: fork` when the skill should run in an isolated subagent context:

```yaml
---
name: deep-research
description: Research a topic thoroughly.
context: fork
agent: Explore
---
```

The skill content becomes the subagent task. Forked skills need explicit action instructions; a reference-only skill usually has no useful task to execute in isolation. `agent` can name a built-in agent such as `Explore`, `Plan`, `general-purpose`, or a custom subagent.

## Claude Code subagents with preloaded skills
Subagents can preload skills via the subagent's `skills` frontmatter field. This is the inverse of `context: fork`: the subagent receives the user's delegated task, plus the full content of the listed skills as reference material.

Do not add `skills` to a normal portable `SKILL.md` unless the target client documents that behavior.

## Claude Code hooks in skills
Claude Code supports hooks scoped to a skill's lifecycle. Hooks can enforce deterministic checks or guardrails around tool use.

```yaml
---
name: secure-ops
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks: [{ type: command, command: "${CLAUDE_SKILL_DIR}/scripts/security-check.sh" }]
---
```

Hooks are powerful and product-specific. Keep them out of portable skills unless the skill is explicitly Claude Code-only, document what they run, and check the current Claude Code hook schema before writing them.

## Claude Code built-in and legacy behavior
Claude Code includes bundled skills and built-in commands that may change by version. Reference current Claude Code docs instead of hardcoding a long built-in list in a reusable skill.

Legacy `.claude/commands/*.md` files still work and support similar frontmatter. Prefer skills for new portable workflows because skills can include supporting files and can be packaged in plugins.
