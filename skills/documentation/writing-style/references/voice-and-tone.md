# Voice and Tone

The shared writing voice for all documentation. Specialized skills may add constraints (e.g., external-docs may be more polished, internal-docs more concise), but these fundamentals always apply.

## Voice

Write like a smart teammate explaining things — conversational but precise. The reader should feel informed, not lectured.

### Do

- Use active voice: "The function returns an error" not "An error is returned by the function"
- Use "you" to address the reader directly
- Use contractions naturally: "don't", "you'll", "it's"
- Lead with the most important information
- Use specific, concrete language: "P95 latency increased from 200ms to 1.2s" not "performance degraded"

### Don't

- Use corporate speak: "leverage", "synergize", "align on", "circle back"
- Hedge unnecessarily: "It might perhaps be worth considering" → "Consider"
- Use filler phrases: "It is worth noting that", "As previously mentioned", "In order to"
- Write passive constructions when active is clearer
- Use jargon without defining it for the intended audience

## Tone Calibration

The tone shifts slightly based on context while keeping the same voice:

| Context | Tone | Example |
|---|---|---|
| Developer docs (READMEs, guides) | Friendly, practical | "Install with `bun add foo`, then..." |
| Internal docs (specs, RFCs) | Direct, precise | "This proposal replaces the current auth middleware with..." |
| Reports (analysis, retros) | Factual, evidence-driven | "Latency increased 6x after the v3.2 deploy (see Figure 1)" |
| External docs (blog, release notes) | Engaging, clear | "We shipped dark mode. Here's what changed and why." |
| Incident post-mortems | Blameless, factual | "The deploy process lacks a rollback mechanism" not "Bob broke the deploy" |

## Formatting Standards

### Headings

- Use sentence case: "Getting started" not "Getting Started"
- Keep headings short and descriptive — they're navigation, not sentences
- Don't skip heading levels (h2 → h4)

### Lists

- Use bullet points for unordered items
- Use numbered lists for sequential steps or ranked items
- Keep list items parallel in structure: all start with a verb, or all are noun phrases
- Don't use bullet points for a single item

### Tables

- Use tables when comparing 3+ items across the same attributes
- Always include a header row
- Keep cells concise — link to details instead of inlining paragraphs
- Align columns logically: name/label first, then attributes, then notes

### Code

- Use inline code for identifiers, file paths, commands, and values: `package.json`, `bun install`, `true`
- Use fenced code blocks with language tags for multi-line code
- Every code example should be copy-pasteable and runnable
- Show expected output in a comment when it aids understanding

### Links

- Use descriptive link text: "see the [migration guide](url)" not "click [here](url)"
- Link to source files, PRs, and external references inline
- Check that links resolve before publishing

## Content Principles

### Structure

- **Executive summary first** — a reader who stops after the first paragraph should get the key message
- **Progressive disclosure** — start with the simplest explanation, add complexity only as needed
- **One idea per paragraph** — if a paragraph covers two topics, split it
- **Consistent terminology** — pick one term and stick with it. Don't alternate between "endpoint", "route", and "API path"

### Evidence

- Every factual claim needs a source: code reference, data point, link, or explicit reasoning
- Clearly separate facts from interpretation: "Latency is 1.2s (fact). This likely causes the timeout errors users reported (interpretation)"
- When citing metrics, include the measurement method and date
- Prefer primary sources (official docs, benchmarks you ran) over secondary (blog posts, hearsay)

### Brevity

- Remove sentences that don't add information
- Replace vague phrases with specific ones
- Cut "it should be noted that", "it is important to", "as we can see"
- If a section can be a table, make it a table
- If a paragraph is just one sentence, consider merging it with an adjacent section or making it a list item

## Defaults

These are sensible defaults. Adapt to user preferences when they express them.

| Setting | Default | Override when... |
|---|---|---|
| Tone | Conversational but clear | User asks for formal, minimal, or a different voice |
| Output format | Markdown (.md) | User requests .docx, Notion, or another format |
| File naming | kebab-case descriptive (e.g., `auth-migration-spec.md`) | User specifies a different convention |
| Visuals | Proactively suggest diagrams/tables when useful | User says "only if I ask" |
| Doc length | Depends on the doc — match depth to audience needs | User states a preference |
