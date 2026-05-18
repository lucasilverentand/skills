# Agent Workflow for Skill Creation
An optional workflow that uses specialized agents to research, write, and validate a skill. Useful for complex skills — overkill for simple ones.

## When to offer
Offer the agent workflow when the skill being created is:
- **Workflow or agent tier** — chains multiple concerns, has 2+ reference files, or needs domain research
- **Targeting an unfamiliar domain** — the orchestrator doesn't have deep context on the domain's conventions or existing skills

Stay single-agent when:
- The skill is atomic (one concern, short decision tree, 0-1 references)
- The user is iterating on an existing skill (improvements, refactoring, adding references)
- The scope is already well-understood from conversation context

## Roles

### Researcher (Explore agent, read-only)
Loads the full skill landscape and spec so the Writer doesn't have to.

Deliverable — a **research brief** containing:
1. **Existing overlap** — skills that cover similar ground, with paths and descriptions
2. **Recommended tier** — atomic, workflow, or agent, with reasoning
3. **Relevant patterns** — conventions from similar skills worth reusing (decision tree shapes, reference structures, tool patterns)
4. **Spec constraints** — frontmatter fields, naming rules, token limits that apply
5. **Domain context** — if the skill targets a specific domain, what the codebase already does in that area

What to read:
- All `skills/*/SKILL.md` in the target plugin (Glob + Read)
- `references/skill-format.md`, `references/skill-taxonomy.md`, `references/skill-structure.md`
- Codebase files relevant to the skill's domain

### Writer (general-purpose agent)
Receives the captured intent and the research brief. Writes:
- `SKILL.md` with frontmatter, decision tree, conventions, and key references table
- Reference files in `references/`
- Does NOT write tools — that's the tooling skill's job

### Validator (Explore agent, read-only)
Runs after the Writer finishes:
1. `tools/skill-validate.ts <path>` — structure and frontmatter
2. `tools/token-estimate.ts <path>/SKILL.md` — must be under 5000 tokens
3. `tools/coverage-gap.ts <path>` — references and tools exist, no dead branches
4. Reads the SKILL.md and checks: does the decision tree cover the stated intent? Are references linked properly?

Reports pass/fail with specific issues to fix.

## Flow
```
Orchestrator (you)
  1. Capture intent — ask clarifying questions, determine tier
  2. Offer agent workflow if warranted: "This looks complex enough
     to benefit from a research-write-validate pipeline. Want me
     to use specialized agents, or keep it single-threaded?"
  3. If accepted:
     a. Spawn Researcher → read its brief
     b. Spawn Writer with intent + brief → review output
     c. Spawn Validator → apply fixes from its report
  4. If declined: proceed with the single-agent "Creating a skill" flow
```

## Anti-patterns
- **Don't team for tweaks** — fixing frontmatter, adding a reference, improving a decision tree are focused tasks. Agents add overhead without quality gain.
- **Don't skip the offer** — always let the user choose. Some prefer watching the full flow; others want it done fast.
- **Don't pass raw file contents between agents** — the Researcher produces a brief (structured summary), not a dump of everything it read. The Writer gets a focused input, not a wall of text.
