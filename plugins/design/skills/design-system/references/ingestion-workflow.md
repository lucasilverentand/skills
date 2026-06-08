# Ingestion Workflow
Use this workflow to turn raw inspiration into target-aware design-system evidence.

## Source inventory
Start with a compact inventory:

|Source|Type|Role|Confidence|Notes|
|---|---|---|---|---|
|`path`, URL, or attachment label|chat, image, video, URL, folder|target product, inspiration, constraint, anti-reference|high, medium, low|What it contributes|

Mark which inputs describe the target product and which are only inspiration. If no source describes the target product, inspect the repo or ask for the app purpose before final synthesis.

## Chat briefs
- Extract the user's stated product, audience, workflow, tone, constraints, and disliked directions.
- Preserve strong phrases from the user as intent anchors, but turn them into implementable rules.
- Flag vague words such as "premium", "playful", or "simple" until they are backed by concrete visual or interaction behavior.

## Images and screenshots
Inspect each image for reusable mechanics:

- Composition: density, alignment, grouping, whitespace, focal areas.
- Hierarchy: what earns size, contrast, placement, or persistent visibility.
- Material: surface depth, borders, shadows, translucency, texture, separation.
- Components: controls, cards, lists, toolbars, panels, modals, empty states.
- State: selected, hover, pressed, disabled, loading, error, success.
- Content: copy length, labels, metadata, icon/text balance.
- Platform conventions: native controls, navigation, pointer or touch affordances.

Then classify each observation:

|Class|Meaning|Example|
|---|---|---|
|Transferable|Can apply directly as design-system logic.|Quiet hierarchy where metadata recedes before actions.|
|Adaptable|Useful idea, but the component or domain needs reshaping.|A contacts list rhythm becomes a photo asset browser rhythm.|
|Rejected|Would distort the target product identity.|Contacts-first navigation in a photo editor.|

Do not let a reference app donate its data model, core navigation, or product metaphor unless the target app actually shares that job.

## Local folders
- List the files first so the analysis has a clear source trail.
- Group visually similar images instead of analyzing every duplicate at full depth.
- Sample enough examples to catch repeated rules and exceptions.
- Note outliers separately; do not let one striking image override the system.

## URLs and live pages
- Use URLs to inspect interaction, responsive behavior, and details missing from still screenshots.
- Treat live pages as supporting evidence when the user supplied screenshots or a moodboard.
- Avoid copying site content, brand assets, or information architecture unless the user says the URL is the target app.
- Capture source-specific constraints, such as responsive breakpoints, hover behavior, or motion, as observations before translating them.

## Videos
- Sample representative frames: opening state, main action, transition midpoint, completed state, edge or error state if visible.
- Capture temporal behavior separately from static style:
  - Pacing and duration.
  - Easing and choreography.
  - Object continuity between states.
  - Gesture or pointer relationship.
  - What changes instantly versus what animates.
- Translate motion into rules, not one-off animation notes. For example: "Panels settle with short deceleration after content appears" is better than "use a nice slide animation."

## Mixed inputs
When sources conflict, prioritize in this order:

1. Target app purpose and core workflows.
2. Existing product constraints and platform conventions.
3. User-stated direction.
4. Repeated patterns across inspiration sources.
5. Single-source details.

Record rejected conflicts in `DESIGN.md` so future agents do not reintroduce them.
