# Systems and Implementation
Source: Modern Functional Web Design Mega Handbook 2026.

# Part V — Systems and implementation

## 28. Design tokens
Tokens encode decisions so they can be reused across design and code.

### Token layers
A mature token system often has three layers:

1. **Primitive:** raw values such as blue-600, space-4, radius-8.
2. **Semantic:** roles such as text-primary, action-primary, surface-raised.
3. **Component:** local decisions such as button-primary-background.

Prefer semantic tokens in application code. Primitive names leak implementation and make themes harder.

### Token categories
- color;
- typography;
- spacing;
- size;
- radius;
- border;
- shadow/elevation;
- opacity;
- z-index;
- motion duration;
- easing;
- breakpoint/container;
- data visualization;
- focus;
- density.

### Example
```css
@layer tokens {
  :root {
    --color-neutral-0: oklch(100% 0 0);
    --color-neutral-950: oklch(16% 0.02 260);
    --color-brand-600: oklch(56% 0.2 260);

    --color-canvas: var(--color-neutral-0);
    --color-text: var(--color-neutral-950);
    --color-action: var(--color-brand-600);
    --color-focus: oklch(72% 0.18 90);

    --radius-control: 0.625rem;
    --radius-surface: 1rem;
    --shadow-raised: 0 0.5rem 2rem rgb(0 0 0 / 0.12);
  }

  [data-theme="dark"] {
    --color-canvas: var(--color-neutral-950);
    --color-text: var(--color-neutral-0);
  }
}
```

### Naming
Names should describe intent and state:

```text
color.action.primary.default
color.action.primary.hover
color.text.muted
space.component.card
motion.duration.fast
```

Avoid names such as `pretty-blue`, `homepage-gap`, or `gray-3` in component APIs.

### Governance
For each token change:

- document rationale;
- preview affected components;
- test themes and contrast;
- version breaking changes;
- provide migration;
- avoid creating a token for every one-off value.

Tokens are not useful if teams routinely bypass them.

### Cross-platform tokens
Store platform-neutral source data and transform it for CSS, native platforms, design tools, and documentation. Watch for units and capabilities that do not map exactly.

---

## 29. Component architecture
A component is a reusable behavioral and visual contract.

### Good component boundaries
A component should have:

- a coherent responsibility;
- a stable API;
- defined states;
- accessibility behavior;
- content constraints;
- responsive behavior;
- theme support;
- test coverage.

Do not abstract a pattern after seeing it once. Abstract when repetition and variation are understood.

### Composition over giant variants
Prefer small composable parts:

```jsx
<Card>
  <Card.Media />
  <Card.Header>
    <Card.Eyebrow />
    <Card.Title />
  </Card.Header>
  <Card.Body />
  <Card.Actions />
</Card>
```

Avoid a single component with dozens of Boolean props that create impossible combinations.

### State model
Document state explicitly. For a button:

```ts
type ButtonState =
  | { kind: "idle" }
  | { kind: "loading"; label: string }
  | { kind: "success"; label: string }
  | { kind: "error"; message: string };
```

State machines are useful for complex components such as uploads, checkout, authentication, and async workflows.

### Controlled flexibility
Define safe extension points:

- slots;
- variants;
- size;
- density;
- semantic color;
- media;
- actions;
- layout mode.

Do not expose every CSS property through props.

### Component documentation
Include:

- purpose;
- anatomy;
- variants;
- content rules;
- interaction;
- accessibility;
- responsive behavior;
- do/don’t examples;
- code;
- status;
- owner;
- related patterns;
- change log.

### Headless and styled layers
A headless behavior layer can separate semantics/state from visual styling. This works well when multiple brands need the same accessible interactions. Ensure the styling layer cannot accidentally omit required states or structure.

### Native first
Before building a custom select, date picker, menu, dialog, or disclosure, assess whether native HTML meets the need. Custom controls carry a large accessibility and maintenance obligation.

### CMS components
CMS blocks need stricter constraints than developer components:

- bounded options;
- content previews;
- validation;
- meaningful names;
- safe defaults;
- responsive behavior;
- no arbitrary layout controls that allow editors to break hierarchy.

### Component acceptance template
```markdown
## Component: [name]

Purpose:
Anatomy:
Required content:
Optional content:
Variants:
States:
Keyboard behavior:
Screen-reader behavior:
Responsive behavior:
Motion:
Performance constraints:
Localization constraints:
Analytics:
Tests:
Owner:
```

---

