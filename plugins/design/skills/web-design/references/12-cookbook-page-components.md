# Implementation Cookbook: Page and Component Foundations
Source: Modern Functional Web Design Mega Handbook 2026.

# Part IX — Practical tools

## 80. Implementation cookbook
The snippets below are composable starting points. Adapt naming, support policy, and framework integration. Keep semantics intact.

### 80.1 A semantic page shell
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Specific page title — Site name</title>
    <meta name="description" content="A specific description of this page.">
    <link rel="canonical" href="https://example.com/current-page">
    <link rel="stylesheet" href="/assets/site.css">
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>

    <header class="site-header">
      <a href="/" aria-label="Site name, home">
        <svg aria-hidden="true" focusable="false"><!-- logo --></svg>
      </a>

      <nav aria-label="Primary">
        <ul>
          <li><a href="/products">Products</a></li>
          <li><a href="/work">Work</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    </header>

    <main id="main" tabindex="-1">
      <h1>Page heading</h1>
      <!-- page content -->
    </main>

    <footer>
      <nav aria-label="Footer"><!-- secondary links --></nav>
    </footer>

    <script type="module" src="/assets/site.js"></script>
  </body>
</html>
```

Notes:

- The skip target may use `tabindex="-1"` if your route/focus strategy needs programmatic focus.
- Give multiple navigation regions distinct accessible labels.
- Keep one primary page heading in most ordinary pages; nested component headings should reflect structure.
- Use SVG logos with an accessible name on the link, not duplicate text inside the SVG.

### 80.2 Foundations with cascade layers
```css
@layer reset, tokens, base, layout, components, utilities, overrides;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    hanging-punctuation: first last;
  }

  body,
  h1,
  h2,
  h3,
  p,
  figure,
  blockquote,
  dl,
  dd {
    margin: 0;
  }

  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-inline-size: 100%;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --canvas: oklch(98% 0.008 255);
    --surface: oklch(100% 0 0);
    --text: oklch(20% 0.025 255);
    --text-muted: oklch(45% 0.025 255);
    --border: oklch(86% 0.018 255);
    --accent: oklch(58% 0.21 263);
    --accent-hover: oklch(52% 0.21 263);
    --on-accent: white;
    --focus: oklch(76% 0.18 92);
    --danger: oklch(55% 0.2 27);

    --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
    --font-serif: "Source Serif 4", ui-serif, Georgia, serif;
    --font-mono: "SFMono-Regular", Consolas, monospace;

    --step--1: clamp(0.875rem, 0.84rem + 0.15vw, 1rem);
    --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
    --step-1: clamp(1.25rem, 1.14rem + 0.55vw, 1.58rem);
    --step-2: clamp(1.56rem, 1.33rem + 1.15vw, 2.25rem);
    --step-3: clamp(1.95rem, 1.52rem + 2.15vw, 3.25rem);
    --step-4: clamp(2.44rem, 1.66rem + 3.9vw, 4.8rem);

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-5: 1.5rem;
    --space-6: 2rem;
    --space-7: 3rem;
    --space-8: 4rem;
    --space-section: clamp(4rem, 8vw, 8rem);

    --radius-sm: 0.5rem;
    --radius-md: 0.875rem;
    --radius-lg: 1.5rem;

    --duration-fast: 140ms;
    --duration-medium: 240ms;
    --ease-standard: cubic-bezier(.2, .8, .2, 1);
  }
}

@layer base {
  html {
    color-scheme: light;
    scroll-behavior: smooth;
  }

  body {
    min-block-size: 100vh;
    background: var(--canvas);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: var(--step-0);
    line-height: 1.55;
    text-rendering: optimizeLegibility;
  }

  h1,
  h2,
  h3 {
    line-height: 1.08;
    text-wrap: balance;
  }

  p,
  li {
    text-wrap: pretty;
  }

  a {
    color: currentColor;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.17em;
  }

  :focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  ::selection {
    background: color-mix(in oklch, var(--accent) 30%, transparent);
  }
}
```

`text-wrap: balance` and `pretty` are enhancements. Do not depend on them to prevent overflow.

### 80.3 Skip link
```css
.skip-link {
  position: fixed;
  z-index: 1000;
  inset-block-start: 0.75rem;
  inset-inline-start: 0.75rem;
  translate: 0 -200%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--text);
  color: var(--canvas);
}

.skip-link:focus {
  translate: 0;
}
```

Avoid `display: none` or `visibility: hidden`; the link must be focusable.

### 80.4 Full-bleed layout with readable content
```css
.page-grid {
  --gutter: clamp(1rem, 4vw, 4rem);
  --content: min(72rem, calc(100vw - 2 * var(--gutter)));
  --reading: min(68ch, calc(100vw - 2 * var(--gutter)));

  display: grid;
  grid-template-columns:
    [full-start] minmax(var(--gutter), 1fr)
    [content-start] minmax(0, calc((var(--content) - var(--reading)) / 2))
    [reading-start] minmax(0, var(--reading))
    [reading-end] minmax(0, calc((var(--content) - var(--reading)) / 2))
    [content-end] minmax(var(--gutter), 1fr)
    [full-end];
}

.page-grid > * {
  grid-column: reading;
}

.page-grid > .wide {
  grid-column: content;
}

.page-grid > .full {
  grid-column: full;
}
```

This pattern lets prose, wide figures, and full-width bands coexist without one-off negative margins.

### 80.5 Auto-fit cards with container adaptation
```css
.card-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: clamp(1rem, 2vw, 2rem);
}

