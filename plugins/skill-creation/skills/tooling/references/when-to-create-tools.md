# When to Create Tools

A tool must earn its place in a skill. Most skills work fine without any tools — clear instructions in SKILL.md are often enough. Creating a tool that doesn't pull its weight adds maintenance burden and bloats the skill for every future invocation.

## The earning criteria

A tool should do at least one of these:

**Compose multiple commands into a workflow.** When the skill needs to run several commands in sequence where the output of one feeds into the next, a tool bundles that orchestration. The alternative — writing "run X, then take the output and run Y, then..." in SKILL.md — is fragile and error-prone because the agent may get intermediate steps wrong.

**Contain real logic.** Validation rules, pattern matching, threshold detection, categorization, conflict analysis, structural checks — anything where the behavior isn't just "run this command with these flags." If the tool's core loop is doing meaningful computation rather than delegating to a subprocess, it earns its place.

**Automate an error-prone sequence.** Multi-step operations where getting the order wrong or forgetting a step causes real problems. Cherry-picking across branches, regenerating a file from multiple sources, parsing and cross-referencing structured data — these benefit from being encoded in a script rather than described in prose.

## When NOT to create a tool

**Single commands with flags.** If the tool's implementation is essentially running a command with minor output formatting, put that command inline in SKILL.md instead. The agent can run it directly.

**Convenience wrappers.** A tool that just makes a command slightly easier to type isn't worth the file. The agent doesn't need ergonomic shortcuts — it needs clear instructions.

**Target-count padding.** Never create tools to make a skill look more complete. A skill with zero tools and clear inline commands beats a skill with three thin wrappers.

**Things the agent already does well.** File reading, grep, glob, git operations — the agent has dedicated tools for these. Don't reimplement them in a script.

## The litmus test

Ask: "If I deleted this tool and wrote the equivalent as 2-3 lines of instructions in SKILL.md, would the agent's output quality drop?" If no, the tool doesn't earn its place.
