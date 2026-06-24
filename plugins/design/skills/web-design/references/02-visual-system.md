# Visual System
Source: Modern Functional Web Design Mega Handbook 2026.

# Part II — Building the visual system

## 7. Layout, grids, spacing, and density
A grid is a decision framework, not a visible cage.

### Layout primitives
Use a small set of primitives:

- full-bleed region;
- centered content container;
- narrow reading measure;
- split layout;
- auto-fit card grid;
- sidebar shell;
- cluster for inline items;
- stack for vertical rhythm;
- switcher that wraps based on available space;
- frame for media aspect ratio;
- cover for viewport-height composition.

These primitives reduce one-off CSS and make responsive behavior predictable.

### Container strategy
Define several max-widths by purpose:

```css
:root {
  --measure-reading: 68ch;
  --container-narrow: 48rem;
  --container-content: 72rem;
  --container-wide: 90rem;
}
```

Do not use a single width for every page. Long-form text, application tables, and cinematic media have different needs.

### Gutters
Use fluid gutters with a lower and upper bound:

```css
.page-shell {
  padding-inline: clamp(1rem, 3vw, 3rem);
}
```

This avoids abrupt breakpoint jumps.

### Grid choices
- Use **CSS Grid** for two-dimensional page and component layout.
- Use **Flexbox** for one-dimensional distribution and alignment.
- Use normal flow whenever it already solves the problem.
- Use absolute positioning for overlays and decoration, not primary content structure.
- Use **subgrid** when nested components need to align with parent tracks.
- Use **container queries** when a component should respond to its own available space.

### Spacing scales
A useful scale is intentionally limited. Example:

```text
0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
```

A strict mathematical scale is less important than semantic consistency.

Map raw values to roles:

```css
:root {
  --space-control-gap: 0.5rem;
  --space-card-padding: 1.25rem;
  --space-section: clamp(4rem, 9vw, 8rem);
  --space-page-gutter: clamp(1rem, 4vw, 4rem);
}
```

### Density modes
Consider compact, comfortable, and spacious density for products used in different contexts. Density changes should affect:

- row height;
- control height;
- card padding;
- typography;
- icon size;
- whitespace;
- amount of visible metadata.

Do not simply scale the whole interface.

### Card discipline
A card is appropriate when content:

- forms a meaningful unit;
- can move or repeat independently;
- has a clear boundary;
- benefits from a contained action area.

Avoid cards for every paragraph. Excessive containers create “box soup,” weaken hierarchy, and waste space.

### Responsive grid heuristic
A practical marketing grid:

- small: 4 conceptual columns;
- medium: 8 conceptual columns;
- large: 12 conceptual columns.

In CSS, the actual implementation can be more fluid. The conceptual grid helps design alignment.