## 30. CSS architecture and modern platform capabilities
Modern CSS can replace substantial JavaScript and reduce coupling when used progressively.

### Cascade layers
Define precedence intentionally:

```css
@layer reset, tokens, base, components, utilities, overrides;
```

This makes specificity less accidental.

### Nesting
Native nesting can improve locality, but deep nesting recreates the same complexity as preprocessors.

```css
.card {
  border: 1px solid var(--border);

  & > header {
    display: flex;
  }

  &:has(input:focus-visible) {
    border-color: var(--focus);
  }
}
```

Keep nesting shallow and readable.

### Logical properties
Use logical properties for writing-mode resilience:

- `margin-inline`;
- `padding-block`;
- `inset-inline-start`;
- `border-block-end`;
- `inline-size`;
- `block-size`.

### Container queries
Use them for component adaptation, not as a replacement for every media query. Name containers where nested contexts need clarity.

### Subgrid
Subgrid helps repeated card content align across rows:

```css
.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 4;
}
```

Use a fallback if your support matrix requires it.

### Relational selectors
`:has()` can express parent state without JavaScript:

```css
.field:has(:invalid:not(:placeholder-shown)) {
  --field-border: var(--danger);
}
```

Be careful with validation timing and selector scope.

### View transitions
View Transition APIs can animate between states or documents where supported. Treat cross-document transitions as progressive enhancement because support varies. Preserve reduced-motion behavior, focus, history, and immediate navigation.

### Color capabilities
Use modern color functions behind tested fallbacks when your browser matrix requires it:

```css
.button {
  background: #405cf5;
  background: oklch(58% 0.22 265);
}
```

### CSS architecture choices
Common approaches include:

- global semantic CSS;
- BEM-style naming;
- CSS Modules;
- scoped component styles;
- utility classes;
- CSS-in-JS;
- generated atomic CSS.

Choose based on team, runtime, theming, extraction, and product lifetime. Evaluate:

- output size;
- caching;
- server rendering;
- runtime cost;
- token integration;
- developer ergonomics;
- debugging;
- ownership;
- portability.

No naming methodology substitutes for good component boundaries.

### Progressive enhancement
Build:

1. semantic content and form submission;
2. CSS layout;
3. modest interaction;
4. rich enhancement.

A product does not need to work identically without JavaScript, but critical content, navigation, and recovery should degrade deliberately.

### Feature support
Use:

```css
@supports (container-type: inline-size) {
  /* enhancement */
}
```

Check current browser support through authoritative compatibility data. “Baseline” status can help distinguish widely available features from newly interoperable or limited ones.

### Avoid CSS performance folklore
Measure actual bottlenecks. Selector micro-optimization is rarely more important than:

- huge DOM;
- layout thrashing;
- expensive paint;
- large blurred layers;
- frequent style invalidation;
- animation of layout-heavy properties;
- unbounded content;
- unused bundles.

---

## 31. Content models and CMS design
A CMS should store meaning, not screenshots of layouts.

### Model content semantically
Prefer fields such as:

- title;
- summary;
- body;
- author;
- date;
- category;
- media;
- caption;
- CTA label/destination;
- product data;
- testimonial source;
- legal qualifier.

Avoid one giant rich-text field for the entire page when content needs reuse, search, personalization, or structured display.

### Structured content versus blocks
Use structured content for stable entities and relationships. Use bounded page blocks for editorial composition. Combine them carefully.

Example:

- `CaseStudy` entity with client, challenge, outcomes, services, quotes, media;
- page builder that can reference case studies in a featured grid.

### Content constraints
Set:

- character guidance;
- required fields;
- image aspect ratios;
- alternative text;
- link validation;
- publication state;
- ownership;
- review date;
- localization status.

Character counts should guide, not force awkward copy. Design must survive realistic variance.

### Preview
Preview should include:

- representative breakpoints;
- dark/light theme if applicable;
- draft state;
- localization;
- missing/long content;
- scheduled content.

### Editorial workflow
Define:

- draft;
- review;
- legal/compliance;
- accessibility check;
- scheduled;
- published;
- expired;
- archived.

A page without an owner becomes stale.

### Content debt
Track:

- duplicate pages;
- broken links;
- stale claims;
- outdated screenshots;
- missing alt text;
- orphaned content;
- inconsistent terminology;
- unowned pages.

Treat content debt like code debt.

---

## 32. Design-to-development workflow
High visual quality comes from iteration between design and implementation, not a one-way handoff.

