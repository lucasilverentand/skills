---
name: coauthoring
description: Guide users through a structured workflow for co-authoring internal project documentation. Covers all doc types (specs, RFCs, proposals, decision docs, postmortems, ADRs, project briefs, etc.) with a 3-stage process — Context Gathering, Refinement & Structure, and Reader Testing. Use when writing docs, creating proposals, drafting specs, or any substantial writing task.
---

# Doc Co-Authoring Workflow

A structured workflow for co-authoring internal project documentation. Walks users through three stages: Context Gathering, Refinement & Structure, and Reader Testing.

## Defaults & Preferences

These are sensible defaults. If the user expresses a different preference at any point, adapt accordingly — don't fight them on it.

| Setting | Default | Override when... |
|---|---|---|
| **Tone** | Conversational but clear — reads like a smart teammate explaining things | User asks for formal, minimal, or a different voice |
| **Interaction style** | Heavy use of AskUserQuestion with guided options | User prefers freeform chat or finds the questions annoying |
| **Feedback style** | Freeform comments + direct file edits | User prefers numbered shorthand or another format |
| **Output format** | Markdown (.md) | User requests .docx, Notion, or another format |
| **File naming** | kebab-case descriptive (e.g., `auth-migration-spec.md`) | User specifies a different convention |
| **Brainstorm volume** | 10-15 options per section | User wants fewer or more |
| **Probing depth** | Thorough — 10+ clarifying questions | User signals they want less probing |
| **Section ordering** | Hardest/most-unknown section first | User prefers top-to-bottom or wants to choose |
| **Visuals** | Proactively suggest diagrams/tables when useful | User says "only if I ask" |
| **Gaps/issues** | Surface immediately via AskUserQuestion | User prefers collecting them for later |
| **Connected tools** | Proactively search when projects/entities are mentioned | User says to only search on explicit request |
| **Default sections** | None — doc type dictates structure | User wants recurring sections like TL;DR or audience note |
| **Doc length** | Depends on the doc — ask each time | User states a preference |
| **Reader testing persona** | Match the actual target audience | User wants a generic reader or specific persona |
| **Direct file edits** | If the doc changes between turns, assume the user edited it directly — read the file, detect changes, and adapt silently | N/A |

## When to Offer This Workflow

**Trigger conditions:**
- User mentions writing documentation: "write a doc", "draft a proposal", "create a spec", "write up"
- User mentions specific doc types: "PRD", "design doc", "decision doc", "RFC", "postmortem", "ADR"
- User seems to be starting a substantial writing task

**Initial offer:**
Use AskUserQuestion to present the 3-stage approach:

1. **Context Gathering** — User provides all relevant context; thorough clarifying questions follow
2. **Refinement & Structure** — Build each section through brainstorming, curation, and iterative editing
3. **Reader Testing** — Test with a fresh Claude sub-agent simulating the actual target audience

Ask if they want the full workflow or prefer to work freeform.

If user declines, work freeform. If user accepts, proceed to Stage 1.

## Stage 1: Context Gathering

**Goal:** Close the gap between what the user knows and what Claude knows, enabling smart guidance later.

### Initial Questions

Use AskUserQuestion to gather meta-context. Ask these as structured questions with options where applicable:

1. **Doc type** — Present common types (technical spec, decision doc, proposal, RFC, postmortem, ADR, project brief) and let user pick or specify.
2. **Primary audience** — Ask who will read this. The audience should be written into the document's intro so readers can self-select whether this doc is for them.
3. **Desired impact** — What should someone walk away thinking/knowing/doing after reading this?
4. **Template or format** — Does this follow an existing template? If user provides one, read it.
5. **Constraints** — Timeline, length preferences, organizational context.

Inform them they can answer in shorthand, dump notes, paste links, or point to channels/threads — whatever's fastest.

**If user provides a template or mentions a doc type:**
- Ask if they have a template document to share
- If they provide a link, use the appropriate integration to fetch it
- If they provide a file, read it

