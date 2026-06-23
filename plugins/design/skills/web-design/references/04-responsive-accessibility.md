# Responsive and Accessible Design
Source: Modern Functional Web Design Mega Handbook 2026.

# Part IV — Technical quality

## 22. Responsive and adaptive design
Responsive design is not shrinking a desktop composition. It is deciding what the interface should do at every amount of available space and under varied input, zoom, orientation, and content conditions.

### Design from content pressure
Choose breakpoints where the design stops working, not from a list of popular devices.

Common pressure points:

- navigation no longer fits;
- line length becomes uncomfortable;
- cards become too narrow;
- controls wrap badly;
- sidebars squeeze the main task;
- data loses context;
- a visual crop stops communicating;
- fixed actions cover content.

### Start narrow, not “mobile-only”
A narrow-first implementation often produces cleaner source order and progressive enhancement. Still, design wide states deliberately. A desktop interface is not merely a stretched phone.

### Responsive dimensions beyond width
Test:

- height;
- landscape orientation;
- zoom;
- text enlargement;
- pointer precision;
- hover availability;
- reduced motion;
- reduced data;
- color scheme;
- contrast preferences;
- safe-area insets;
- on-screen keyboard;
- foldable or split-screen panes;
- embedded/container contexts.

### Media queries and capability queries
Use width queries for page-level composition. Use capability queries for interaction assumptions:

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-0.125rem); }
}
```

Do not hide essential functionality behind hover.

### Container queries
A component should often respond to its container instead of the viewport:

```css
.feature {
  container-type: inline-size;
}

.feature__inner {
  display: grid;
  gap: 1rem;
}

