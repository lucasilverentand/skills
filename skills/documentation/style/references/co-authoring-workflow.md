# Co-Authoring Workflow

A structured 3-stage workflow for co-authoring substantial documents. Use this when the document requires significant user input and iterative refinement — specs, proposals, decision docs, research reports, or any doc that benefits from collaborative development.

For quick documents (status updates, changelogs, READMEs), skip this workflow and write directly. The relevant specialized skill determines the structure and template.

## When to Use

- The document requires user knowledge that isn't in the codebase
- Multiple sections need user input and iteration
- The audience and impact warrant a thorough process
- The user asks to "write a doc", "draft a proposal", or any substantial writing task

## Overview

1. **Context Gathering** — close the knowledge gap between user and Claude
2. **Refinement & Structure** — build each section through brainstorming, curation, and iterative editing
3. **Reader Testing** — test with a fresh Claude sub-agent simulating the target audience

Offer the workflow via AskUserQuestion. If the user declines, work freeform.

## Stage 1: Context Gathering

**Goal:** Close the gap between what the user knows and what Claude knows.

### Initial Questions

Use AskUserQuestion to gather:

1. **Doc type** — what kind of document? The relevant specialized skill determines the template and structure
2. **Primary audience** — who reads this? Write the audience into the doc's intro so readers can self-select
3. **Desired impact** — what should someone walk away thinking/knowing/doing?
4. **Template or format** — does this follow an existing template? If provided, read it
5. **Constraints** — timeline, length preferences, organizational context

Inform them they can answer in shorthand, dump notes, paste links, or point to channels/threads.

### Proactive Tool Search

When the user mentions a project name, team, or entity:
- Search connected tools (Linear, Notion, Figma, Slack, etc.) for related context
- Surface findings without asking permission
- Let the user confirm what's relevant

### Info Dumping

Encourage the user to dump all context they have. Accept any format — stream-of-consciousness, bullet points, links, file uploads. Request information about:

- Background on the project/problem
- Related discussions or documents
- Why alternatives were rejected
- Organizational context (team dynamics, past incidents)
- Timeline pressures or constraints
- Technical architecture or dependencies
- Stakeholder concerns

### Clarifying Questions

After the user's initial dump, generate **10+ clarifying questions** via AskUserQuestion. Dig into:

- Edge cases and failure modes
- Trade-offs between approaches
- Assumptions the audience might not share
- Political or organizational sensitivities
- Dependencies and risks
- Things the user considers obvious but readers won't know

Keep going until questions demonstrate deep understanding — when edge cases and trade-offs can be explored without needing basics explained.

**Exit condition:** Ask if there's more context to provide or if it's time to start drafting.

## Stage 2: Refinement & Structure

**Goal:** Build the document section by section through brainstorming, curation, and iterative refinement.

### Setting Up Structure

Use the relevant specialized skill to determine the appropriate sections for the doc type. Then:
- Suggest 3-7 sections using AskUserQuestion
- Let the user confirm, rearrange, add, or remove

### Section Ordering

Default: start with whichever section has the most unknowns. Summary/intro sections come last since they synthesize everything else.

Confirm which section to tackle first via AskUserQuestion, with a recommendation and reasoning.

### Create the Scaffold

Create a markdown file with kebab-case naming:
- All section headers with `[To be written]` placeholders
- Share the file link with the user

### For Each Section

#### Step 1: Clarifying Questions
Ask 5-8 specific questions about what should be included, tailored to the section's purpose.

#### Step 2: Brainstorming
Brainstorm **10-15 numbered points** that could be included. Look for:
- Context the user shared that might have been forgotten
- Angles or considerations not yet mentioned
- Things the audience would expect to see

Present in conversation, not in the document.

#### Step 3: Curation
Use AskUserQuestion to let the user select which points to include. Accept any format: "Keep 1,4,7", freeform feedback, or structured choices.

#### Step 4: Gap Check
AskUserQuestion: "Anything important missing for this section, or good to draft?"

#### Step 5: Drafting
Use `Edit` to replace the placeholder with drafted content. Write in the voice described in `voice-and-tone.md` unless the user has indicated otherwise.

Share the file link and ask the user to read through it. Note: the user can give freeform feedback in chat or edit the file directly — both work.

#### Step 6: Iterative Refinement
- Use `Edit` for surgical changes — never rewrite the whole doc
- Detect and adapt to direct file edits silently
- Confirm edits are complete after each round

#### Visuals
Proactively suggest visuals when they'd clarify something:
- **Mermaid diagrams** for architecture, flows, state machines, sequences
- **Tables** for comparisons, matrices, feature lists
- **Code snippets** for API examples, config samples

#### Quality Check
After 3 iterations with no substantial changes, ask if anything can be removed without losing important information.

**Repeat for all sections.**

### Near Completion

At 80%+ sections done, re-read the entire document and check for:
- Flow and consistency across sections
- Redundancy or contradictions
- Generic filler that doesn't carry weight

Do a final coherence review. Ask if the user is ready for Reader Testing.

## Stage 3: Reader Testing

**Goal:** Test the document with a fresh Claude sub-agent simulating the target audience, catching blind spots the authors can't see.

### Setup

Confirm the reader persona via AskUserQuestion. The persona must match the actual audience from Stage 1.

### Step 1: Predict Reader Questions

Generate 5-10 questions the target audience would realistically ask:
- Questions to decide if they should read this doc
- Questions they'd ask while reading
- Questions they'd ask after reading
- Search queries that should lead to this doc

Present for confirmation via AskUserQuestion.

### Step 2: Test with Sub-Agent

**If sub-agents are available (Claude Code, Cowork mode):**
For each question, invoke a sub-agent with:
- The document content only (no conversation context)
- A persona prompt matching the target audience
- The question to answer

Summarize what Reader Claude got right and wrong.

**If no sub-agents (claude.ai web):**
Provide instructions for manual testing:
1. Open a fresh Claude conversation
2. Paste or share the document content
3. Ask Reader Claude the generated questions
4. For each, have Reader Claude report: the answer, anything ambiguous, and assumed knowledge

### Step 3: Additional Checks

Run these checks with a fresh reader:
- "What in this doc might be ambiguous or unclear?"
- "What knowledge or context does this doc assume?"
- "Are there any internal contradictions?"

### Step 4: Report and Fix

Present specific issues via AskUserQuestion, with options to fix or dismiss each. Loop back to refinement for fixes, re-test after.

### Exit Condition

When Reader Claude consistently answers questions correctly and doesn't surface new gaps.

## Final Review

1. Recommend a final user read-through — they own the doc
2. Suggest double-checking facts, links, and technical details
3. Verify it achieves the intended impact

Provide the final file link. Optionally suggest appendices for depth without bloating the main doc.

## Tips

- If the user wants to skip a stage, confirm and adapt
- If the user seems frustrated, suggest ways to move faster
- Use `Edit` for all document changes — never rewrite the whole file
- Share file links after every change
- Never use the document file for brainstorming — that's conversation
