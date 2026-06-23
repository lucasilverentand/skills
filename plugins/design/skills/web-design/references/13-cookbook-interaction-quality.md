# Implementation Cookbook: Interaction, Media, Performance, and Readiness
Source: Modern Functional Web Design Mega Handbook 2026.

### 80.15 Font face with fallback metrics
```css
@font-face {
  font-family: "Brand Sans";
  src: url("/fonts/brand-sans.woff2") format("woff2");
  font-style: normal;
  font-weight: 300 800;
  font-display: swap;
}

@font-face {
  font-family: "Brand Sans Fallback";
  src: local("Arial");
  size-adjust: 101%;
  ascent-override: 91%;
  descent-override: 23%;
  line-gap-override: 0%;
}

:root {
  --font-sans: "Brand Sans", "Brand Sans Fallback", sans-serif;
}
```

Calculate overrides for the actual fonts. Incorrect metrics can make fallback rendering worse.

### 80.16 Theme preference with system default
```html
<button type="button" id="theme-toggle" aria-pressed="false">
  Use dark theme
</button>
```

```css
:root {
  color-scheme: light;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --canvas: oklch(17% 0.018 255);
  --surface: oklch(22% 0.02 255);
  --text: oklch(94% 0.01 255);
  --text-muted: oklch(74% 0.018 255);
  --border: oklch(35% 0.025 255);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    color-scheme: dark;
    --canvas: oklch(17% 0.018 255);
    --surface: oklch(22% 0.02 255);
    --text: oklch(94% 0.01 255);
    --text-muted: oklch(74% 0.018 255);
    --border: oklch(35% 0.025 255);
  }
}
```

```js
const root = document.documentElement;
const button = document.querySelector("#theme-toggle");
const stored = localStorage.getItem("theme");

if (stored === "light" || stored === "dark") {
  root.dataset.theme = stored;
}

function resolvedTheme() {
  if (root.dataset.theme) return root.dataset.theme;
  return matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function syncButton() {
  const dark = resolvedTheme() === "dark";
  button?.setAttribute("aria-pressed", String(dark));
  if (button) button.textContent = dark ? "Use light theme" : "Use dark theme";
}

button?.addEventListener("click", () => {
  const next = resolvedTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("theme", next);
  syncButton();
});

syncButton();
```

A three-option control—system, light, dark—is often clearer than a binary toggle.

### 80.17 Reduced-motion strategy
```css
.reveal {
  opacity: 0;
  translate: 0 1rem;
  transition:
    opacity 400ms var(--ease-standard),
    translate 400ms var(--ease-standard);
}

.reveal[data-visible="true"] {
  opacity: 1;
  translate: 0;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .reveal {
    opacity: 1;
    translate: none;
    transition: none;
  }

  .ambient,
  .parallax,
  [data-auto-animate] {
    animation: none !important;
    transform: none !important;
  }
}
```

Do not disable indeterminate progress indicators or other motion required to communicate ongoing state. Replace or simplify them.

### 80.18 Intersection-based progressive reveal
```js
const elements = document.querySelectorAll(".reveal");

if (
  !matchMedia("(prefers-reduced-motion: reduce)").matches &&
  "IntersectionObserver" in window
) {
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px" }
  );

  elements.forEach(element => observer.observe(element));
} else {
  elements.forEach(element => {
    element.dataset.visible = "true";
  });
}
```

Content should exist and be accessible before the reveal script runs. Avoid leaving content permanently transparent when JavaScript fails.

### 80.19 Accessible status announcements
```html
<div
  id="save-status"
  class="visually-hidden"
  role="status"
  aria-live="polite"
  aria-atomic="true"></div>
```

```css
.visually-hidden {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

```js
const status = document.querySelector("#save-status");

async function save(data) {
  if (status) status.textContent = "Saving";

  try {
    await persist(data);
    if (status) status.textContent = "Changes saved";
  } catch {
    if (status) status.textContent = "Changes were not saved";
    // Also show a visible, actionable error.
  }
}
```

Do not flood live regions with rapid updates. A visible status is still required when the information matters to everyone.

### 80.20 A responsive data table wrapper
```html
<div class="table-region" tabindex="0" role="region"
     aria-labelledby="invoice-table-title">
  <table>
    <caption id="invoice-table-title">Invoices, April to June 2026</caption>
    <thead>
      <tr>
        <th scope="col">Invoice</th>
        <th scope="col">Customer</th>
        <th scope="col">Issued</th>
        <th scope="col" class="numeric">Amount</th>
        <th scope="col">Status</th>
      </tr>
    </thead>
    <tbody><!-- rows --></tbody>
  </table>
