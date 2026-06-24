# Interaction, Product Behavior, and Conversion
Source: Modern Functional Web Design Mega Handbook 2026.

# Part III — Interaction and product behavior

## 14. Navigation
Navigation should answer:

- Where am I?
- What can I do here?
- Where else can I go?
- How do I return?
- What is most important?

### Primary navigation
Keep top-level choices conceptually distinct. Group utilities such as account, language, support, and search separately from the main content hierarchy.

A large desktop menu does not need to collapse into a hamburger. Preserve visible navigation where space allows.

### Mobile navigation
Prioritize:

- clear menu trigger and state;
- immediate access to top tasks;
- logical nesting;
- visible back behavior;
- no accidental page scroll behind overlays;
- keyboard and screen-reader support;
- preserved context when closed.

A full-screen menu is a page state, not merely a visual overlay. Manage focus and escape behavior.

### Dropdowns and mega menus
Use a mega menu when categories require grouping and explanation. Do not use it to expose the entire sitemap indiscriminately.

Good behavior includes:

- click support, not hover only;
- predictable opening;
- sufficient pointer tolerance;
- keyboard navigation;
- escape to close;
- visible focus;
- no surprise activation while crossing the menu;
- touch compatibility.

### Sticky navigation
Sticky headers help frequent navigation but consume valuable viewport space. Keep them compact and avoid dramatic hide/reveal behavior that causes layout confusion. On small screens, consider a task-specific sticky action instead.

### Tabs
Tabs switch between related views in the same context. They are not a replacement for page navigation when each view deserves its own URL, history, sharing, or SEO.

### Side navigation
Side navigation suits deep documentation, settings, and complex products. It can support more items and nested hierarchy than a horizontal bar. Provide collapse behavior carefully; icons alone may not be understandable.

### Current location
Use visible current-page states, meaningful page titles, breadcrumbs where useful, and persistent selected states. Do not rely only on color.

### Footer
A useful footer can provide:

- secondary navigation;
- legal and policy links;
- contact;
- language/region;
- social channels;
- newsletter;
- status;
- accessibility statement;
- company details.

Do not make the footer a landfill for unresolved IA.

---

## 15. Search, filtering, sorting, and discovery

### Search box
Use a visible search field when search is a primary task. A lone magnifying-glass icon adds friction and may be overlooked.

Include:

- clear placeholder or label;
- submit behavior;
- recent or suggested queries where useful;
- keyboard access;
- clear button;
- loading state;
- typo tolerance;
- useful no-results state.

A persistent label is more accessible than placeholder-only identification.

### Results hierarchy
A result should clearly expose:

- title;
- content type;
- relevant excerpt;
- metadata;
- matched terms, when helpful;
- destination context;
- status or availability.

### Filters
Good filters:

- match the vocabulary users know;
- show selected state clearly;
- reveal result counts when affordable;
- support clearing one or all;
- retain selections during navigation;
- produce shareable URLs where appropriate;
- work without drag-only controls;
- avoid overwhelming users with rarely used facets.

On mobile, a filter sheet can work well. Show the number of active filters outside the sheet.

### Sorting
Use user-centered labels:

- Price: low to high
- Newest
- Best rated
- Most relevant

Explain “recommended” or “featured” when commercial ranking or personalization affects order.

### No results
Offer:

- spelling correction;
- broadened scope;
- removed filters;
- related categories;
- popular alternatives;
- a support path;
- the original query retained for editing.

Do not show a dead end.

### Discovery modes
Not all discovery is search:

- curated collections;
- related content;
- recently viewed;
- personalized recommendations;
- guided quiz;
- map;
- timeline;
- topic graph;
- editorial pathways.

Be transparent when recommendations are personalized, sponsored, or algorithmically ranked.

---

## 16. Buttons, links, cards, and calls to action

### Buttons versus links
- A **button** changes application state, submits, opens a dialog, or performs an action.
- A **link** navigates to a new resource or location.

Style can vary, but semantics should remain correct.

### Button hierarchy
A useful system includes:

- primary;
- secondary;
- tertiary or ghost;
- destructive;
- icon-only;
- loading;
- disabled or unavailable.

Most regions need at most one primary action. Multiple bright primaries destroy prioritization.

### Labels
Use verb-led, specific labels:

- “Create project”
- “Download invoice”
- “Book 19:30 table”
- “Continue to payment”

Avoid “Submit” when the action can be named.

### Target size
**WCAG 2.2 AA standard:** pointer targets should generally be at least **24 × 24 CSS pixels**, or have sufficient spacing, with listed exceptions. A more comfortable product heuristic is around **44 × 44 CSS pixels** for common touch controls, especially high-frequency or consequential actions.

