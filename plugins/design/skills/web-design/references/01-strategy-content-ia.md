# Strategy, Content, IA, and Composition
Source: Modern Functional Web Design Mega Handbook 2026.

# Part I — What good modern web design actually is

## 1. The central model
A strong modern website sits at the intersection of six qualities:

|Quality|The question it answers|Failure mode when absent|
|---|---|---|
|**Useful**|Does this help someone complete a real task?|Beautiful irrelevance|
|**Clear**|Can people understand the offer, structure, and next step?|Cognitive fog|
|**Distinctive**|Is it recognizable and ownable?|Template sameness|
|**Inclusive**|Can people with varied abilities, devices, and contexts use it?|Exclusion and legal risk|
|**Fast**|Does it respond quickly and remain stable?|Abandonment and distrust|
|**Maintainable**|Can the team evolve it without breaking consistency?|Design entropy|

Visual quality is not a seventh, isolated layer. It is the visible expression of these six qualities. A beautiful hierarchy makes content clear. Good typography makes reading effortless. Carefully directed motion makes state changes legible. A disciplined component system makes refinement repeatable.

### A compact design equation
> **Perceived quality = clarity × craft × coherence × speed × trust**

The multiplication matters. One near-zero factor can spoil the whole experience. A cinematic landing page that takes twelve seconds to become interactive feels broken. A fast application with weak hierarchy feels cheap. A gorgeous shop with ambiguous shipping and returns feels risky.

### “Stunning” does not mean “busy”
A visually memorable design usually has:

- one dominant idea;
- one or two signature devices;
- excellent typography;
- purposeful imagery;
- careful rhythm and whitespace;
- consistent detail;
- restraint everywhere else.

A page with five competing visual ideas often has no visual idea.

### The two-layer model
Build every experience in two layers:

1. **The durable layer:** semantic structure, content, hierarchy, navigation, accessibility, responsive behavior, and performance.
2. **The expressive layer:** art direction, motion, texture, depth, interactive flourishes, 3D, and unusual composition.

The expressive layer may fail, be reduced, or be unavailable. The durable layer must still work.

---

## 2. A hierarchy of design obligations
When design goals conflict, resolve them in this order:

1. **Safety and legality**
2. **Task completion**
3. **Accessibility**
4. **Comprehension**
5. **Performance and resilience**
6. **Trust**
7. **Brand expression**
8. **Novelty**

This prevents common mistakes such as hiding required controls to preserve a minimalist composition, using low-contrast type to maintain a palette, or blocking a critical interaction behind a complex animation.

### Hard constraints versus soft preferences
Define hard constraints at kickoff:

- supported browsers and devices;
- accessibility conformance target;
- content-management needs;
- localization;
- legal and consent requirements;
- performance budget;
- authentication and security rules;
- analytics;
- launch deadline.

Then define soft preferences:

- mood;
- visual references;
- motion intensity;
- density;
- desired brand traits;
- appetite for experimentation.

Never solve a soft preference by breaking a hard constraint.

### Three levels of visual ambition
**Level 1 — Polished utility**
Best for public services, healthcare workflows, internal tools, high-frequency utilities, and early products. Use strong type, spacing, color, and subtle motion.

**Level 2 — Branded product**
Best for most commercial sites and mature products. Add distinctive art direction, branded iconography, custom illustration, and selected interaction signatures.

**Level 3 — Experiential showcase**
Best for campaigns, entertainment, fashion, cultural work, portfolios, and launches. Use cinematic motion, unusual composition, immersive media, and WebGL selectively. Preserve a direct route to the core task.

A site may mix levels. A luxury brand homepage can be experiential while checkout remains polished utility.

---

## 3. Strategy, audience, and jobs to be done
Do not start with a style. Start with evidence.

### Define the site’s job
Complete this sentence:

> For **[specific audience]**, this site helps them **[complete a task or make a decision]** by providing **[specific value]**, unlike **[current alternative]**.

Then identify:

- the primary visitor;
- their entry context;
- what they already know;
- what they fear;
- what proof they need;
- the most valuable action;
- the smallest useful action;
- the reason to return.

### Useful research inputs
Use a mix of:

- stakeholder interviews;
- customer interviews;
- support tickets;
- sales calls;
- search queries;
- analytics;
- session recordings, with privacy safeguards;
- competitor and adjacent-category analysis;
- content inventory;
- accessibility review;
- performance baseline.

Analytics show what happened. Interviews often reveal why. Neither replaces the other.

### Jobs, questions, and proof
For every major audience, map:

|Stage|Visitor question|Needed content|Needed proof|Desired action|
|---|---|---|---|---|
|Orientation|“What is this?”|Plain-language proposition|Familiar cues|Continue|
|Relevance|“Is it for me?”|Use cases and audience fit|Examples|Explore|
|Evaluation|“Does it work?”|Features, process, limitations|Demo, case study, evidence|Compare|
|Risk|“Can I trust it?”|Security, policies, team, terms|Certification, review, guarantees|Commit|
|Action|“What happens next?”|Clear CTA and expectations|Confirmation|Convert|
|Retention|“How do I succeed?”|Guidance and support|Progress/status|Return|

### Competitive analysis without imitation
Audit competitors along dimensions, not screenshots:

- information architecture;
- positioning;
- proof;
- tone;
- visual codes;
- interaction model;
- performance;
- accessibility;
- conversion path;
- neglected audience needs.

Look outside the category for interaction and art-direction inspiration. A B2B dashboard may learn density management from professional audio software. A museum site may learn browsing from streaming services. Borrow principles, not costumes.

### Define success before visual design
Choose a small metric set:

- task completion rate;
- qualified conversion rate;
- activation;
- completion time;
- error rate;
- retention;
- support-contact rate;
- search success;
- accessibility defects;
- Core Web Vitals pass rate.

Avoid optimizing an easy proxy at the expense of the real outcome. More clicks on a CTA are not valuable if users later abandon a misleading flow.

---

## 4. Content before decoration
Good design clarifies content. It cannot rescue weak content indefinitely.

### Start with a message hierarchy
For each page, define:

1. The one thing a visitor should understand.
2. The one action they should be able to take.
3. The three to five supporting ideas.
4. The proof required.
5. The detail that can be deferred.

This hierarchy should survive as unstyled text. If it does not, layout experiments will conceal rather than solve the problem.

### Write for scanning and depth
People alternate between scanning and reading. Support both:

- descriptive headings;
- short opening summaries;
- strong first sentences;
- concrete labels;
- lists for actual sets;
- tables for comparisons;
- progressive disclosure for detail;
- links with meaningful text;
- visual anchors that correspond to content.

The classic F-shaped scanning pattern describes a symptom of weakly formatted pages, not a design target. Create deliberate landmarks so scanning becomes more efficient.

### Front-load meaning
Prefer:

- “Export invoices as CSV” over “A smarter way to do more”
- “Open until 23:00” over “Plan your visit”
- “Plans from €12/month” over “Pricing that grows with you”
- “No credit card required” near the signup action rather than in a FAQ

### Match copy to decision cost
Low-cost action: concise copy, immediate CTA.
High-cost action: more explanation, proof, objections, process detail, and reversibility.

A €12 purchase and a six-figure enterprise contract should not have the same page density.

### Use plain language without flattening personality
Plain language means recognizable words and direct syntax. It does not require a bland voice. Personality can come through rhythm, metaphor, examples, microcopy, photography, and art direction.

### Content design rules
- One concept per paragraph.
- Put conditions before the action when conditions affect the decision.
- Use verbs for actions.
- Avoid labels such as “Learn more” when a destination can be named.
- Explain consequences before destructive actions.
- State units, dates, currencies, and time zones.
- Do not make legal text visually illegible.
- Write empty states and errors during initial design, not at the end.
- Treat alt text, captions, metadata, and transcripts as content.

---

## 5. Information architecture
Information architecture is the structure users infer from navigation, labels, page relationships, and content order.

### Build around mental models
A company may organize itself by departments. Customers usually organize their needs by tasks. Prefer the customer model.

For example, a university may internally have faculties, offices, and programs. A prospective student may think in terms of “What can I study?”, “Can I afford it?”, “How do I apply?”, and “What is life there like?”