**If user mentions editing an existing document:**
- Use the appropriate integration to read the current state
- Check for images without alt-text
- If images exist without alt-text, explain that when others use Claude to understand the doc, Claude won't see them. Ask if they want alt-text generated.

### Proactive Tool Search

As soon as the user mentions a project name, team, or entity:
- Search connected tools (Linear, Notion, Figma, Slack, etc.) for related context
- Surface what's found without asking permission
- Let the user confirm what's relevant

If no integrations are detected, suggest they can enable connectors in their Claude settings to pull context directly from messaging apps and document storage.

### Info Dumping

Encourage the user to dump all context they have. Accept any format — stream-of-consciousness, bullet points, links to tools, file uploads. Request information about:

- Background on the project/problem
- Related team discussions or documents
- Why alternatives were rejected
- Organizational context (team dynamics, past incidents, politics)
- Timeline pressures or constraints
- Technical architecture or dependencies
- Stakeholder concerns

### Thorough Clarifying Questions

After the user's initial dump, generate **10+ clarifying questions** using AskUserQuestion (adjustable if user wants less probing). Dig into:

- Edge cases and failure modes
- Trade-offs between approaches
- Assumptions that might not be shared by the audience
- Political or organizational sensitivities
- Dependencies and risks
- Things the user might consider obvious but readers won't know

Use multiple rounds of AskUserQuestion if needed. Keep going until the questions demonstrate deep understanding — when edge cases and trade-offs can be explored without needing basics explained.

**Exit condition:**
Use AskUserQuestion to ask if there's more context to provide or if it's time to start drafting.

## Stage 2: Refinement & Structure

**Goal:** Build the document section by section through brainstorming, curation, and iterative refinement.

### Setting Up Structure

If the document structure is clear from the doc type and context:
- Suggest 3-7 sections appropriate for the doc type using AskUserQuestion
- Let user confirm, rearrange, add, or remove sections

If user doesn't know what sections they need:
- Propose a structure based on doc type and context
- Use AskUserQuestion to let them adjust

No recurring sections are forced by default — let the doc type dictate the structure. However, if the doc would benefit from an audience/intent note or summary, suggest it as an option.

### Section Ordering

Default: start with whichever section has the most unknowns. For decision docs, that's usually the core proposal. For specs, the technical approach. Summary/intro sections are best left for last since they synthesize everything else.

Use AskUserQuestion to confirm which section to tackle first, with a recommendation and reasoning.

### Create the Scaffold