The visible icon can be smaller than the hit area.

### Disabled buttons
Disabled controls can conceal requirements and are often skipped by keyboard navigation. Prefer an enabled action with clear validation when feasible, or explain why the action is unavailable adjacent to it.

### Links
- Make links visually identifiable.
- Use underlines for inline content links unless another strong, consistent convention exists.
- Preserve visited state in content-heavy sites where revisiting matters.
- Do not remove focus styles.
- Indicate external or download behavior when consequential.
- Write destination-specific text.

### Cards
Decide whether:

- the whole card is clickable;
- only the title is linked;
- multiple independent actions exist.

Avoid nested interactive elements that create invalid or confusing behavior. A stretched-link technique must preserve independent controls and focus clarity.

### CTA systems
A CTA needs four ingredients:

1. clear action;
2. clear value;
3. expected consequence;
4. nearby risk reducer.

Example:

> **Start free workspace**
> No card required. Invite your team after setup.

Do not manufacture urgency or use deceptive scarcity.

---

## 17. Forms
Forms are conversations with constraints.

### Minimize work
Ask only for information required now. Defer profile enrichment. Infer safely when possible. Let users edit inferred values.

### Layout
A single vertical column usually supports scanning and error recovery. Multi-column forms can work for short, strongly related fields such as city and postal code, but often become awkward on small screens.

### Labels
- Use persistent visible labels.
- Place labels close to controls.
- Do not rely on placeholder text as the label.
- Mark optional fields when most are required, or required fields when most are optional.
- Explain format before input when unusual.
- Keep help text adjacent and programmatically associated.

### Input type and autocomplete
Use semantic types and autocomplete tokens:

```html
<label for="email">Email address</label>
<input
  id="email"
  name="email"
  type="email"
  inputmode="email"
  autocomplete="email"
  required>
```

This improves keyboard choice, autofill, and assistive technology.

### Validation
Use layers:

1. HTML constraints for basic correctness;
2. client validation for immediate guidance;
3. server validation as authority.

Validation messages should:

- identify the field;
- explain the issue;
- suggest a fix;
- preserve entered data;
- be announced to assistive technology;
- not rely only on color.

Do not validate aggressively while a person is still typing. Validate on blur or submission for many fields, with exceptions for useful live checks such as password requirements.

### Error summary
For long or important forms, provide an error summary at the top with links to each invalid field. Move focus appropriately after failed submission.

### Passwords and authentication
- Allow paste.
- Support password managers.
- Provide reveal password.
- State requirements before input.
- Avoid arbitrary composition rules when better security policy is possible.
- Offer passkeys where appropriate.
- Do not require memory tests or block autofill.
- Provide recovery that does not depend on inaccessible puzzles.

WCAG 2.2’s accessible-authentication guidance explicitly guards against cognitive-function tests without alternatives or assistance.

### Address and payment
- Use a single name field unless separate parts are genuinely required.
- Design for international addresses.
- Do not assume postal code format.
- Use autocomplete.
- Keep billing address reuse obvious.
- Show total cost before commitment.
- Preserve cart and form state.
- Explain declines without exposing sensitive detail.

### Long forms
Break into steps when:

- sections have a meaningful sequence;
- later questions depend on earlier answers;
- completion takes time;
- users need progress and save/resume;
- one-question-per-page reduces complexity.

Do not split a short form merely to inflate perceived simplicity.

### File upload
Provide:

- accepted formats;
- maximum size;
- upload progress;
- preview;
- remove/replace;
- error recovery;
- keyboard operation;
- non-drag alternative.

### Form checklist
- Logical tab order
- Visible focus
- Labels and descriptions
- Appropriate autocomplete
- Mobile keyboard types
- No data loss on error
- Inline and summary errors
- Accessible status announcements
- Clear submit state
- Duplicate submission prevention
- Success confirmation
- Privacy explanation near sensitive fields

---

## 18. System status, loading, errors, and empty states
A polished interface explains what is happening.

### State inventory
Every interactive component may need:

- default;
- hover;
- active/pressed;
- focus;
- selected;
- disabled/unavailable;
- loading;
- success;
- warning;
- error;
- empty;
- offline;
- permission-limited;
- stale;
- partial;
- skeleton;
- read-only.

Design states before implementation.

### Loading
Use:

- immediate response to input;
- skeletons when page structure is known;
- progress indicators for indeterminate work;
- percentage or step progress for measurable work;
- optimistic UI only when rollback is safe;
- background completion notification for long tasks;
- cancellation where meaningful.

