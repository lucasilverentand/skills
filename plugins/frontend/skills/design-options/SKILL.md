---
name: design-options
description: Generates interactive HTML design explorations for UI features — produces a single self-contained HTML file with multiple design variants and a switcher to compare them. Supports card-level components through full screen layouts using skeleton wireframe elements. Use when exploring design directions, comparing layout options, mocking up a feature before building it, or presenting UI alternatives.
allowed-tools: Read Write Bash Glob Grep
---

# Design Options

## Decision Tree

- What are you doing?
  - **Generating design options for a feature** -> follow "Generating" below
  - **Adding a variant to an existing file** -> read the file, add a new `<section data-variant>`, increment the variant count in the switcher
  - **Adjusting an existing variant** -> read the file, edit the specific `<section data-variant>` block

## Generating

### 1. Understand the feature

Ask if unclear:

1. What's the feature or component? (e.g. "pricing card", "settings page", "onboarding flow")
2. What scope — card/component, partial layout, or full screen?
3. Any constraints — dark/light, mobile-first, specific brand colors?
4. How many variants? Default to 3. Can be any number (2–6+).

### 2. Decide the scope

| Scope | When | Skeleton approach |
|---|---|---|
| **Component** | A card, button group, form, modal, nav bar | Render the component with realistic placeholder content, surrounded by a subtle container |
| **Partial layout** | A section of a page — hero, feature grid, sidebar + content | Skeleton the surrounding page chrome, fully render the focus area |
| **Full screen** | An entire view — dashboard, settings, landing page | Render everything with skeleton placeholders for content areas |

### 3. Write the HTML

Produce a **single self-contained HTML file** — all CSS and JS inline, no external dependencies. Follow the structure and conventions below exactly.

#### File structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Options — {Feature Name}</title>
  <style>/* all styles */</style>
</head>
<body>
  <!-- Switcher bar -->
  <nav class="switcher">...</nav>

  <!-- One section per variant (any number) -->
  <section data-variant="1" class="variant active">...</section>
  <section data-variant="2" class="variant">...</section>
  <!-- ...add as many as needed... -->

  <script>/* switcher logic */</script>
</body>
</html>
```

#### Switcher bar

Hidden by the serve tool but required for variant metadata. One button per variant — label with A, B, C, D, E, F etc.

```html
<nav class="switcher">
  <span class="switcher-title">{Feature Name}</span>
  <div class="switcher-buttons">
    <button class="switcher-btn active" data-target="1">A<span class="switcher-hint">{Variant A description}</span></button>
    <button class="switcher-btn" data-target="2">B<span class="switcher-hint">{Variant B description}</span></button>
    <!-- ...one per variant, data-target must match data-variant on sections... -->
  </div>
</nav>
```

#### Skeleton elements

Use these CSS classes to represent placeholder content:

| Class | Renders as |
|---|---|
| `.skel` | Generic gray rounded block (set width/height inline) |
| `.skel-text` | Text-line placeholder (full width, 12px tall, stacked with gap) |
| `.skel-text.short` | Short text line (60% width) |
| `.skel-text.heading` | Heading placeholder (16px tall, 40% width) |
| `.skel-avatar` | Circle (40×40) |
| `.skel-img` | Image placeholder rectangle with subtle icon |
| `.skel-button` | Button-shaped placeholder |
| `.skel-nav` | Horizontal nav bar placeholder |
| `.skel-sidebar` | Vertical sidebar placeholder |

Skeleton elements should use a subtle pulse animation to feel alive.

#### Design conventions

- **Realistic content in the focus area** — don't skeleton the part being designed, use actual text, icons (inline SVG), and plausible data
- **Skeleton everything else** — surrounding chrome, adjacent sections, background content
- **Each variant should be meaningfully different** — not just color swaps. Vary layout, hierarchy, density, interaction patterns
- **Use a neutral base palette** — `#f8f9fa` background, `#1a1a2e` text, `#e2e8f0` skeleton fill. Accent colors can vary per variant
- **Responsive** — variants should work at mobile and desktop widths. Use CSS grid/flexbox
- **Subtle variant label** — bottom-left corner shows "Variant A — {description}" so the user knows what they're looking at
- **Keyboard navigation** — left/right arrow keys to switch variants, number keys 1-9 for direct access

#### CSS foundations

Always include these base styles (customize per feature):

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #f0f2f5; color: #1a1a2e; }