Create a markdown file with kebab-case naming (or user's preferred convention):
- All section headers with `[To be written]` placeholders
- Share the file link with the user

### For Each Section

#### Step 1: Clarifying Questions

Use AskUserQuestion to ask 5-8 specific questions about what should be included in this section. Tailor questions to the section's purpose and gathered context.

#### Step 2: Brainstorming

Brainstorm **10-15 numbered points** (default, adjustable) that could be included in the section. Look for:
- Context the user shared that might have been forgotten
- Angles or considerations not yet mentioned
- Things the audience would expect to see here

Present these in conversation (not in the document). Offer to brainstorm more if needed.

#### Step 3: Curation

Use AskUserQuestion to let user select which points to include. Present the top options as structured choices where possible. Also accept freeform feedback — "I like most of it but...", "yeah, all of that except 6 and 9", or numbered shorthand like "Keep 1,4,7."

Parse whatever format the user gives and proceed.

#### Step 4: Gap Check

Use AskUserQuestion: "Anything important missing for this section, or good to draft?"

#### Step 5: Drafting

Use `Edit` (str_replace) to replace the placeholder with drafted content. Write in the default conversational-but-clear tone unless the user has indicated otherwise.

After drafting, share the file link and ask the user to read through it.

**On the first section, note:** The user can give freeform feedback in chat ("make the third paragraph more concise") or edit the file directly. Both work — Claude will detect direct edits and adapt.

#### Step 6: Iterative Refinement

As user provides feedback (freeform comments or direct file edits):
- Use `Edit` to make surgical changes — never rewrite the whole doc
- If the user edited the file directly, read it, detect the changes, and continue from the new state silently
- Confirm edits are complete after each round

**Continue iterating** until the user is satisfied with the section.

#### Visuals

Throughout drafting, proactively suggest visuals when they'd clarify something:
- **Mermaid diagrams** for architecture, flows, state machines, sequences
- **Tables** for comparisons, matrices, feature lists
- **Code snippets** for API examples, config samples, interface definitions

Present suggestions via AskUserQuestion with a description of what the visual would show.

#### Quality Check

After 3 iterations with no substantial changes, use AskUserQuestion to ask if anything can be removed without losing important information.

When the section is done, use AskUserQuestion to confirm and move to the next section.

**Repeat for all sections.**

### Near Completion

At 80%+ sections done, re-read the entire document and check for:
- Flow and consistency across sections
- Redundancy or contradictions
- Generic filler that doesn't carry weight
- Whether every sentence earns its place

Provide feedback and suggestions.

**When all sections are drafted and refined:**
Do a final coherence review. Use AskUserQuestion to ask if the user is ready for Reader Testing or wants to refine more.

## Stage 3: Reader Testing

**Goal:** Test the document with a fresh Claude sub-agent that simulates the actual target audience, catching blind spots the authors can't see.

### Audience-Matched Testing

The reader persona must match the actual audience defined in Stage 1. If the audience is "senior engineers on the platform team," prompt the sub-agent as a senior platform engineer. If it's "product and engineering leadership," prompt accordingly.

Use AskUserQuestion to confirm the reader persona before testing.

### Step 1: Predict Reader Questions

Generate 5-10 questions that the target audience would realistically ask:
- Questions to decide if they should read this doc
- Questions they'd ask while reading
- Questions they'd ask after reading
- Search queries that should lead them to this doc

Present these to the user via AskUserQuestion for confirmation or additions.

### Step 2: Test with Sub-Agent

**If access to sub-agents is available (e.g., in Cowork mode or Claude Code):**

For each question, invoke a sub-agent with:
- The document content only (no conversation context)
- A persona prompt matching the target audience
- The question to answer

Summarize what Reader Claude got right and wrong for each question.

**If no access to sub-agents (e.g., claude.ai web):**

Provide instructions for manual testing:
1. Open a fresh Claude conversation: https://claude.ai
2. Paste or share the document content
3. Ask Reader Claude the generated questions
4. For each, have Reader Claude report: the answer, anything ambiguous, and what knowledge the doc assumes

### Step 3: Additional Checks

Run (or instruct the user to run) these checks with a fresh reader:
- "What in this doc might be ambiguous or unclear to readers?"
- "What knowledge or context does this doc assume readers already have?"
- "Are there any internal contradictions or inconsistencies?"

Summarize any issues found.

### Step 4: Report and Fix

If issues are found:
- Present specific problems using AskUserQuestion, with options to fix or dismiss each
- For issues the user wants fixed, loop back to refinement for those sections
- Re-test after fixes

### Exit Condition

When Reader Claude consistently answers questions correctly and doesn't surface new gaps or ambiguities, the doc is ready.

## Final Review

When Reader Testing passes:

1. Recommend the user does a final read-through — they own this doc and are responsible for its quality
2. Suggest double-checking facts, links, and technical details
3. Use AskUserQuestion to verify it achieves the impact they wanted

Use AskUserQuestion for final disposition: done, one more review pass, or specific tweaks.

**When complete:**
Provide the final file link. Keep closing remarks brief — the user can read the doc themselves. Optionally suggest:
- Linking the conversation in an appendix so readers can see how the doc was developed
- Using appendices to provide depth without bloating the main doc
- Updating the doc as feedback is received from real readers

## Operating Rules

- Use `Edit` for all document changes — never rewrite the whole file
- Never use the document file for brainstorming — that's conversation
- Detect and adapt to direct file edits silently
- If user wants to skip a stage, confirm and adapt — don't fight them
- If user expresses different preferences from the defaults, adapt immediately and carry forward