.card {
  container: card / inline-size;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: clip;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.card__body {
  padding: clamp(1rem, 5cqi, 2rem);
}

@container card (min-width: 30rem) {
  .card--feature {
    grid-template-columns: 1fr 1.2fr;
    grid-template-rows: auto;
  }
}
```

Use container query units only when they improve a component. They can become difficult to reason about when nested indiscriminately.

### 80.6 A stack and cluster utility
```css
.stack {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.stack > * {
  margin-block: 0;
}

.stack > * + * {
  margin-block-start: var(--stack-space, 1rem);
}

.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cluster-gap, 0.75rem);
  align-items: var(--cluster-align, center);
  justify-content: var(--cluster-justify, flex-start);
}
```

These two primitives cover much ordinary layout without component-specific margins.

### 80.7 Accessible button styles
```html
<button class="button button--primary" type="button">
  <span>Save changes</span>
</button>
```

```css
.button {
  display: inline-flex;
  min-block-size: 2.75rem;
  min-inline-size: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-weight: 650;
  line-height: 1.1;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    translate var(--duration-fast) var(--ease-standard);
}

.button--primary {
  background: var(--accent);
  color: var(--on-accent);
}

.button--primary:hover {
  background: var(--accent-hover);
}

.button:active {
  translate: 0 1px;
}

.button[aria-busy="true"] {
  cursor: progress;
}

.button:disabled {
  cursor: not-allowed;
}
```

Do not use `pointer-events: none` on disabled controls if users need to reach an explanation. Consider an enabled button that validates instead.

### 80.8 Icon-only button
```html
<button class="icon-button" type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
</button>
```

```css
.icon-button {
  display: grid;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: currentColor;
}

.icon-button svg {
  inline-size: 1.25rem;
  block-size: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
```

The accessible name describes the action, not the icon’s appearance.

### 80.9 Form field with help and error
```html
<div class="field" data-state="error">
  <label for="company">
    Company name
    <span class="field__optional">Optional</span>
  </label>

  <p id="company-help" class="field__help">
    Use the name shown on your invoices.
  </p>

  <input
    id="company"
    name="company"
    type="text"
    autocomplete="organization"
    aria-describedby="company-help company-error"
    aria-invalid="true">

  <p id="company-error" class="field__error">
    Enter 100 characters or fewer.
  </p>
</div>
```

```css
.field {
  display: grid;
  gap: 0.4rem;
  max-inline-size: 36rem;
}

.field label {
  font-weight: 650;
}

.field__help {
  color: var(--text-muted);
  font-size: var(--step--1);
}

.field input {
  min-block-size: 2.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
}

.field input[aria-invalid="true"] {
  border-color: var(--danger);
  border-inline-start-width: 0.3rem;
}

.field__error {
  color: var(--danger);
  font-weight: 600;
}
```

Only include the error ID in `aria-describedby` while the error exists. Do not announce the same message repeatedly on every keystroke.

### 80.10 Error summary
```html
<section
  class="error-summary"
  role="alert"
  aria-labelledby="error-summary-title"
  tabindex="-1">
  <h2 id="error-summary-title">Fix 2 fields</h2>
  <ul>
    <li><a href="#email">Enter a valid email address</a></li>
    <li><a href="#postal-code">Enter a postal code</a></li>
  </ul>
</section>
```

On failed submission, focus the summary and let each link focus its corresponding field.

### 80.11 Native dialog with focus restoration
```html
<button id="open-delete" type="button">Delete project</button>

<dialog id="delete-dialog" aria-labelledby="delete-title">
  <form method="dialog">
    <h2 id="delete-title">Delete “Ocean Atlas”?</h2>
    <p>The project will move to trash for 30 days.</p>
    <div class="cluster">
      <button value="cancel">Cancel</button>
      <button value="confirm" class="button--danger">Move to trash</button>
    </div>
  </form>
</dialog>
```

```js
const trigger = document.querySelector("#open-delete");
const dialog = document.querySelector("#delete-dialog");

trigger?.addEventListener("click", () => dialog?.showModal());

dialog?.addEventListener("close", () => {
  trigger?.focus();

  if (dialog.returnValue === "confirm") {
    // Perform the destructive action, then expose undo when safe.
  }
});
```

Native `<dialog>` supplies important behavior, but test screen-reader/browser combinations in your support matrix. Ensure close buttons, Escape behavior, and destructive wording match the consequence.

### 80.12 Disclosure
```html
<details>
  <summary>What happens after the trial?</summary>
  <div class="prose">
    <p>Your workspace remains available in read-only mode...</p>
  </div>
</details>
```

Use native disclosure for ordinary expandable content. A disclosure is not automatically a tab, menu, or modal.

### 80.13 Responsive image with correct sizing
```html
<img
  src="/media/project-960.webp"
  srcset="
    /media/project-480.webp 480w,
    /media/project-960.webp 960w,
    /media/project-1440.webp 1440w,
    /media/project-1920.webp 1920w"
  sizes="
    (min-width: 80rem) 70rem,
    (min-width: 50rem) calc(100vw - 6rem),
    calc(100vw - 2rem)"
  width="1600"
  height="1000"
  alt="A dashboard comparing tidal temperature readings"
  decoding="async">
```

Use `loading="lazy"` for appropriate below-the-fold images. Omit it for likely LCP imagery and consider `fetchpriority="high"` only for the true priority resource.

### 80.14 Art-directed picture
```html
<picture>
  <source
    media="(min-width: 64rem)"
    srcset="/media/team-wide.avif"
    type="image/avif">
  <source
    media="(min-width: 64rem)"
    srcset="/media/team-wide.webp"
    type="image/webp">
  <source
    srcset="/media/team-tight.avif"
    type="image/avif">
  <img
    src="/media/team-tight.jpg"
    width="900"
    height="1100"
    alt="The research team testing sensors on a pier">
</picture>
```

The crop changes, but the semantic meaning and alt text remain consistent.