### Recommended sequence
1. brief and constraints;
2. content and IA;
3. low-fidelity flows;
4. visual territories;
5. selected direction;
6. tokens and primitives;
7. responsive prototypes;
8. component states;
9. implementation;
10. joint review in browser;
11. accessibility/performance hardening;
12. launch and measurement.

### Visual territories
Create two or three meaningfully different directions, not minor color variations. Each should explain:

- brand traits;
- typography;
- color logic;
- imagery;
- composition;
- motion;
- suitability;
- risks;
- cost.

### Prototype the risky thing first
Risk may be:

- 3D hero;
- complex data table;
- localization;
- checkout;
- scroll narrative;
- collaborative editor;
- unusual navigation;
- large media catalog.

Do not spend weeks polishing ordinary cards before proving the risky core.

### Browser as design material
Inspect actual:

- font rendering;
- line breaks;
- browser controls;
- touch behavior;
- sticky positioning;
- loading sequence;
- animation timing;
- input autofill;
- focus;
- real content;
- low-end performance.

A static canvas cannot show these accurately.

### Handoff specification
Provide:

- tokens;
- component anatomy;
- states;
- responsive rules;
- content constraints;
- motion timing;
- asset exports;
- image crops;
- accessibility requirements;
- interaction notes;
- empty/error/loading states;
- test cases.

Avoid redline documents that freeze pixels without explaining behavior.

### Design QA
Designers should review the implementation in the browser across breakpoints and states. Engineers should participate before visual decisions are fixed. Use one issue system with screenshots, expected behavior, severity, and ownership.

### Definition of done
A component is not done when the default state matches a mockup. It is done when:

- all states work;
- keyboard behavior works;
- responsive behavior works;
- localization works;
- content extremes work;
- tests pass;
- performance cost is acceptable;
- documentation exists;
- analytics and privacy needs are met.

---

## 33. Testing and quality assurance
Test the experience as a system.

### Test pyramid for interfaces
**Static and automated**

- linting;
- type checks;
- unit tests;
- accessibility rules;
- component tests;
- visual regression;
- bundle budgets;
- broken-link scans;
- HTML validation;
- structured-data validation.

**Integration**

- form flows;
- authentication;
- search/filter;
- cart/checkout;
- permissions;
- error handling;
- analytics events;
- localization;
- API failure states.

**Human evaluation**

- keyboard;
- screen reader;
- zoom/reflow;
- touch;
- usability;
- content review;
- visual craft;
- low-end performance;
- assistive technology;
- real-user research.

### Content stress tests
Use:

- empty content;
- one item;
- hundreds of items;
- long names;
- long translated strings;
- missing image;
- broken image;
- very tall image;
- unexpected markup;
- user-generated text;
- huge number;
- negative number;
- zero;
- unknown value;
- old date;
- future date.

### Visual regression
Capture:

- key breakpoints;
- themes;
- states;
- focus;
- validation;
- loading;
- empty;
- modal;
- menus;
- long content.

Do not approve snapshots blindly. A stable wrong screenshot is still wrong.

### Browser/device strategy
Choose from actual audience data, then include:

- current major engines;
- iOS Safari;
- Android Chrome;
- keyboard desktop;
- low-end Android where relevant;
- high-DPI and ordinary screens;
- touch laptop/tablet if used;
- embedded webviews if part of the product.

### Network and failure tests
- slow 3G/4G simulation;
- high latency;
- request timeout;
- partial response;
- failed image;
- failed analytics;
- expired token;
- server error;
- offline then reconnect;
- duplicated submission;
- stale data.

### Accessibility QA sequence
1. inspect semantics;
2. run automated tools;
3. keyboard-only pass;
4. zoom/reflow;
5. forced colors;
6. reduced motion;
7. screen-reader flows;
8. test errors and dynamic content;
9. test with disabled users where possible;
10. document residual issues and owners.

### Performance QA sequence
1. establish field baseline;
2. test representative page templates;
3. inspect waterfall;
4. identify LCP element;
5. profile interactions;
6. review long tasks;
7. test CLS during full lifecycle;
8. inspect fonts/media;
9. audit third parties;
10. enforce budgets.

### Release gates
Block release for:

- inaccessible core task;
- data loss;
- severe security/privacy defect;
- broken checkout or authentication;
- keyboard trap;
- unreadable contrast in critical content;
- catastrophic performance regression;
- legal misinformation;
- crash loop;
- unhandled destructive action.

Log lower-severity craft defects with owners rather than accepting permanent “later.”
