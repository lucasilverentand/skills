# 10. Color
Color is both visual identity and functional communication.

## 10.1 Define color roles
A complete functional model often includes:

### Surfaces
- Canvas
- default surface
- raised surface
- sunken surface
- inverse surface
- selected surface
- disabled surface
- scrim or overlay

### Text
- Default
- muted
- subtle
- inverse
- link
- disabled
- critical
- success
- warning
- informational

### Borders
- Subtle
- default
- strong
- focus
- selected
- critical
- disabled

### Actions
- Primary
- secondary
- neutral
- destructive
- inverse

Each may require default, hover, active, selected, and disabled states.

## 10.2 Build palettes from roles backward
Do not begin by making ten hues at eleven stops each unless the system truly needs that range.

Start with required roles:

- Text contrast
- surface hierarchy
- interactive states
- status communication
- data visualization
- dark mode
- brand expression

Then construct palettes that can support them.

## 10.3 Contrast and non-color cues
For every color-coded meaning:

- Provide sufficient contrast.
- Add text, shape, icon, position, or pattern where needed.
- Ensure focus is visible.
- test disabled states carefully.
- test text over imagery.
- test charts for color-vision differences.
- verify themes independently.

Do not use color alone to communicate errors, selection, or status.

## 10.4 Dark mode
Dark mode is not palette inversion.

Review:

- Surface hierarchy
- glare and contrast
- saturated color intensity
- border visibility
- shadows and elevation
- image treatment
- charts
- code blocks
- focus rings
- disabled states
- form autofill
- native controls
- browser UI integration

Dark themes often need lighter borders, reduced saturation, and different elevation cues.

## 10.5 High-contrast modes
If a high-contrast theme is supported:

- Increase essential boundaries.
- avoid low-opacity text.
- reduce reliance on subtle shadow.
- keep focus unmistakable.
- preserve selected and disabled distinctions.
- ensure icons and glyphs remain visible.
- test with operating-system contrast settings where relevant.

## 10.6 Color documentation
For each semantic token, document:

- Meaning
- examples
- allowed backgrounds
- contrast expectations
- state behavior
- theme values
- forbidden uses
- replacement guidance

Example:

```md
### `color.text.muted`

Use for secondary explanatory text that remains useful but is not the primary reading target.

Do:
- Use for timestamps, metadata, or supporting labels.
- Keep it readable at small sizes.

Do not:
- Use for placeholder text when the placeholder carries required information.
- Use for disabled text unless paired with the disabled semantic role.
```

---

# 11. Typography
Typography carries hierarchy, rhythm, brand personality, and reading comfort.

## 11.1 Define typographic roles
A role-based system may include:

- Display
- page title
- section heading
- subsection heading
- body
- compact body
- label
- caption
- code
- numeric or tabular
- quote
- navigation
- button
- overline or eyebrow

Each role should define:

- Font family
- weight
- size
- line height
- letter spacing
- text transform
- responsive behavior
- intended usage
- maximum line length where relevant

## 11.2 Separate style names from HTML elements
A visual role is not always the same as semantic markup.

A page title may look like `heading-xl` but still needs an appropriate heading element based on document structure. Document both concerns:

```txt
Visual style: heading-xl
Semantic element: h1–h6 based on hierarchy
```

Do not choose heading elements by appearance.

## 11.3 Type scale design
Choose a scale based on:

- Reading distance
- viewport range
- product density
- content type
- brand expression
- font metrics
- localization
- accessibility
- display technology

Test the scale using real content. A mathematically clean scale may produce poor hierarchy with the chosen typeface.

## 11.4 Fluid typography
Fluid type can reduce breakpoint jumps.

Example:

```css
:root {
  --font-size-heading-xl: clamp(2rem, 1.35rem + 2.4vw, 4.5rem);
}
```

Use fluid sizing carefully for dense applications, where predictable alignment may matter more than continuous scaling.

## 11.5 Font loading and fallbacks
Define:

- Primary and fallback stacks
- variable font axes
- font-display behavior
- preload policy
- subset strategy
- script coverage
- metric-compatible fallbacks
- synthetic bold and italic policy
- offline or native behavior