Avoid fake precision. A progress bar stuck at 99% damages trust.

### Skeletons
Skeletons should approximate the final layout closely enough to prevent perceived jumping. Do not animate large shimmering regions indefinitely. Respect reduced-motion preferences.

### Empty states
Differentiate:

- first use;
- no results;
- filtered to zero;
- deleted content;
- permission restriction;
- error;
- offline.

A useful empty state explains what the area is, why it is empty, and the next action. It does not always need illustration.

### Errors
An error message should answer:

1. What happened?
2. What was affected?
3. Was anything saved?
4. What can the user do?
5. Where can they get help?

Use a stable error identifier for support in complex systems, but do not expose internals or security-sensitive traces.

### Toasts
Toasts suit brief, non-critical confirmation. They are poor for:

- information users must act on;
- destructive failure;
- long text;
- irreversible consequences;
- messages requiring comparison.

Do not make toasts disappear before people can read them. Pause on hover/focus where applicable and announce status accessibly.

### Undo
For reversible destructive actions, an immediate undo often works better than a confirmation dialog. Use confirmation when consequences are severe, broad, costly, or irreversible.

### Offline and degraded modes
Explain:

- current connectivity;
- which data is available;
- whether edits are queued;
- when synchronization occurs;
- conflict behavior;
- how to retry.

Resilience is part of the experience.

---

## 19. Motion, transitions, scrolling, and 3D
Motion should explain space, causality, state, or hierarchy. Decoration is secondary.

### Good reasons to animate
- connect an action to a result;
- preserve object continuity;
- reveal hierarchy;
- orient during navigation;
- indicate progress;
- draw attention to a meaningful change;
- express brand personality during low-risk moments.

### Motion hierarchy
Define motion tokens for:

- instant feedback;
- small control transition;
- component entrance/exit;
- page transition;
- ambient loop;
- celebratory moment.

Example starting points:

```css
:root {
  --duration-instant: 80ms;
  --duration-fast: 140ms;
  --duration-medium: 240ms;
  --duration-slow: 420ms;
  --ease-standard: cubic-bezier(.2, .8, .2, 1);
  --ease-enter: cubic-bezier(.16, 1, .3, 1);
  --ease-exit: cubic-bezier(.7, 0, .84, 0);
}
```

These are heuristics. Perceived speed depends on distance, size, and context.

### Performance-friendly properties
Prefer animating `transform` and `opacity` when possible. Layout-changing properties can trigger more work. Measure rather than assuming, and avoid blanket `will-change`; excessive promotion consumes memory.

### Reduced motion
Provide a meaningful reduced-motion mode:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

A global kill switch is a useful fallback, but a refined product can replace spatial transitions with fades and preserve essential progress indicators.

### Scroll-linked animation
Use scroll-linked effects when the content genuinely benefits from temporal sequencing. Risks include:

- loss of user control;
- motion sickness;
- obscured scroll position;
- poor keyboard behavior;
- pinned sections that trap content;
- mobile jank;
- inaccessible reading order;
- overlong narratives.

Ensure the page remains understandable without the effect. Modern CSS scroll-driven animation APIs exist, but support varies by feature; use progressive enhancement.

### Parallax
Keep depth small and slow. Large opposing movement is visually aggressive. Disable or simplify for reduced motion and small devices.

### Page transitions
Page transitions can preserve continuity, especially in galleries, product flows, and apps. Do not delay navigation to showcase an animation. Maintain focus, scroll, history, and reduced-motion behavior.

### 3D and WebGL
Use 3D when it:

- demonstrates a physical product;
- reveals spatial relationships;
- supports exploration;
- embodies the brand idea;
- creates a memorable but optional hero.

Guardrails:

- static poster fallback;
- lazy initialization;
- quality tiers;
- reduced motion;
- pause when off-screen;
- no essential text inside the scene;
- keyboard-accessible alternative;
- capped texture size and draw calls;
- thermal and battery testing;
- mobile fallback;
- context-loss handling.

### Cursor effects
Custom cursors can harm usability and platform familiarity. Use them only as a small enhancement in expressive contexts. Preserve actual pointer affordances, text selection, accessibility, and touch behavior.

### Autoplay and ambient motion
Ambient loops should pause when off-screen, when the tab is hidden, and under reduced-motion/data conditions where appropriate. Avoid multiple independent loops competing for attention.

### Motion review questions
- What does this motion explain?
- Is it interruptible?
- Does it delay the task?
- Is the direction spatially coherent?
- Does focus move correctly?
- Does it work at 200% zoom?
- Is there a reduced version?
- What happens on a low-end phone?
- What happens when frames drop?
- Does it survive content length changes?

