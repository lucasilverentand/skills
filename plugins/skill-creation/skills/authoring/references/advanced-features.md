# Claude Code Advanced Features
These features are useful when a skill intentionally targets Claude Code. Do not treat them as portable Agent Skills features unless another client documents support.

## Dynamic context injection
Claude Code can run shell commands before the skill content reaches the model:

```markdown
## Current changes

!`git diff HEAD`
```

Use dynamic context injection when the skill needs a small, fresh snapshot such as current branch, diff, or dependency metadata. Avoid commands that are slow, destructive, or leak sensitive data. The `shell` frontmatter field controls which shell runs injected commands.

## Invocation control
Claude Code supports two frontmatter fields for visibility and invocation:

|Field|Effect|
|---|---|
|`disable-model-invocation: true`|The user can invoke the skill directly, but Claude will not auto-load it. Use for side-effectful tasks like deploys.|
|`user-invocable: false`|The skill is hidden from the `/` menu but can still be auto-loaded by Claude. Use for background context.|

Use permission rules or `skillOverrides` for user-level visibility decisions you do not want to encode in shared skill source.

## Tool permission fields
`allowed-tools` pre-approves the listed tools while the skill is active; it does not restrict every other tool. `disallowed-tools` removes tools from Claude's available pool while the skill is active.

Keep tool permissions narrow and concrete. For project skills, remember that users must trust the workspace before skill tool grants take effect.

## Extended thinking
Include the word `ultrathink` in the skill content to request deeper reasoning when the skill runs. Use this sparingly for work that genuinely needs more deliberation, such as complex architecture analysis or multi-file safety review. Do not add it to routine formatting or small edit skills.

## Forked execution
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

## Subagents with preloaded skills
Subagents can preload skills via the subagent's `skills` frontmatter field. This is the inverse of `context: fork`: the subagent receives the user's delegated task, plus the full content of the listed skills as reference material.

Do not add `skills` to a normal portable `SKILL.md` unless the target client documents that behavior.

## Hooks in skills
Claude Code supports hooks scoped to a skill's lifecycle. Hooks can enforce deterministic checks or guardrails around tool use.

Hooks are powerful and product-specific. Keep them out of portable skills unless the skill is explicitly Claude Code-only, document what they run, and check the current Claude Code hook schema before writing them.

## Built-in and legacy behavior
Claude Code includes bundled skills and built-in commands that may change by version. Reference current Claude Code docs instead of hardcoding a long built-in list in a reusable skill.

Legacy `.claude/commands/*.md` files still work and support similar frontmatter. Prefer skills for new portable workflows because skills can include supporting files and can be packaged in plugins.