### Core IA methods
- **Content inventory:** list pages, owners, freshness, quality, and purpose.
- **Content model:** define reusable content types and relationships.
- **Card sorting:** discover how audiences group concepts.
- **Tree testing:** test whether labels and hierarchy support finding.
- **Search-log analysis:** reveal vocabulary and missing paths.
- **Top-task analysis:** identify disproportionately important tasks.
- **URL planning:** make stable, legible, hierarchical paths.

### Navigation depth
There is no universal “three-click rule.” Optimize for:

- obvious choices;
- low ambiguity;
- useful scent;
- manageable option counts;
- continuity of context.

Four clear steps are better than two confusing steps.

### Page families
Most sites contain a few page families:

- orientation pages;
- category or hub pages;
- detail pages;
- task pages;
- editorial pages;
- account pages;
- system pages.

Design templates around these families instead of making every page unique.

### Labeling principles
A label should be:

- familiar to the audience;
- specific enough to predict the destination;
- consistent across the site;
- distinct from sibling labels;
- translatable;
- concise without becoming cryptic.

Avoid internal product names in primary navigation unless the audience already knows them.

### URLs and breadcrumbs
Use readable URLs that can survive redesigns. Breadcrumbs help on deep, hierarchical sites but should not replace clear navigation. On small sites, they may add noise.

### Site search
Search becomes essential when:

- the catalog is large;
- the audience knows what it wants;
- content is technical;
- naming varies;
- users return frequently;
- browsing alone is too slow.

Search should handle synonyms, typos, abbreviations, and domain vocabulary where feasible.

---

## 6. Visual hierarchy and composition
Visual hierarchy determines what is seen first, what is grouped, and what appears actionable.

### Hierarchy controls
The main controls are:

- size;
- weight;
- contrast;
- color;
- position;
- whitespace;
- alignment;
- repetition;
- motion;
- depth;
- image salience.

Use fewer controls more deliberately. Making an element bigger, brighter, bolder, animated, and elevated at once may overwhelm rather than clarify.

### Establish a focal path
A strong page usually provides:

1. a primary focal point;
2. a nearby explanatory element;
3. an obvious next action;
4. supporting evidence;
5. deeper content.

Test by blurring the page or viewing it at thumbnail size. The large-scale hierarchy should remain visible.

### Composition models
**Editorial column**
Strong for reading, portfolios, journalism, and thought leadership. Uses asymmetry, typographic contrast, captions, and varied image scale.

**Centered conversion stack**
Strong for landing pages and simple products. Uses a clear proposition, CTA, proof, benefits, objections, and final CTA.

**Split composition**
Strong when copy and visual demonstration deserve equal weight. Ensure reading order remains logical on narrow screens.

**Modular grid or bento**
Strong for varied features and dashboards. Use modules to communicate real grouping; avoid arbitrary boxes around everything.

**Full-bleed cinematic**
Strong for art, entertainment, fashion, launches, and place-based storytelling. Maintain readable overlays and an accessible non-cinematic path.

**Dense workspace**
Strong for professional applications. Hierarchy comes from grouping, alignment, persistent tools, and predictable states rather than generous whitespace.

### Alignment creates confidence
Repeated edges make complex pages feel intentional. Establish a few alignment lines and reuse them. Random offsets can look expressive in a static mockup but chaotic with real content.

### Whitespace is relational
Whitespace does not simply mean “large empty areas.” It expresses grouping. Space inside a group should generally be smaller than space between groups. Dense products can still use excellent whitespace through disciplined micro-spacing.

### Contrast of scale
A memorable composition often combines:

- one very large element;
- ordinary body text;
- small metadata;
- a controlled amount of medium-scale UI.

When everything is large, nothing is large.

### Asymmetry with anchors
Asymmetry feels intentional when anchored by a grid, repeated edge, baseline, or counterweight. Unanchored asymmetry feels accidental.

### The squint test
At key breakpoints:

- squint or blur the screen;
- identify the first three regions perceived;
- verify they match the content priority;
- ensure the primary action is visible but not coercive;
- verify decorative elements do not become the focal point.

---
