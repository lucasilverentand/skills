---
name: taste-encoding
description: Interviews the user to extract their design taste, technology preferences, and opinionated defaults for a domain, then encodes those preferences into skill reference files, decision rules, conventions, and anti-patterns. Use when the user says "encode my taste", "add my preferences to this skill", "make this skill opinionated", "interview me about my preferences for X", or asks to capture style/defaults in a reusable skill.
allowed-tools: Read Grep Glob Bash Write Edit Agent
---

# Taste Encoding
Extracts a user's design taste through structured interviews and encodes it into skill artifacts — reference files, decision rules, conventions, comparison tables, and anti-patterns. Taste is the difference between a generic skill ("here are 5 database options") and an opinionated one ("use D1 for small projects, Neon when you need RLS or compliance — here's exactly why").

## Decision tree
- What does the user want?
  - **Encode taste into a new skill** → the skill doesn't exist yet. Hand off to the authoring skill (`authoring`) to scaffold the skill first, then come back here for taste encoding.
  - **Encode taste into an existing skill** → what's the current state?
    - **Skill has no taste yet** (generic, presents options without opinions) → run the full process below
    - **Skill has some taste but gaps remain** → read the skill, identify which domains still lack opinions, run a focused interview on those gaps only
    - **Skill taste is stale or wrong** → read the skill, ask the user what changed, update the relevant reference files
  - **Review how taste is encoded in a skill** → read the skill's SKILL.md and reference files, assess against the patterns in `references/encoding-patterns.md`, report gaps
  - **Interview without a specific skill target** → run the interview, save findings to a structured document the user can apply later

## Full process

### 1. Scope the domain
Read the target skill's SKILL.md and any existing reference files. Identify:

- What decisions does this skill guide? (e.g., data modeling → ID strategy, naming, tenancy, migrations)
- Which decisions are currently generic (presenting options without recommending one)?
- Which decisions are missing entirely?

List the taste gaps — these become the interview topics.

### 2. Interview
Use the host's structured question mechanism when one is available, such as `AskUserQuestion`, `request_user_input`, or an equivalent UI prompt. If no structured question tool is available, ask concise plain-text questions directly. In either mode, ask 1-3 related questions at a time and wait for answers before continuing.

Follow `references/interview-guide.md` for the full interview protocol. The essentials:

**Open with context, not cold questions.** Before asking about preferences, state what you already know from the skill and any available agent instructions, memory, or project docs. "I see you use Drizzle with Neon for complex projects and D1 for simple ones. Let me ask about the decisions within that — ID strategy, naming conventions, etc." This avoids re-asking settled questions and shows the user you've done your homework.

**Ask about decisions, not preferences directly.** "When you have a new table, how do you decide between a `jsonb` column and a dedicated table?" is better than "Do you prefer JSONB or normalized tables?" The decision framing reveals the reasoning, which is what gets encoded.

**Listen for the "because."** Every strong opinion has a story — a past incident, a scaling problem, a debugging nightmare. When the user states a preference, ask what happened that made them feel strongly. The story becomes the rationale in the encoded taste.

**Batch questions by theme.** Group related decisions together (all naming conventions, then all tenancy decisions, then all migration decisions). Don't jump between unrelated topics.

**Weigh pros and cons actively.** Don't just record preferences — challenge them constructively. Surface trade-offs the user might not have considered, present the other side fairly, and flag where a preference has real costs. The goal is informed taste, not a transcription of habits. See `references/encoding-patterns.md` "Weighing trade-offs with the user" for specifics.

**Know when to stop.** If the user says "I don't have a strong opinion" or "whatever's standard" — that's a valid answer. Record it as "use industry default" and move on. Not every decision needs taste.

### 3. Organize findings
Group interview answers into categories:

|Category|What goes here|Becomes|
|---|---|---|
|**Principles**|Core beliefs that guide many decisions ("monolith-first", "lean on existing stack")|A focused philosophy or principles reference file|
|**Defaults**|Concrete choices for specific decisions ("prefixed ULIDs for IDs", "snake_case for tables")|Conventions section in SKILL.md, or domain-specific reference files|
|**Decision rules**|Conditional choices ("D1 when small, Neon when multi-tenant")|Decision tables or if/then rules in SKILL.md or references|
|**Anti-patterns**|Things to avoid with reasoning ("never sequential integers — they leak count")|Anti-pattern sections in references|
|**No opinion**|Decisions where the user defers to convention|Skip — don't encode absence of taste|

### 4. Encode
Transform organized findings into skill artifacts using the patterns in `references/encoding-patterns.md`. The key patterns:

**The "because" pattern.** Every opinionated rule gets a rationale. Not "use ULIDs" but "use ULIDs — because they're time-sortable, prefix-distinguishable in logs, and don't leak count like sequential integers."

**Comparison tables for either/or decisions.** When a choice depends on context (D1 vs Neon, REST vs GraphQL), encode a comparison table with clear factors, then a decision rule underneath: "Start with X when [conditions]. Graduate to Y when [conditions]."

**Anti-patterns with stories.** "Anti-pattern: mocking the database in tests. Prior incident: mocked tests passed but prod migration failed because the mock didn't enforce the same constraints."

**Philosophy files for cross-cutting principles.** When 3+ decisions share the same underlying principle, extract them to a focused philosophy or principles reference file with 3-5 principles, each with rationale and anti-pattern example.

For each artifact:

1. Write the reference file (or update existing ones)
2. Update SKILL.md to reference it — add to the key references table, link from relevant decision tree branches or workflow steps
3. Inline the most critical 1-2 sentence summary in SKILL.md itself so the agent gets the gist without reading the reference

**Multi-skill encoding:** When encoding taste across multiple skills at once, offer to fan out step 4 to parallel agents — one Encoder agent per target skill, each receiving only that skill's organized findings. This avoids serializing work on independent files. For a single skill, stay single-agent.

### 5. Validate
After encoding:

1. Read the updated SKILL.md end-to-end — does an agent following it produce opinionated output aligned with the user's taste?
2. Check that every encoded preference has a rationale (the "because")
3. Check that decision rules have clear conditions, not vague ones ("when it makes sense" → bad, "when you need RLS or multi-tenant isolation" → good)
4. Run the token-estimate tool from the authoring skill (`../authoring/tools/token-estimate.ts`) on the SKILL.md to verify it's still under 5000 tokens — taste encoding can bloat the main file if you inline too much
5. Confirm no reference file exceeds ~300 lines — split if needed

Present a summary to the user: what was encoded, where it lives, and any decisions that were left generic (with reasoning).

## Focused interview (for filling gaps)
When a skill already has some taste but not enough:

1. Read all existing reference files and conventions
2. List what's already encoded vs what's generic
3. Interview only the gaps — skip topics where the skill is already opinionated
4. Encode findings into the existing structure (update files, don't create parallel ones)

## Key references
|File|Covers|
|---|---|
|`references/interview-guide.md`|Question strategies by domain type, signal recognition, batching, depth calibration|
|`references/encoding-patterns.md`|The six encoding patterns with examples from real skills|
