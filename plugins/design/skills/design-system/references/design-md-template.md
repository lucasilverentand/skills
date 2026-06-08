# DESIGN.md Template
Use this shape when creating or refreshing `DESIGN.md`. Keep sections concise, but do not collapse away decisions another agent needs to implement the system.

## Target product anchor
- **Product**:
- **Audience**:
- **Primary workflows**:
- **Core objects**:
- **Must stay recognizable**:
- **Must not become**:

## Source inventory
|Source|Type|Role|What it contributes|
|---|---|---|---|
|...|...|target, inspiration, constraint, anti-reference|...|

## Inspiration analysis
Summarize what the references share. Focus on mechanics rather than taste adjectives.

### Transferable principles
- ...

### Adaptable ideas
- ...

### Rejected borrowings
- ...

## Design thesis
One paragraph describing the system the product should follow. This should explain how many small rules create one coherent product feel.

## Core principles
List 3-6 principles. Each principle needs a rationale and a practical implication.

|Principle|Rationale|Practical implication|
|---|---|---|
|...|...|...|

## Visual grammar
Define the recurring forms of the interface:

- Shape language:
- Surface model:
- Depth and separation:
- Icon and symbol style:
- Image or media treatment:
- Density:

## Layout rhythm
- Grid and alignment:
- Spacing scale:
- Page structure:
- Navigation structure:
- Panel and sidebar behavior:
- Empty and loading layouts:

## Color and material system
- Base surfaces:
- Text colors:
- Accent behavior:
- Borders and dividers:
- Elevation or shadow:
- Selection and focus:
- Error, warning, success:

Use ranges or token names when exact values are unknown. Avoid decorative color unless it carries hierarchy, state, or meaning.

## Typography
- Font family:
- Type scale:
- Heading behavior:
- Body and metadata behavior:
- Numeric or tabular text:
- Line length and wrapping:

## Components
Define components as system rules, not a full component library unless the app needs one.

|Component|Purpose|Rules|States|
|---|---|---|---|
|Primary action|...|...|default, hover, pressed, disabled, loading|
|...|...|...|...|

## Interaction states
- Hover:
- Pressed:
- Selected:
- Focus:
- Disabled:
- Loading:
- Empty:
- Error:
- Success:

## Motion
- Motion purpose:
- Duration ranges:
- Easing:
- Choreography:
- What should not animate:

## Content voice
- Labels:
- Empty states:
- Error messages:
- Confirmation copy:
- Tone boundaries:

## Responsive and accessibility rules
- Keyboard behavior:
- Touch targets:
- Contrast:
- Reduced motion:
- Screen reader naming:
- Small-screen layout:
- Large-screen layout:

## Implementation guardrails
- Reuse existing product concepts and navigation unless explicitly changed.
- Keep inspiration domain-specific metaphors out of the target app.
- Introduce tokens before one-off styles.
- Keep repeated controls visually stable across screens.
- Prefer native platform behavior where it helps the product feel expected.

## Detail checklist
Use this before implementing or reviewing UI:

- [ ] Do the tiny details reinforce the same system?
- [ ] Are primary actions clear without relying only on color?
- [ ] Are spacing and density consistent across repeated structures?
- [ ] Do empty, loading, and error states use the same voice and visual grammar?
- [ ] Does motion clarify continuity instead of decorating the interface?
- [ ] Does each borrowed idea still serve the target app's job?

## Open questions
|Question|Why it matters|Owner|
|---|---|---|
|...|...|...|