/* Switcher */
.switcher { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: #1a1a2e; color: #fff; padding: 10px 20px; display: flex; align-items: center; gap: 16px; font-size: 13px; }
.switcher-title { font-weight: 600; white-space: nowrap; }
.switcher-buttons { display: flex; gap: 6px; }
.switcher-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 5px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; position: relative; }
.switcher-btn:hover { background: rgba(255,255,255,0.18); }
.switcher-btn.active { background: #fff; color: #1a1a2e; }
.switcher-hint { display: none; position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: #1a1a2e; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 11px; white-space: nowrap; pointer-events: none; }
.switcher-btn:hover .switcher-hint, .switcher-btn.active .switcher-hint { display: block; }

/* Variants */
.variant { display: none; padding-top: 52px; min-height: 100vh; }
.variant.active { display: block; }

/* Variant label */
.variant-label { position: fixed; bottom: 16px; left: 16px; background: rgba(26,26,46,0.85); color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 12px; z-index: 1000; backdrop-filter: blur(8px); }

/* Skeleton elements */
.skel { background: #e2e8f0; border-radius: 8px; animation: pulse 2s ease-in-out infinite; }
.skel-text { height: 12px; background: #e2e8f0; border-radius: 4px; animation: pulse 2s ease-in-out infinite; width: 100%; }
.skel-text.short { width: 60%; }
.skel-text.heading { height: 16px; width: 40%; }
.skel-text.xshort { width: 35%; }
.skel-avatar { width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; animation: pulse 2s ease-in-out infinite; flex-shrink: 0; }
.skel-img { background: #e2e8f0; border-radius: 8px; animation: pulse 2s ease-in-out infinite; display: flex; align-items: center; justify-content: center; color: #c1c9d4; min-height: 120px; }
.skel-button { height: 36px; width: 100px; background: #e2e8f0; border-radius: 6px; animation: pulse 2s ease-in-out infinite; }
.skel-nav { height: 48px; background: #e2e8f0; border-radius: 0; animation: pulse 2s ease-in-out infinite; }
.skel-sidebar { width: 240px; background: #e8ecf1; border-radius: 0; animation: pulse 2s ease-in-out infinite; min-height: calc(100vh - 52px); flex-shrink: 0; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

#### JavaScript

```js
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.switcher-btn');
  const variants = document.querySelectorAll('.variant');
  const label = document.querySelector('.variant-label');
  const descriptions = Object.fromEntries(
    [...buttons].map(b => [b.dataset.target, b.querySelector('.switcher-hint')?.textContent || ''])
  );

  function show(n) {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.target === n));
    variants.forEach(v => v.classList.toggle('active', v.dataset.variant === n));
    const btn = document.querySelector(`.switcher-btn[data-target="${n}"]`);
    if (label && btn) {
      label.textContent = `Variant ${btn.textContent.trim().charAt(0)} — ${descriptions[n] || ''}`;
    }
  }

  buttons.forEach(b => b.addEventListener('click', () => show(b.dataset.target)));

  document.addEventListener('keydown', e => {
    const current = document.querySelector('.switcher-btn.active');
    const all = [...buttons];
    const idx = all.indexOf(current);
    if (e.key === 'ArrowRight' && idx < all.length - 1) show(all[idx + 1].dataset.target);
    if (e.key === 'ArrowLeft' && idx > 0) show(all[idx - 1].dataset.target);
    if (e.key >= '1' && e.key <= '9') {
      const target = all[parseInt(e.key) - 1];
      if (target) show(target.dataset.target);
    }
  });

  show('1');
});
```

### 4. Save and present

Save to a descriptive filename: `{feature-name}-design-options.html`

Default location: current working directory, or a `designs/` folder if one exists.

Serve it with the pick tool to collect the user's choice. Run it in the background — the server stays up until the user picks, then exits and you get notified:

```bash
# Run with Bash tool's run_in_background: true
bun run plugins/frontend/skills/design-options/tools/serve-options.ts {filename}
```

This opens the browser with a "Pick this variant" bar at the bottom. The user can:

- Switch between variants with the top bar or arrow keys
- Type optional feedback in the text field
- Hit "Pick this variant" (or Cmd+Enter) to submit

When the user picks, the server stops itself and the background task completes. The result is printed to stdout and saved to `{filename}.pick.json`:

```json
{
  "variant": "2",
  "label": "B",
  "description": "Horizontal comparison table",
  "feedback": "like this but make the rows more compact"
}
```

Use the returned pick and feedback to proceed — implement the chosen variant, iterate on it, or generate a refined version.
