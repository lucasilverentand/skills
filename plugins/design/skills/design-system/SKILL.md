---
name: design-system
description: Synthesizes build-ready design systems and DESIGN.md files from chat briefs, screenshots, moodboards, videos, URLs, live pages, or local image folders while preserving the target product identity. Use when the user asks to "make a design system from these screenshots", "turn this moodboard into DESIGN.md", "extract the design language from this video", "define the UX vibe and rules from these references", or create cohesive UI rules from visual inspiration.
---

# Design System
Use this skill to turn mixed inspiration into a target-product design system that another agent or engineer can build from.

The job is not to copy reference apps. Extract the underlying mechanics, then translate them through the product being designed.

## Decision tree
- What input did the user provide?
  - **Chat-only brief** -> extract product anchor, desired feel, constraints, and missing context from the conversation.
  - **Images, screenshots, or moodboard** -> read `references/ingestion-workflow.md`, inspect each image, and classify observed details as transferable, adaptable, or rejected.
  - **Video or animation capture** -> read `references/ingestion-workflow.md`, sample representative frames, and capture temporal behavior separately from static visual rules.
  - **URL or live page** -> inspect the page as supporting evidence; preserve screenshots or provided artifacts as the primary inspiration source when both exist.
  - **Local folder** -> inventory image and video files first, then sample enough artifacts to understand the repeated design grammar.
  - **Existing DESIGN.md** -> update it in place, preserve useful product-specific rules, and replace vague or copied-inspiration rules with target-aware system rules.

## Workflow
1. Establish the target-product anchor before synthesis:
   - App purpose and audience.
   - Core workflows and primary objects.
   - Existing UI, repo context, or platform conventions.
   - What must stay recognizable after the redesign.
2. Ingest the inputs using `references/ingestion-workflow.md`.
3. Separate reference observations into:
   - **Transferable**: spacing logic, material treatment, hierarchy, affordance style, state behavior, motion pacing, and tone.
   - **Adaptable**: component ideas that need reshaping around the target app's own objects and workflows.
   - **Rejected**: domain-specific layouts, metaphors, navigation, data models, branding, or content patterns that would pull the product into the inspiration app's identity.
4. Synthesize the core system:
   - Write the few governing principles first.
   - Derive visual grammar, layout rhythm, interaction rules, motion, content tone, and component behavior from those principles.
   - Include small details only when they reinforce the whole: corner logic, stroke weight, hover timing, focus treatment, shadow behavior, icon density, empty states, copy cadence, and transitions.
5. Write or update `DESIGN.md`.
   - Use the repo root unless the project already has an obvious design-doc convention.
   - Use `references/design-md-template.md` as the target structure.
6. Check each rule against the product-identity guardrail:
   - Does this make the original app feel more coherent?
   - Or does it pull the app toward the reference product's domain?

## Product-identity guardrail
Translate inspiration through the target app's job. A contacts app can inspire rhythm, hierarchy, density, list treatment, or tactile detail for a photo editor, but it must not make the photo editor behave like a contacts app.

If the target-product anchor is missing, inspect the repo or ask for the app's purpose before writing final design rules. Never finalize a `DESIGN.md` from references alone.

## Writing rules
- Prefer system language over mood language: "primary actions earn contrast through placement and weight before color" beats "clean and premium."
- Tie every detail back to a principle or workflow.
- Name what not to borrow from each reference.
- Make implementation constraints concrete enough for code review: token ranges, component states, responsive behavior, accessibility checks, and examples of acceptable variation.
- Preserve platform conventions unless the user explicitly wants a custom interaction model.
- Do not claim to imitate a specific designer. Capture design discipline and system logic instead.

## Output checklist
- [ ] `DESIGN.md` names the target product and what must stay recognizable.
- [ ] Inspiration is classified into transferable, adaptable, and rejected details.
- [ ] The design thesis can guide future screens without re-opening the moodboard.
- [ ] Component and interaction rules are product-specific, not copied from reference domains.
- [ ] Tiny details are connected to the whole system.
- [ ] Accessibility and responsive behavior are explicit.
- [ ] Open questions are clearly marked instead of hidden behind invented certainty.

## References
|Reference|Use|
|---|---|
|`references/ingestion-workflow.md`|How to analyze chat, images, folders, URLs, videos, and mixed inputs.|
|`references/design-md-template.md`|The structure to use when writing or updating `DESIGN.md`.|
