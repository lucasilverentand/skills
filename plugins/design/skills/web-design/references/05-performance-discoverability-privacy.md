# Performance, SEO, Localization, Privacy, and Resilience
Source: Modern Functional Web Design Mega Handbook 2026.

## 24. Performance and Core Web Vitals
Performance changes perception, conversion, accessibility, energy use, and product quality. Treat it as a design constraint from the first art-direction decision.

### Current Core Web Vitals targets
At the 75th percentile of page loads, separately for mobile and desktop, the “good” thresholds are:

|Metric|What it represents|Good threshold|
|---|---|---:|
|**LCP**|loading of the largest visible content element|**≤ 2.5 s**|
|**INP**|responsiveness across interactions|**≤ 200 ms**|
|**CLS**|unexpected visual instability|**≤ 0.1**|

These thresholds are documented by web.dev. Field data matters because lab tests cannot reproduce every real device, network, cache state, and interaction.

### Set performance budgets
Create budgets before implementation:

- initial HTML;
- critical CSS;
- total CSS;
- initial JavaScript;
- total page JavaScript;
- font bytes and requests;
- hero media;
- total image weight;
- third-party scripts;
- long tasks;
- LCP;
- INP;
- CLS.

A budget should have an owner and enforcement in CI where possible.

### Loading priorities
Prioritize:

1. HTML and critical render path;
2. primary CSS;
3. LCP media;
4. essential fonts;
5. above-the-fold interaction;
6. below-the-fold content;
7. analytics and optional enhancements.

Do not lazy-load the likely LCP image. Consider `fetchpriority="high"` for the true hero image, but do not overuse priority hints.

### LCP improvement
Common LCP work:

- improve server response;
- cache HTML safely;
- use a CDN;
- reduce redirects;
- render meaningful content server-side or statically;
- discover the hero asset in initial HTML;
- avoid loading the hero through late JavaScript;
- compress and size the hero;
- preload selectively;
- reduce render-blocking CSS;
- load fonts efficiently.

### INP improvement
Common INP work:

- reduce JavaScript execution;
- break up long tasks;
- avoid expensive synchronous handlers;
- update only affected DOM;
- virtualize large lists;
- defer noncritical hydration;
- use web workers for suitable computation;
- provide immediate visual feedback;
- minimize third-party code;
- profile actual interactions.

An animation that begins instantly but blocks the final result is not responsive.

### CLS prevention
Reserve space for:

- images;
- video;
- ads;
- embeds;
- banners;
- cookie UI;
- async widgets;
- web fonts;
- dynamic notices.

Set `width` and `height` or `aspect-ratio`. Insert new content in predictable places. Avoid pushing the current reading position unexpectedly.

### JavaScript strategy
Ask of every dependency:

- Is it required?
- Can the platform do it?
- Can it load later?
- Can it run only on relevant pages?
- Can it be replaced with a smaller module?
- Does it add main-thread work?
- What happens when it fails?

Use code splitting by route and behavior. Avoid shipping an entire animation, chart, date, or utility library for one small effect.

### Rendering strategy
Choose based on content and interaction:

- static generation for stable public content;
- server rendering for dynamic, indexable pages;
- streaming for progressive delivery;
- client rendering for app-like private surfaces where justified;
- islands or partial hydration for mostly static pages with isolated interaction.

Framework choice does not determine performance; implementation does.

### CSS strategy
- remove unused CSS;
- avoid giant global bundles;
- use cascade layers intentionally;
- keep selectors understandable;
- inline only genuinely critical CSS;
- prevent layout thrash;
- avoid expensive paint effects over large areas;
- limit blur, filters, and large fixed backgrounds.

### Font performance
- limit families and styles;
- subset carefully;
- use modern compression;
- preload only immediate files;
- choose fallback metrics;
- use `font-display`;
- consider system UI fonts for product surfaces;
- test the visual cost of late swaps.

### Image performance
- send dimensions appropriate to display;
- use responsive source selection;
- compress based on visual tolerance;
- lazy-load below the fold;
- decode asynchronously where helpful;
- remove metadata when appropriate;
- use content-aware art direction;
- avoid huge images merely scaled by CSS.

### Third parties
Third-party scripts can dominate performance and privacy risk. Inventory:

- analytics;
- tag managers;
- chat;
- A/B testing;
- ads;
- social embeds;
- consent managers;
- personalization;
- video players.