@container (min-width: 38rem) {
  .feature__inner {
    grid-template-columns: 1fr 1.4fr;
    align-items: center;
  }
}
```

This makes components portable across pages, sidebars, modals, and CMS layouts.

### Responsive ordering
Visual reordering must not create a confusing reading or focus order. Prefer source order that works linearly, then use layout to enhance it. Avoid using CSS `order` to create a visual sequence radically different from the DOM.

### Viewport units
Dynamic viewport units help with mobile browser chrome:

- `svh`: small viewport;
- `lvh`: large viewport;
- `dvh`: dynamic viewport.

Use them carefully:

```css
.hero {
  min-block-size: min(48rem, 100svh);
}
```

A hero does not always need to fill the viewport. On short screens, full-height compositions can push all proof below the fold.

### Safe areas
For full-screen interfaces:

```css
.app-bar {
  padding-block-start: max(1rem, env(safe-area-inset-top));
  padding-inline:
    max(1rem, env(safe-area-inset-left))
    max(1rem, env(safe-area-inset-right));
}
```

### Responsive images and media
- provide source dimensions;
- use `srcset` and `sizes`;
- art-direct with `<picture>`;
- lazy-load below-the-fold media;
- avoid lazy-loading likely LCP content;
- provide poster frames;
- cap media width;
- test crop at every content breakpoint.

### Responsive typography
Fluid type should have minimum and maximum values. Never use unbounded `vw`.

```css
.hero-title {
  font-size: clamp(2.75rem, 1.4rem + 6vw, 7.5rem);
}
```

Test at 200% browser zoom and with enlarged default font size.

### Mobile interaction
- keep primary controls within comfortable reach where appropriate;
- prevent sticky elements from covering focused fields;
- ensure the keyboard does not hide submission;
- provide sufficient touch targets;
- avoid precision gestures;
- include non-swipe alternatives;
- keep back behavior predictable;
- preserve scroll position after navigation.

### Desktop interaction
Use available space to improve:

- comparison;
- preview;
- multi-selection;
- context panels;
- persistent navigation;
- keyboard shortcuts;
- drag-and-drop, with alternatives;
- information density.

Do not inflate every element just because the viewport is wide.

### Responsive test matrix
At minimum, test:

|Dimension|Cases|
|---|---|
|Width|320, 375, 768, 1024, 1280, 1440, very wide|
|Height|short laptop, landscape phone, tall desktop|
|Zoom|100%, 200%, 400% where applicable|
|Text|default, enlarged, long localization|
|Input|touch, mouse, keyboard, screen reader|
|Theme|light, dark, forced colors|
|Motion|normal, reduced|
|Network|fast, slow, offline/reconnect|
|Content|empty, typical, extreme, error|

---

## 23. Accessibility and inclusive design
Accessibility is product quality. Build to **WCAG 2.2 AA** as a practical baseline unless a stricter legal or organizational target applies.

Automated tools catch only a subset of issues. Combine automated checks, keyboard testing, screen-reader testing, zoom/reflow testing, and human evaluation.

### Semantic foundation
Start with native HTML:

- headings in meaningful order;
- landmarks such as `header`, `nav`, `main`, `aside`, and `footer`;
- buttons for actions;
- links for navigation;
- lists for lists;
- tables for tabular data;
- labels for inputs;
- `details`/`summary` where suitable;
- dialogs implemented with correct semantics and focus behavior.

ARIA can communicate missing semantics. It does not repair an interaction model that does not behave like the announced role. Follow the WAI-ARIA Authoring Practices for custom widgets.

### Page structure
Every page should have:

- a unique, descriptive title;
- one clear main region;
- a logical heading outline;
- meaningful landmarks;
- a skip link when repeated navigation precedes content;
- consistent navigation;
- a declared document language;
- language changes identified where relevant.

### Keyboard access
All functionality must be available from a keyboard without requiring a mouse, touch, or drag gesture.

Test:

- logical Tab and Shift+Tab order;
- visible focus;
- activation with expected keys;
- Escape behavior;
- arrow-key behavior for composite widgets;
- focus restoration after dialogs;
- no keyboard traps;
- access to hidden/revealed controls;
- no content revealed only on hover.

Do not add positive `tabindex` values to force order. Fix DOM order.

### Focus appearance
WCAG 2.2 adds stronger focus guidance. A practical target is a clearly visible indicator roughly equivalent to a two-CSS-pixel perimeter with sufficient contrast against adjacent colors.

```css
:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}
```

Never remove the browser outline without a replacement. Check focus against every surface, not only white.

### Focus management
Move focus when context changes substantially:

- opening a modal → focus inside, usually heading or first meaningful control;
- closing a modal → return to trigger;
- failed long form → error summary;
- client-side route change → appropriate page start/heading;
- added content → announce or move focus only when the user's task requires it.

Unexpected focus movement is disruptive. Use it sparingly.

### Target size and spacing
WCAG 2.2 AA defines a 24 × 24 CSS-pixel minimum target-size rule with exceptions, including equivalent spacing. Treat 24 as a floor. Use larger targets for touch, mobility limitations, destructive actions, and high-frequency controls.

### Contrast
Test all states:

- default;
- hover;
- active;
- focus;
- selected;
- disabled;
- validation;
- placeholder;
- text over media;
- dark mode;
- forced colors.

Do not use opacity so low that required text fails contrast. Disabled text is treated differently by WCAG, but it should still be understandable whenever users need to know why something is unavailable.

### Color independence
Never communicate status only with color. Add:

- text;
- icon;
- shape;
- pattern;
- position;
- line style.

Examples: required fields need more than a red border; chart series need more than hue; errors need a message and association.

### Text resizing and reflow
WCAG requires text to resize to 200% without loss of content or functionality. Reflow criteria also address narrow equivalent viewport widths. Avoid:

- fixed-height text containers;
- clipped labels;
- overlays that cannot scroll;
- two-dimensional page scrolling for ordinary content;
- sticky elements that consume most of a zoomed viewport.

### Spacing overrides
Users may override line height, paragraph spacing, letter spacing, and word spacing. Do not use fixed containers or positioning that clips text under these changes.

### Images and media
- appropriate alt text;
- empty alt for decorative images;
- captions for prerecorded speech;
- transcript where needed;
- audio description or equivalent for essential visuals;
- pause/stop/hide for moving content;
- no content flashing at dangerous frequencies;
- accessible media controls;
- no autoplay audio.

### Forms
- visible labels;
- programmatic associations;
- clear instructions;
- errors in text;
- suggestions for correction;
- error summary for complex flows;
- no loss of data;
- accessible authentication;
- status announcements;
- sufficient time or adjustable limits.

### Hover and focus content
Tooltips, popovers, and submenus triggered by hover or focus need to be:

- dismissible;
- hoverable when pointer movement is needed;
- persistent until dismissed, invalidated, or no longer relevant;
- keyboard accessible.

Do not put essential instructions only in a tooltip.

### Dragging
WCAG 2.2 requires a non-drag alternative for functionality that uses dragging, unless dragging is essential. Provide buttons, menus, inputs, or keyboard operations.

### Motion and vestibular safety
Respect `prefers-reduced-motion`. Avoid:

- large parallax;
- rapid zoom;
- automatic panning;
- scroll hijacking;
- persistent background movement;
- flashing;
- motion tied tightly to every scroll pixel without an alternative.

### Cognitive accessibility
Support comprehension through:

- consistent patterns;
- plain labels;
- visible progress;
- chunked tasks;
- recognition over recall;
- forgiving input;
- save and resume;
- clear time limits;
- predictable help;
- no memory puzzles;
- confirmation of consequences.

### Screen-reader testing
Test at least one common screen reader/browser combination per target platform. Inspect:

- landmark navigation;
- headings;
- names, roles, values;
- reading order;
- live regions;
- table navigation;
- dialog behavior;
- error announcements;
- icon-only controls;
- custom widgets.

Do not interpret “it reads something” as success. The interaction must be understandable and efficient.

### Forced colors and high contrast
Use system colors where appropriate. Test:

- focus rings;
- selected states;
- SVG icons;
- borders;
- custom checkboxes/radios;
- charts;
- disabled controls;
- decorative background dependencies.

### Accessibility acceptance checklist
- [ ] Unique page titles
- [ ] Correct language
- [ ] Logical headings
- [ ] Landmarks and skip link
- [ ] Native controls where possible
- [ ] Full keyboard operation
- [ ] Visible focus
- [ ] Dialog focus trap and restoration
- [ ] Text contrast passes
- [ ] Non-text contrast passes
- [ ] Information not color-only
- [ ] Target sizes and spacing
- [ ] Text zoom and reflow
- [ ] Reduced motion
- [ ] Captions/transcripts
- [ ] Correct alternative text
- [ ] Labeled forms
- [ ] Useful error recovery
- [ ] Drag alternative
- [ ] Accessible authentication
- [ ] Automated scan reviewed
- [ ] Manual screen-reader pass
- [ ] Accessibility statement and feedback route where appropriate

**Primary references:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WCAG quick reference](https://www.w3.org/WAI/WCAG22/quickref/), and [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/).

---