### Intrinsic responsiveness
Prefer components that adapt without page-level breakpoint knowledge:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: clamp(1rem, 2vw, 2rem);
}
```

### Avoid breakpoint archaeology
Do not add a breakpoint for every device or visual glitch. First ask:

- Is a fixed width causing the problem?
- Should content wrap naturally?
- Can `min()`, `max()`, or `clamp()` solve it?
- Should the component use a container query?
- Is there too much content for the pattern?

---

## 8. Typography
Typography carries most of the interface. Spend design effort accordingly.

### Choose type by function
Evaluate a typeface for:

- body-text readability;
- character distinction;
- x-height;
- punctuation;
- numeral styles;
- language support;
- variable axes;
- loading cost;
- licensing;
- tone;
- behavior at small sizes;
- behavior at very large display sizes.

A fashionable display face can be paired with a conservative text face. Do not force one face to perform every role if it is weak in one.

### A practical type system
Define semantic roles, not page-specific sizes:

- display;
- page title;
- section title;
- subsection title;
- body large;
- body;
- body small;
- label;
- caption;
- code;
- numeric/data.

Example:

```css
:root {
  --step--2: clamp(0.75rem, 0.72rem + 0.12vw, 0.82rem);
  --step--1: clamp(0.875rem, 0.83rem + 0.18vw, 1rem);
  --step-0: clamp(1rem, 0.95rem + 0.24vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.12rem + 0.62vw, 1.6rem);
  --step-2: clamp(1.56rem, 1.32rem + 1.18vw, 2.25rem);
  --step-3: clamp(1.95rem, 1.52rem + 2.14vw, 3.2rem);
  --step-4: clamp(2.44rem, 1.68rem + 3.8vw, 4.8rem);
  --step-5: clamp(3.05rem, 1.83rem + 6.1vw, 7rem);
}
```

Use `rem` in fluid type formulas so user font preferences and zoom remain meaningful. Avoid viewport-only sizing.

### Reading measure
**Heuristic:** long-form body text often reads well around 45–90 characters per line, with roughly 60–75 as a useful center. Interface copy can be shorter; data tables may be wider.

Use `ch` as a starting point, then test the actual font:

```css
.prose {
  max-inline-size: 68ch;
}
```

### Line height
**Heuristic:** body copy typically needs around 1.45–1.7 line height depending on typeface, size, and line length. Display type can be tighter. Small text often needs more relative leading.

```css
body { line-height: 1.55; }
h1, h2, h3 { line-height: 1.05; }
```

WCAG requires text to remain usable when users increase line, paragraph, word, and letter spacing under its text-spacing criterion. Avoid clipping containers.

### Weight and contrast
Do not use ultra-light text for long reading or low-contrast “premium” aesthetics. Thin strokes deteriorate on lower-quality screens, under zoom, and for low-vision readers.

### Letter spacing
- Large display text may benefit from slight negative tracking.
- Uppercase labels usually need positive tracking.
- Body copy rarely benefits from aggressive tracking.
- Do not use all caps for paragraphs.
- Test accented characters and non-Latin scripts.

### Optical sizing and variable fonts
Variable fonts can reduce requests and expose axes such as weight, width, slant, and optical size. They can also be larger than a carefully subset static font. Measure the actual file.

Use optical sizing when supported by the font:

```css
body {
  font-optical-sizing: auto;
}
```

### Font loading
- Prefer system fonts when brand requirements allow.
- Self-host when it improves privacy and control.
- Subset by language and glyph coverage carefully.
- Preload only fonts needed immediately.
- Use `font-display` intentionally.
- Provide metrics-compatible fallbacks to reduce layout shift.
- Avoid loading many weights when a variable font or fewer styles suffice.

### Typographic hierarchy checklist
- Does the page title look different from a card title?
- Can metadata be distinguished without becoming illegible?
- Are links identifiable without relying only on color?
- Do numbers align where comparison matters?
- Are headings meaningful in document order?
- Does the system work with twice as much text?
- Does it survive localization?
- Are orphaned one-word lines in large headlines acceptable?
- Are code, quotations, captions, and annotations styled for their function?

### Expressive type
Large, unusual, or kinetic typography is effective when:

- the words themselves carry the brand;
- the display line is short;
- resizing does not obscure content;
- animation respects reduced-motion settings;
- a plain-text equivalent remains in the accessibility tree;
- performance remains acceptable.

Never turn essential text into an inaccessible image merely to preserve exact composition.

---

## 9. Color systems and themes
Color should carry meaning, hierarchy, and identity without becoming the only carrier of information.

### Build color by roles
Define semantic roles:

- canvas;
- surface;
- elevated surface;
- primary text;
- secondary text;
- subtle text;
- border;
- strong border;
- accent;
- accent-hover;
- accent-contrast;
- success;
- warning;
- danger;
- info;
- focus;
- selection;
- data-series colors.

Then map brand primitives to these roles. Components should consume roles, not raw palette values.

### Contrast requirements
**WCAG 2.2 standard:**

- normal text: at least **4.5:1** contrast;
- large text: at least **3:1**;
- essential non-text UI graphics and component boundaries: generally at least **3:1** against adjacent colors under the applicable criterion.

Large text is approximately 18pt regular or 14pt bold, commonly mapped near 24 CSS px and 18.5 CSS px, though font rendering matters.

Treat these as minimums, not aesthetic targets. Body text often benefits from higher contrast.

### Perceptual color spaces
Modern CSS supports perceptual color models such as OKLCH. They can make lightness and chroma adjustments more predictable than RGB/HSL.

```css
:root {
  --brand: oklch(62% 0.19 258);
  --brand-hover: oklch(56% 0.19 258);
  --brand-soft: color-mix(in oklch, var(--brand) 15%, white);
}
```

Always test contrast after mixing. Perceptual uniformity does not guarantee accessibility.

### Dark mode is a redesign, not an inversion
Dark themes need:

- controlled contrast;
- reduced glare;
- adjusted shadows and elevation;
- restrained saturation;
- corrected image treatment;
- visible borders;
- tested states;
- appropriate code and chart palettes.

Pure white on pure black can be harsh. Use near-black surfaces and slightly softened text where contrast still passes.

```css
:root {
  color-scheme: light dark;
  --canvas: light-dark(oklch(98% 0.01 260), oklch(18% 0.015 260));
  --text: light-dark(oklch(20% 0.02 260), oklch(94% 0.01 260));
}
```

Provide explicit user choice when theme preference matters, and store it. System preference is a useful default, not always the final decision.

### Color hierarchy
A coherent page often uses:

- one dominant neutral field;
- one primary text family;
- one signature accent;
- semantic colors only where needed;
- occasional secondary accent for illustration or data.

A full brand color system can still appear rich through tonal variation, imagery, and gradients rather than many unrelated hues.

### Gradients
Use gradients to:

- establish atmosphere;
- create depth;
- connect regions;
- visualize a spectrum;
- soften transitions.

Avoid placing critical text over unpredictable gradients unless a stable overlay guarantees contrast.

### Data color
For charts:

- choose palettes with distinct lightness as well as hue;
- do not rely on red/green alone;
- add labels, patterns, symbols, or line styles;
- keep semantic colors consistent;
- reserve saturated colors for meaningful emphasis;
- verify dark theme separately.

### Forced colors and high contrast
Test in forced-colors modes. Do not suppress system colors casually. Custom visuals may disappear or collapse; ensure focus, boundaries, icons, and selected states remain understandable.

---

## 10. Images, illustration, video, and art direction
Imagery can establish meaning faster than decoration, but it is often the largest performance cost on a page.

### Give every image a job
An image may:

- demonstrate a product;
- show a person, place, or outcome;
- provide evidence;
- create emotional context;
- explain a process;
- establish brand texture;
- support navigation.

Remove imagery that only fills a hole in the layout.

### Photography direction
Define:

- subject distance;
- camera perspective;
- lighting;
- color treatment;
- depth of field;
- movement;
- casting;
- environment;
- crop behavior;
- relation between subject and text.

A coherent photographic system is more distinctive than a collection of individually attractive stock images.

### Product imagery
For physical products, include:

- multiple angles;
- scale reference;
- close detail;
- context of use;
- color variants;
- zoom;
- video where motion matters;
- clear indication when imagery is illustrative or digitally rendered.

### Art direction across breakpoints
Responsive images are not only about file size. A wide desktop image may need a tighter mobile crop.

```html
<picture>
  <source
    media="(min-width: 60rem)"
    srcset="/img/hero-wide.avif 1x, /img/hero-wide@2x.avif 2x"
    type="image/avif">
  <source
    srcset="/img/hero-portrait.webp"
    type="image/webp">
  <img
    src="/img/hero-portrait.jpg"
    alt="A marine biologist examining coral samples"
    width="900"
    height="1200"
    fetchpriority="high">