</div>
```

```css
.table-region {
  max-inline-size: 100%;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

table {
  inline-size: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: 0.75rem 1rem;
  border-block-end: 1px solid var(--border);
  text-align: start;
  white-space: nowrap;
}

th {
  position: sticky;
  inset-block-start: 0;
  background: var(--surface);
}

.numeric {
  text-align: end;
}
```

A focusable scroll region helps keyboard users access horizontal overflow, but do not add `tabindex` to every small table. Label the region and test announcement.

### 80.21 Responsive embedded media
```css
.media-frame {
  overflow: clip;
  border-radius: var(--radius-lg);
  aspect-ratio: 16 / 9;
  background: var(--surface);
}

.media-frame > iframe,
.media-frame > video,
.media-frame > img {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}
```

For third-party embeds, use a lightweight poster/consent placeholder and initialize on intent when possible.

### 80.22 Visually stable async content
```css
.product-media {
  aspect-ratio: 4 / 5;
  background: color-mix(in oklch, var(--surface) 80%, var(--border));
}

.recommendation-slot {
  min-block-size: 18rem;
  contain: layout paint;
}
```

Reserve expected space, but avoid huge empty blocks when content may never appear. Collapse with an explicit completed-empty state rather than a delayed jump.

### 80.23 CSS-only decorative atmosphere
```css
.hero {
  position: relative;
  isolation: isolate;
  overflow: clip;
}

.hero::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: -30%;
  background:
    radial-gradient(circle at 25% 25%,
      color-mix(in oklch, var(--accent) 30%, transparent),
      transparent 35%),
    radial-gradient(circle at 75% 60%,
      oklch(72% 0.17 330 / 0.22),
      transparent 32%);
  filter: blur(3rem);
  pointer-events: none;
}
```

Keep decorative effects isolated, noninteractive, and outside contrast-critical areas. Measure paint cost on real mobile hardware.

### 80.24 Feature detection and fallback
```css
.surface {
  background: rgb(255 255 255 / 0.96);
}

@supports (background: color-mix(in oklch, white, black)) {
  .surface {
    background:
      color-mix(in oklch, var(--surface) 88%, transparent);
  }
}

@supports (backdrop-filter: blur(1rem)) {
  .surface--glass {
    backdrop-filter: blur(1rem);
  }
}
```

Feature detection answers whether syntax is understood, not whether performance is acceptable.

### 80.25 Route-change focus helper
For client-rendered navigation, update the document title and move focus intentionally.

```ts
export function announceRoute(
  title: string,
  heading: HTMLElement | null
): void {
  document.title = `${title} — Product name`;

  requestAnimationFrame(() => {
    if (!heading) return;
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: "start" });
  });
}
```

Only use this after actual route changes, not routine state updates. Avoid leaving every heading in the tab sequence.

### 80.26 A performance-aware 3D/media enhancement contract
Before loading an immersive module, evaluate:

```js
const reduceMotion = matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const saveData = navigator.connection?.saveData === true;
const lowMemory =
  typeof navigator.deviceMemory === "number" &&
  navigator.deviceMemory <= 4;

const canEnhance = !reduceMotion && !saveData && !lowMemory;

if (canEnhance) {
  import("./immersive-hero.js")
    .then(({ mount }) => mount(document.querySelector("#hero-canvas")))
    .catch(() => {
      // Keep the static poster already present.
    });
}
```

These signals are incomplete and not universally available. Use them as hints, never as identity or capability judgments. Also provide a manual pause or static-mode control for expensive experiences.

### 80.27 Structured data example
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Designing a resilient tidal sensor network",
  "datePublished": "2026-05-12",
  "dateModified": "2026-06-02",
  "author": {
    "@type": "Person",
    "name": "Amina Haddad"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Ocean Atlas"
  },
  "mainEntityOfPage": "https://example.com/journal/tidal-sensors"
}
</script>
```

The data must match visible page content. Validate it using the relevant search tooling and schema documentation.

### 80.28 Content security and external links
For links that open a new context, do not add `target="_blank"` by default. When required:

```html
<a
  href="https://external.example/report"
  target="_blank"
  rel="noopener noreferrer">
  Read the independent report
  <span class="visually-hidden">(opens in a new tab)</span>
</a>
```

Opening new tabs can disorient users. Use it selectively and communicate the behavior.

### 80.29 Print style for useful pages
```css
@media print {
  header,
  footer,
  nav,
  .no-print,
  [data-interactive-only] {
    display: none !important;
  }

  body {
    background: white;
    color: black;
    font: 11pt/1.45 Georgia, serif;
  }

  main {
    max-inline-size: none;
  }

  a[href]::after {
    content: " (" attr(href) ")";
    overflow-wrap: anywhere;
  }

  h2,
  h3,
  figure {
    break-inside: avoid;
  }
}
```

For receipts, directions, articles, legal material, and public services, print remains a real use case.

### 80.30 Component readiness checklist
Before publishing a component:

```text
[ ] Semantic element/role is correct
[ ] Accessible name and description are correct
[ ] Keyboard model is documented and tested
[ ] Default, hover, active, focus, selected, disabled states exist
[ ] Loading, success, error, empty states exist where relevant
[ ] Pointer target is large enough
[ ] Contrast passes in every theme/state
[ ] Content can wrap and expand
[ ] RTL and localization have been tested
[ ] Reduced motion is defined
[ ] Forced colors are usable
[ ] Performance cost is measured
[ ] Analytics do not expose sensitive data
[ ] Visual regression examples exist
[ ] Ownership and version are documented
```