---

## 20. Tables, dashboards, and data visualization
Data interfaces should optimize interpretation, comparison, and action.

### Dashboard strategy
A dashboard is not a wall of charts. Define:

- audience;
- decisions;
- monitoring frequency;
- time horizon;
- thresholds;
- actions;
- data freshness;
- uncertainty.

Put decision-critical information first.

### Information layers
A strong dashboard often has:

1. current status;
2. change over time;
3. explanation or drivers;
4. breakdown;
5. action;
6. detailed records.

### Metric cards
A metric card should state:

- metric name;
- current value;
- comparison basis;
- direction;
- time period;
- units;
- freshness;
- definition or tooltip where ambiguous.

A green arrow is meaningless without knowing whether an increase is good.

### Chart selection
- **Line:** continuous trend over time.
- **Bar:** compare discrete categories.
- **Stacked bar/area:** composition plus total, with caution.
- **Scatter:** relationship between two measures.
- **Histogram:** distribution.
- **Box plot:** distribution summary for expert audiences.
- **Map:** spatial pattern, not decoration.
- **Table:** exact values, many dimensions, lookup, or auditing.
- **Pie/donut:** a few simple parts of a whole; often a bar is easier to compare.
- **Gauge:** rare; use when a meaningful bounded threshold matters.

### Chart rules
- Start quantitative axes at zero for bars unless there is a compelling, disclosed reason.
- Label directly when possible.
- Limit series.
- Use annotation for important events.
- Avoid 3D chart distortion.
- Show uncertainty and missing data.
- Make time zones and aggregation explicit.
- Provide data table or accessible summary.
- Do not use color alone.
- Keep interactions keyboard-operable where interactive charts are essential.

### Tables
Tables need:

- meaningful headers;
- alignment by data type;
- sensible column order;
- sticky headers for long tables;
- responsive strategy;
- sorting indication;
- filtering;
- pagination or virtualization;
- row actions;
- selection model;
- loading and empty states;
- accessible captions;
- scope relationships;
- no loss of context during horizontal scroll.

Numbers usually align right; text usually aligns left. Use tabular numerals where useful.

### Responsive tables
Choose based on task:

- horizontal scroll with frozen key column;
- priority columns;
- card transformation for simple records;
- expandable detail;
- alternate compact view;
- dedicated mobile workflow.

Do not collapse complex financial tables into unlabeled card piles.

### Data density
Professional users may value density. Do not impose consumer-style whitespace on workflows requiring comparison. Offer density settings when audiences vary.

### Real-time data
Show:

- connection status;
- last updated time;
- paused state;
- stale state;
- sampling interval;
- alert thresholds;
- whether values are provisional.

Avoid animating every numerical update.

---

## 21. Trust, persuasion, and ethical conversion
Trust is built through coherence, evidence, transparency, and respectful behavior.

### Trust signals by context
- real contact details;
- clear ownership;
- understandable policies;
- secure payment indicators where relevant;
- independent reviews;
- named customers with permission;
- quantified case studies;
- professional photography;
- transparent pricing;
- accessible support;
- status page;
- security documentation;
- certifications with scope and validity;
- clear returns or cancellation;
- accurate availability.

### Evidence hierarchy
Strongest to weakest:

1. verifiable independent evidence;
2. specific measured outcomes with context;
3. detailed customer account;
4. named testimonial;
5. anonymous testimonial;
6. unsupported superlative.

Do not invent precision.

### Social proof placement
Place proof near the claim it supports:

- reliability claim → uptime/status/security;
- quality claim → detailed review or demonstration;
- speed claim → measured workflow;
- fit claim → recognizable use case;
- enterprise claim → procurement/security material.

A giant logo wall is not a complete trust strategy.

### Pricing honesty
Show:

- currency;
- billing period;
- taxes when knowable;
- minimum term;
- usage limits;
- overages;
- renewal behavior;
- cancellation;
- refund policy;
- what changes by plan.

Do not hide mandatory fees until the final step.

### Ethical urgency
Legitimate urgency can be based on:

- real event date;
- actual inventory;
- application deadline;
- genuine capacity;
- temporary price with stated end.

Do not reset timers, fake viewers, preselect paid add-ons, or make rejection harder than acceptance.

### Consent
Consent should be:

- informed;
- specific;
- freely given;
- reversible;
- as easy to decline as accept where required;
- separated from unrelated terms;
- recorded appropriately.

Design cookie and privacy controls as real interfaces, not compliance theater.