</picture>
```

Set intrinsic dimensions to prevent layout shift.

### Image format strategy
- **AVIF/WebP:** photographic and complex imagery where supported and advantageous.
- **JPEG:** broad fallback for photographs.
- **PNG:** transparency or lossless raster detail when modern formats are unsuitable.
- **SVG:** logos, icons, diagrams, and scalable vector illustration.
- **Animated formats/video:** short loops, demonstrations, or atmosphere; consider video for better compression and control.

Compare real output. Format choice alone does not ensure a small file.

### Alternative text
Write alt text according to purpose:

- informative image: communicate the relevant information;
- functional image: describe the action or destination;
- decorative image: empty alt (`alt=""`) so it can be ignored;
- complex chart: concise alt plus nearby detailed data or description;
- repeated caption: avoid redundant wording.

Do not begin every alt with “Image of.” Screen readers already convey image semantics.

### Background images
Do not place essential content only in CSS backgrounds. Backgrounds may be disabled, cropped, or absent from accessibility semantics.

### Video
Provide:

- captions;
- transcript when useful;
- audio description or equivalent for essential visual information;
- visible controls;
- volume control;
- pause;
- poster image;
- no unexpected audio;
- restrained autoplay;
- reduced-data consideration.

Autoplaying silent background video should not be the only way to understand the proposition.

### Illustration systems
Define:

- perspective;
- stroke;
- corner treatment;
- palette;
- texture;
- human representation;
- level of abstraction;
- motion behavior;
- use cases.

A consistent illustration grammar allows many artists or generators to produce coherent work.

### Generative imagery
When using generated imagery:

- disclose it where trust or context requires;
- review anatomy, text, symbols, bias, and cultural representation;
- retain licensing and provenance records;
- avoid synthetic “customer” imagery that implies false evidence;
- art-direct outputs rather than accepting generic prompt aesthetics.

---

## 11. Iconography
Icons compress familiar ideas. They do not magically make unfamiliar ideas understandable.

### Use icons when
- the action is conventional;
- space is constrained;
- repeated scanning benefits;
- the icon supports a text label;
- status needs a compact cue.

### Use text when
- the meaning is domain-specific;
- the cost of misunderstanding is high;
- the audience is infrequent;
- several icons look similar;
- localization can be accommodated.

### Icon system decisions
Define:

- stroke or fill;
- optical size;
- grid;
- line cap and joins;
- corner character;
- default sizes;
- alignment box;
- color behavior;
- selected state;
- animation rules.

Icons of equal nominal dimensions often need optical correction.

### Accessibility
- Decorative icons: hide from assistive technology.
- Icon-only buttons: provide an accessible name.
- Status icon: include text or another redundant signal.
- SVG: ensure focus behavior and titles are handled intentionally.
- Do not put important text inside an SVG without an accessible equivalent.

### Common ambiguity
Icons such as star, heart, bookmark, flag, and pin can mean save, favorite, feature, rate, report, or location. Pair them with labels until the context is learned.

---

## 12. Shape, borders, shadows, texture, and depth
These properties establish the material character of a design.

### Corner radius
Use a limited radius system:

- small controls;
- standard cards;
- large panels;
- pill shape for tags or compact actions.

Do not use a pill shape for every rectangle. Shape should support grouping and affordance.

### Borders
Borders are useful for:

- separating dense content;
- defining controls;
- preserving hierarchy in high-contrast environments;
- reducing reliance on shadows.

Use subtle borders for surfaces and stronger borders for interactive or focused states. Ensure essential boundaries remain visible.

### Shadows
A shadow should communicate:

- elevation;
- overlap;
- focus;
- interaction;
- atmosphere.

Keep elevation levels few and consistent. A giant soft shadow on every card creates visual haze and rendering cost.

### Blur and glass
Glass effects can look refined when:

- the background has controlled contrast;
- text remains readable;
- the blur is not required for comprehension;
- fallback surfaces are defined;
- the number and area of backdrop filters are limited.

Avoid glassmorphism over busy images for long text or forms.

### Texture and grain
Subtle grain can counter sterile digital surfaces, unify imagery, and create a tactile identity. Apply it as a lightweight decorative layer, not a high-resolution full-page asset. Ensure it does not reduce text contrast.

### Depth cues
Depth can come from:

- overlap;
- scale;
- parallax;
- blur;
- light;
- shadow;
- color temperature;
- perspective;
- occlusion.

Choose one or two cues. Combining all of them often looks theatrical and harms clarity.

### Decorative pseudo-elements
Prefer CSS gradients, masks, and pseudo-elements for simple decoration. Keep them out of the accessibility tree and prevent them from intercepting pointer events.

---

## 13. Brand distinctiveness without visual chaos
Distinctiveness comes from a coherent combination, not constant novelty.

### Ownable ingredients
A brand system can be distinguished through:

- type pairing;
- signature color relationship;
- photographic point of view;
- illustration grammar;
- composition;
- motion behavior;
- icon shape;
- tone of voice;
- border and radius character;
- recurring motif;
- sound, in appropriate contexts.

Choose two or three ingredients to emphasize.

### The signature-device rule
A page should generally have one dominant signature device, such as:

- oversized editorial type;
- a kinetic product demo;
- a spatial 3D object;
- a distinctive modular grid;
- a strong photographic crop system;
- a hand-drawn annotation layer;
- a bold monochrome palette.

Supporting components should be calmer.

### Avoid aesthetic cargo cults
Do not use:

- bento boxes without meaningful grouping;
- glass panels without depth context;
- brutalism without intentional typography and accessibility;
- 3D objects that do not explain or embody the product;
- horizontal scroll because an awards site used it;
- tiny gray type as a proxy for sophistication;
- gratuitous grain, glow, and chromatic aberration;
- generic AI gradients as a substitute for identity.

### Brand consistency versus monotony
Consistency means stable rules. Variation can happen within them. Define what can flex:

- image crop;
- layout composition;
- accent color;
- type scale;
- motion intensity;
- illustration density.

Templates should guide, not fossilize.

---