Load on consent and intent where appropriate. Set budgets and remove tools that no longer earn their cost.

### Performance measurement stack
Use:

- field Core Web Vitals/RUM;
- Chrome User Experience Report where available;
- Lighthouse for repeatable lab diagnostics;
- browser performance profiles;
- network waterfall;
- coverage tools;
- bundle analysis;
- synthetic tests on representative devices;
- real low-end hardware;
- throttled and unstable networks.

### Performance and visual ambition
Rich visuals are possible when orchestrated:

- render a static first frame immediately;
- progressively initialize;
- use lower fidelity on constrained devices;
- suspend off-screen work;
- pause hidden tabs;
- preload only likely assets;
- make immersion optional;
- preserve navigation and content before effects.

### Practical budgets by project style
These are heuristics, not standards:

|Project|Initial experience priority|
|---|---|
|Editorial/content|HTML and text extremely early; minimal JS|
|E-commerce|fast product imagery, filters, cart stability|
|SaaS marketing|strong hero with restrained script|
|Dashboard|interaction latency and incremental data|
|Portfolio/showcase|static poster first, progressive effects|
|Campaign|bounded experience with explicit fallback|

---

## 25. SEO, structured data, and discoverability
SEO starts with useful content, crawlable structure, stable URLs, and good page experience. Visual design should strengthen these properties.

### Technical foundation
- indexable HTML for public content;
- unique title and meta description;
- canonical URLs;
- correct status codes;
- crawlable links;
- XML sitemap where useful;
- robots controls used deliberately;
- mobile parity;
- HTTPS;
- no essential content available only after fragile interaction;
- accessible heading structure;
- fast, stable pages.

### Mobile-first indexing
Google primarily uses the mobile version of content for indexing. Ensure mobile has:

- equivalent primary content;
- equivalent meaningful alt text;
- equivalent structured data;
- crawlable media;
- no blocked critical resources;
- sensible lazy loading;
- the same metadata intent.

Do not remove substantive content from mobile solely to make the layout sparse. Collapse it carefully when appropriate, but keep it available.

### On-page content
A page should have:

- a clear topic;
- descriptive title;
- one main heading;
- useful subheadings;
- direct answer or proposition;
- supporting detail;
- contextual internal links;
- meaningful media;
- authorship and freshness where relevant.

Write for people who arrive with a specific need. Keyword repetition is not a design strategy.

### Structured data
Use structured data that matches visible page content and a supported type, such as:

- Product;
- Article;
- Event;
- Organization;
- LocalBusiness;
- BreadcrumbList;
- Recipe;
- JobPosting;
- Course;
- VideoObject.

Validate it and keep it synchronized with displayed information. Structured data can make content eligible for enhanced search appearances; it does not guarantee them.

### Internal linking
Design links into:

- topic hubs;
- related content;
- breadcrumbs;
- navigation;
- article context;
- product alternatives;
- next steps.

Avoid orphaned pages.

### Image and video discoverability
- descriptive filenames where practical;
- proper alt text;
- captions/context;
- image sitemaps for image-heavy sites when useful;
- stable media URLs;
- video metadata and transcripts;
- poster frames;
- fast delivery.

### Page experience
Google’s guidance considers overall page experience, but no single visual or performance score guarantees ranking. Optimize for real usability: Core Web Vitals, mobile experience, secure delivery, non-intrusive overlays, and accessible content.

### AI-assisted search and answer systems
The durable strategy remains:

- publish original, useful material;
- make entities and relationships clear;
- provide direct summaries;
- expose evidence;
- use structured headings;
- keep crawlable text;
- identify authors and sources;
- update stale content;
- avoid mass-produced generic pages.

Answer-first summaries can help both people and retrieval systems, especially on technical, support, and informational pages.

### Avoid SEO-driven UX damage
Do not:

- create giant introductory blocks that bury the task;
- repeat near-identical copy across categories;
- add FAQ accordions with no user need;
- use misleading headings;
- interrupt immediately with overlays;
- create location pages without genuine local value;
- hide content through inaccessible widgets.

---

## 26. Internationalization and localization
Internationalization is an architecture concern, not a final translation step.

### Design for expansion
Translated text may be much longer or shorter. Test:

- buttons;
- navigation;
- tabs;
- cards;
- forms;
- dialogs;
- tables;
- charts;
- captions;
- badges;
- empty states.