Poor fallback metrics can cause layout shift and broken truncation.

## 11.6 Internationalization
Test:

- Accented Latin text
- long Germanic compounds
- scripts with taller glyphs
- Arabic and Hebrew directionality
- CJK line breaking
- font-weight availability
- mixed-script text
- numerals and currencies
- date and time formats
- uppercase transformations
- truncation behavior

Do not assume a line-height tuned for one language will work everywhere.

## 11.7 Numeric typography
For finance, analytics, tables, and dashboards, define:

- Tabular numerals
- decimal alignment
- sign placement
- percentage formatting
- units
- thousands separators
- negative values
- uncertainty and ranges
- monospace requirements where relevant

---

# 12. Spacing, sizing, and layout
Spatial rules turn isolated components into coherent compositions.

## 12.1 Spacing scale
A scale can be linear, modular, or hybrid.

Example hybrid scale:

```txt
0
1 = 0.125rem
2 = 0.25rem
3 = 0.5rem
4 = 0.75rem
5 = 1rem
6 = 1.5rem
7 = 2rem
8 = 3rem
9 = 4rem
10 = 6rem
```

Smaller increments help internal component spacing. Larger jumps help layout composition.

## 12.2 Semantic spacing
Use semantic aliases where repeated layout meaning exists.

```txt
space.control.inline
space.control.block
space.card.padding
space.section.gap
space.page.gutter
space.field.gap
space.stack.compact
space.stack.default
space.stack.loose
```

Do not create semantic aliases for every possible margin. Favor composition utilities and layout primitives.

## 12.3 Layout primitives
Useful primitives include:

- Stack
- Inline
- Cluster
- Grid
- Sidebar
- Center
- Container
- Split
- Frame or aspect ratio
- Scroll area
- Bleed
- Visually hidden

Example conceptual API:

```tsx
<Stack gap="space-500">
  <Heading>Account</Heading>
  <Inline gap="space-300" align="center">
    <Avatar />
    <Text>User name</Text>
  </Inline>
</Stack>
```

Layout primitives reduce ad hoc margin logic and make spacing explicit.

## 12.4 Containers
Define:

- Full-bleed behavior
- default content width
- reading width
- wide application width
- page gutters
- nested container rules
- safe-area handling
- edge-to-edge media behavior

Example:

```css
.container {
  width: min(
    100% - (2 * var(--space-page-gutter)),
    var(--size-container-default)
  );
  margin-inline: auto;
}
```

## 12.5 Grid system
A grid may define:

- Column count
- gutter
- outer margin
- maximum width
- minimum column width
- responsive collapse
- subgrid policy
- editorial versus application variants

Use grid guidance to support composition, not to force every component onto page columns.

## 12.6 Density
If the system supports density modes, define which values change.

Possible density-sensitive tokens:

- Control height
- row height
- component padding
- icon size
- inter-item gap
- table cell padding

Usually do not scale typography and target size down indiscriminately. Compact layouts must remain usable.

## 12.7 Target sizes
Define minimum interactive target dimensions separately from visible icon or label size. A small icon can sit inside a larger interactive area.

## 12.8 Responsive component behavior
For each component, document:

- Minimum and maximum widths
- wrapping
- truncation
- horizontal scrolling
- stacking
- content priority
- touch behavior
- layout switching
- container-query behavior, if used
- fixed versus intrinsic sizing

A component that only looks correct at one artboard width is not complete.

---

# 13. Shape, borders, elevation, and depth
These foundations establish grouping, hierarchy, and brand tone.

## 13.1 Shape
Define radius roles rather than only raw values.

```txt
radius.none
radius.control
radius.container
radius.overlay
radius.pill
radius.circle
```

A brand may use sharp, soft, or mixed geometry. Document where each geometry belongs.

## 13.2 Borders
Define:

- Widths
- styles
- semantic colors
- focus treatment
- selected treatment
- dividers
- high-contrast substitutions

Borders often perform better than shadows for dense interfaces and high-contrast modes.

## 13.3 Elevation
Elevation may use:

- Shadows
- borders
- surface color
- blur
- scale
- overlap
- spatial offset

Create semantic levels such as:

```txt
elevation.base
elevation.raised
elevation.popover
elevation.modal
elevation.toast
```

Avoid mapping elevation directly to arbitrary numbers unless the ordering itself matters.

## 13.4 Stacking context
Create a layering strategy.

```txt
base
sticky
dropdown
popover
overlay
modal
toast
critical-system-layer
```

Prefer local stacking contexts over a single global z-index scale where possible. Document portal behavior and nested overlay rules.

## 13.5 Scrims and backdrops
Specify:

- Opacity
- color
- blur
- click behavior
- scroll locking
- reduced-transparency alternatives
- nested overlay behavior

---

# 14. Motion and transition
Motion should clarify change, spatial relationships, and feedback.

## 14.1 Motion roles
Define motion by purpose:

- Enter
- exit
- move
- emphasize
- expand
- collapse
- reorder
- load
- confirm
- warn
- ambient brand motion

## 14.2 Motion tokens
```txt
motion.duration.instant
motion.duration.fast
motion.duration.standard
motion.duration.slow

motion.easing.enter
motion.easing.exit
motion.easing.move
motion.easing.emphasize
```

Use different easing for entrance, exit, and spatial movement when appropriate.

## 14.3 Motion principles
- Keep direct manipulation responsive.
- Use motion to explain cause and effect.
- Make exits slightly faster than entrances when the content is no longer needed.
- Avoid animating large areas without purpose.
- Do not delay access to essential content for decorative animation.
- Keep repeated interactions restrained.
- Preserve spatial continuity when elements move.
- Provide reduced-motion behavior.

## 14.4 Reduced motion
Reduced motion does not always mean no motion. Replace:

- Large translation with fade
- parallax with static positioning
- zoom with instant change
- looping animation with a still state
- auto-advancing content with manual control

Essential progress or state feedback may remain, but should avoid unnecessary vestibular effects.

## 14.5 Motion documentation
Show:

- Start and end state
- trigger
- duration
- easing
- interruption behavior
- reduced-motion alternative
- whether motion affects layout
- performance guidance

Use video examples or interactive demos where practical.

---

# 15. Icons, illustration, photography, and media
Visual assets require the same rigor as components.

## 15.1 Icon system
Define:

- Grid
- stroke or fill style
- optical size
- corner treatment
- default sizes
- alignment
- mirroring behavior
- directional icons
- naming
- accessibility labeling
- file format
- build pipeline
- custom icon contribution

Icon names should describe meaning, not visual shape alone.

Prefer:

```txt
download
calendar
warning
chevron-start
chevron-end
```

Avoid:

```txt
arrow-2
triangle-red
icon-final-new
```

## 15.2 Icon accessibility
- Decorative icons should be hidden from assistive technology.
- Meaningful icons need an accessible name, often supplied by surrounding text.
- Icon-only controls need labels.
- Do not rely on icons whose meaning is culturally ambiguous without text.
- Directional icons should adapt to writing direction where meaning requires it.

## 15.3 Illustration
Define:

- Purpose
- composition
- perspective
- line and shape language
- character representation
- color range
- texture
- background treatment
- cropping
- animation
- accessibility alternatives
- licensing and ownership

Create a distinction between:

- Informational illustration
- decorative illustration
- empty-state illustration
- onboarding illustration
- brand campaign artwork

## 15.4 Photography
Define:

- Subject matter
- framing
- lighting
- color grade
- authenticity
- representation
- environmental context
- cropping ratios
- focal-point behavior
- overlays
- text-on-image rules
- consent and licensing
- metadata and alt-text process

## 15.5 Video and audio
For video, define:

- Aspect ratios
- captions
- transcripts
- autoplay rules
- sound defaults
- poster frames
- controls
- compression
- reduced-motion considerations
- responsive crops

For sound, define:

- Functional versus decorative cues
- volume normalization
- repetition limits
- mute behavior
- alternatives for Deaf or hard-of-hearing users
- cultural and environmental appropriateness

## 15.6 Asset delivery
Establish:

- Source files
- export settings
- naming
- optimization
- CDN rules
- responsive formats
- dark-mode variants
- localization variants
- licensing metadata
- ownership
- retirement process

---
