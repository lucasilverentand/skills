# Encoding Patterns

Six patterns for turning interview findings into skill artifacts. Each pattern includes the structure, when to use it, and a real example from the systems-design skills.

## 1. The "because" pattern

Every opinionated rule gets a rationale sentence. The rationale is what makes taste useful — without it, an agent follows the rule blindly and can't judge edge cases.

**Structure:**

```
**Rule statement** — Because [rationale]. [Optional: consequence of not following].
```

**Example** (from `data-modeling`):

> **Never sequential integers** — they leak count ("you're customer #47"), enable enumeration attacks, and cause insert hotspots in distributed databases.

**When to use:** Every concrete default or convention. If you can't write a "because", the opinion might not be strong enough to encode.

## 2. Comparison tables with decision rules

When a choice depends on context, encode a side-by-side table followed by a clear decision rule. The table shows the trade-offs honestly; the decision rule gives the opinionated default.

**Structure:**

```markdown
| Factor | Option A | Option B |
|---|---|---|
| **Best for** | ... | ... |
| **Weakness** | ... | ... |
| **Cost** | ... | ... |

**Decision rule:** Start with A when [conditions]. Graduate to B when [conditions].

**When in doubt:** [tiebreaker question or default].
```

**Example** (from `data-modeling`):

The D1 vs Neon table compares 8 factors (best for, queries, tenancy, compliance, scale, cost, migration path, ecosystem), then:

> **Decision rule:** Start with D1 when the project is small, single-purpose, and internal. Graduate to Neon when you need RLS, complex queries, GDPR data residency, or the data will grow past what SQLite handles comfortably.
>
> **When in doubt:** ask how many tenants, whether RLS matters, and whether EU data residency is required. If any answer is "yes", pick Neon.

**When to use:** Either/or decisions where both options are genuinely good in different contexts. Don't use for decisions where one option is clearly better — use a direct convention instead.

**Important:** Present trade-offs honestly. The table should give each option its real best case. Strawman comparisons ("Option B is bad at everything") are useless and undermine trust. The taste lives in the decision rule and the "when in doubt" tiebreaker, not in rigging the comparison.

## 3. Anti-patterns with stories

Anti-patterns are taste expressed as "never do this" — but they need a story or consequence to stick. A bare prohibition is weaker than one grounded in a real failure.

**Structure:**

```markdown
**Anti-pattern:** [What not to do]. [Story or consequence].
```

**Example** (from `architecture/philosophy.md`):

> **Anti-pattern:** drawing 8 microservices on day 1 because "that's how Netflix does it." Netflix has thousands of engineers and decades of operational tooling. You don't.

**Example** (from `architecture/testing.md`):

> Prior incident: mocked DB tests passed but prod migration failed because the mock didn't enforce the same constraints. This is why we test against real databases.

**When to use:** When the user has a strong "never" backed by experience. The story turns "don't do this" into "here's what happens when you do."

## 4. Philosophy files

When 3+ decisions share an underlying principle, extract it to a dedicated reference file. Philosophy files contain the *why* behind a cluster of conventions.

**Structure:**

```markdown
# [Domain] Philosophy

## Principle name

[1-2 paragraph explanation of the principle and reasoning.]

[Concrete implications for decisions this principle affects.]

**Anti-pattern:** [What violating this principle looks like in practice.]
```

**Example** (from `architecture/references/philosophy.md`):

Three principles — monolith-first, extract early when the concept is clear, lean on existing stack — each with a paragraph of reasoning and an anti-pattern. These three principles drive dozens of specific decisions across the architecture skill.

**When to use:** When you notice the user's answers clustering around a shared belief. "Lean on existing stack" explains why they pick CF Queues over Kafka, KV over Redis, and D1 over a managed Postgres for simple projects. One principle, many defaults.

**How many:** 3-5 principles per philosophy file. Fewer than 3 means the principles aren't distinct enough. More than 5 means some are specific conventions masquerading as principles.