Avoid fixed widths and single-line assumptions.

### Writing and content
- avoid idioms in critical instructions;
- keep sentences structurally clear;
- separate text from code;
- use placeholders rather than concatenating fragments;
- provide translator context;
- allow grammatical variation;
- localize images containing text;
- use real locale data.

### Dates and time
Display:

- local date order;
- month names where ambiguity matters;
- 12/24-hour conventions;
- time zone for remote events;
- daylight-saving behavior;
- relative time with an exact value available.

“Tomorrow at 9” can be dangerously ambiguous across zones.

### Numbers and currency
Use locale-aware formatting. Clarify:

- decimal separator;
- grouping;
- currency symbol/code;
- tax inclusion;
- conversion;
- measurement units;
- rounding.

Do not assume currency from language alone.

### Names and addresses
- avoid forcing first/last-name models unnecessarily;
- permit diacritics and non-Latin scripts;
- handle variable address structures;
- do not assume postal codes exist;
- do not require state/province universally;
- support local phone formats;
- validate flexibly.

### Right-to-left design
For Arabic, Hebrew, and other RTL contexts:

- mirror layout flow where appropriate;
- keep media controls and universally directional symbols logical;
- use CSS logical properties;
- test mixed-direction content;
- inspect icons such as arrows and progress;
- support bidi isolation for user-generated text.

```css
.card {
  margin-inline-start: 1rem;
  padding-inline: 1.25rem;
  border-inline-start: 3px solid var(--accent);
}
```

### Font coverage
Select fonts with required scripts or plan compatible fallbacks. Matching weight, proportions, and tone across scripts requires art direction, not merely glyph availability.

### Locale selection
- use a recognizable language/region control;
- name languages in their own language where useful;
- preserve current page when switching;
- do not rely only on flags;
- remember preference;
- allow users to override automatic detection.

### Cultural adaptation
Review:

- imagery;
- gesture;
- color connotations;
- icons;
- examples;
- humor;
- formality;
- reading conventions;
- regulatory text;
- payment methods;
- address and fulfillment expectations.

Localization may require content and flow changes, not word substitution.

---

## 27. Privacy, security, resilience, and consent
Security and privacy affect interface design directly.

### Secure interaction principles
- explain why sensitive data is requested;
- minimize collection;
- mask only where useful;
- let users verify critical values;
- show secure context without theatrical padlocks;
- preserve password-manager compatibility;
- provide session-expiry warning;
- make device/session management understandable;
- avoid exposing account existence unnecessarily;
- protect destructive actions;
- log important account changes visibly.

### Authentication UX
Offer suitable options:

- passkeys;
- password manager–friendly passwords;
- magic links where risk allows;
- authenticator apps;
- recovery codes;
- federated sign-in with clear consequences.

Do not use email or SMS one-time codes without handling delays, autofill, resend timing, and changed contact details.

### Permissions
Ask permissions in context, after explaining value. Do not request camera, location, notifications, clipboard, or contacts on first load without a clear need.

### Consent interface
A consent choice should not use:

- a bright “accept” and hidden “reject”;
- preselected optional categories;
- confusing double negatives;
- repeated nagging after a valid refusal;
- bundled unrelated purposes;
- inaccessible modal behavior.

### Privacy by default
Default to the least data necessary. Make retention, deletion, export, and communication preferences findable.

### Resilience
Design for:

- slow APIs;
- partial failures;
- stale cache;
- offline mode;
- authentication expiry;
- duplicate actions;
- retries;
- rate limits;
- service degradation;
- conflict resolution.

### Destructive actions
Use escalating friction:

|Consequence|Pattern|
|---|---|
|easily reversible|action + undo|
|moderate and localized|concise confirmation|
|broad or costly|detailed confirmation with impact|
|irreversible/high risk|reauthentication, explicit item name, delay or recovery window|

Typed confirmation should be reserved for serious consequences; overuse becomes ritual.

### User-generated content
Plan:

- reporting;
- blocking;
- moderation state;
- content warnings;
- appeals;
- rate limiting;
- privacy controls;
- identity visibility;
- deletion and archival;
- accessible moderation tools.

### Security messages
Be specific enough to help, but do not reveal exploitable detail. Provide:

- affected action;
- current state;
- safe next step;
- support route;
- timestamp;
- device/location context for account events.

---