## 5. Domain-specific reference files

Detailed taste for a single topic — conventions, rules, examples — in a focused reference file. These are the workhorses of taste encoding.

**Structure:**

One markdown file per topic. Organized by decision/aspect, each with the opinionated default and rationale.

**Example** (from `data-modeling/references/naming.md`):

A file covering table naming (plural snake_case), column naming (snake_case), index naming (`idx_<table>_<columns>`), and the Drizzle mapping convention — each with a "because" explaining the reasoning.

**When to use:** When a topic has 3+ related conventions that belong together. Don't create a reference file for a single convention — inline that in SKILL.md.

**Sizing:** Keep under 300 lines. If a reference file grows past this, split by sub-topic.

## 6. Trade-off tables in decision trees

When a skill's decision tree hits a branch where the right path depends on trade-offs, embed a compact trade-off table at that branch point.

**Structure:**

```markdown
- **Choosing between X and Y** → consider:

  | Factor | X | Y |
  |---|---|---|
  | Latency | Lower | Higher |
  | Complexity | Simple | Complex |

  Default to X. Switch to Y when [specific condition].
```

**Example** (from `architecture` SKILL.md, tech selection step):

> | Decision | Chose | Rejected | Why |
> |---|---|---|---|
> | Message passing | CF Queues | Kafka | Queues integrates natively with Workers; Kafka adds ops burden for throughput we don't need |

**When to use:** At decision points in the skill workflow where the agent needs to make a choice. Keep these compact — full comparisons go in reference files.

## Weighing trade-offs with the user

Taste encoding isn't just recording what the user says. During the interview, actively weigh pros and cons for decisions where the user might not have considered all angles:

- **Surface trade-offs the user might not see.** "You mentioned always using Neon — have you considered that D1 is significantly cheaper for small single-purpose tools where you don't need RLS?" The goal isn't to change their mind, but to make sure the encoded taste reflects an informed decision.
- **Challenge unconsidered defaults.** If the user says "I always use X" without a strong reason, probe whether that's genuine taste or habit. "Is there a reason you prefer X over Y, or is it more that you haven't had a reason to try Y?" Habit isn't taste — taste has reasoning behind it.
- **Present the other side fairly.** When encoding a decision rule, make sure the rejected option gets its real best case. If the user picks REST over GraphQL, the encoded taste should acknowledge where GraphQL genuinely shines — then explain why REST still wins for their context.
- **Flag where taste has costs.** Some preferences have real trade-offs. "Prefixed ULIDs are great for debugging, but they use more storage than plain UUIDs and aren't natively supported by Postgres uuid type. You'll store them as text." Encode the trade-off alongside the preference so the agent can flag it when the cost matters.

The result should be taste that's both opinionated *and* well-reasoned — not just a list of preferences, but a set of decisions with clear rationale that an agent can apply confidently and explain when asked.

## Where each pattern lives

| Pattern | Primary location | Linked from SKILL.md? |
|---|---|---|
| "Because" rationale | Inline in conventions or reference files | When inline in SKILL.md, yes |
| Comparison table + decision rule | Reference file or SKILL.md (if compact) | Yes, in decision tree or workflow |
| Anti-pattern with story | Reference files | Summarized in SKILL.md conventions |
| Philosophy file | `references/philosophy.md` or `references/principles.md` | Yes, in key references table |
| Domain reference file | `references/<topic>.md` | Yes, in key references table |
| Trade-off table in decision tree | SKILL.md decision tree | Already in SKILL.md |

## Choosing the right pattern

Not every piece of taste uses the same pattern. Match to the shape of the opinion:

- **Single concrete choice** → "because" pattern, inline or in a domain reference
- **Either/or dependent on context** → comparison table with decision rule
- **"Never do X"** → anti-pattern with story
- **Broad principle driving many choices** → philosophy file
- **Cluster of related conventions** → domain reference file
- **Choice point in a workflow** → trade-off table in decision tree
