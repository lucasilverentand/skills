# 1. What a design system is
A useful design system has four connected parts:

1. **Language** — shared concepts, names, principles, and rules.
2. **Materials** — tokens, assets, components, patterns, templates, and code.
3. **Operations** — ownership, contribution, review, release, support, and maintenance.
4. **Evidence** — research, accessibility criteria, quality checks, and usage data.

A library without operations usually decays. Rules without reusable materials are hard to follow. Components without language are inconsistent. A system without evidence becomes opinion-driven.

## 1.1 What a design system is not
A design system is not merely:

- A Figma library
- A CSS framework
- A React package
- A brand guideline PDF
- A page of color swatches
- A collection of copied components
- A one-time redesign deliverable
- A rigid rulebook that prevents product judgment
- A visual identity applied without behavioral guidance

Any of those may be part of the system, but none is sufficient by itself.

## 1.2 The system as a product
Treat the design system as an internal product with:

- Users
- Jobs to be done
- A roadmap
- A backlog
- Release notes
- Support channels
- Quality targets
- Adoption metrics
- Research and feedback
- Maintenance costs
- Deprecation policies

Its primary users are often designers and engineers, but may also include writers, marketers, researchers, analysts, product managers, agencies, vendors, localization teams, and accessibility specialists.

## 1.3 The system as a contract
A system creates contracts between teams. Those contracts may describe:

- Which values are stable
- Which parts are customizable
- Which parts are centrally governed
- Which accessibility behavior is guaranteed
- Which platforms are supported
- How breaking changes are communicated
- How visual or behavioral exceptions are approved
- Where the source of truth lives
- Who is responsible when implementation diverges

Write these contracts down. Unwritten expectations become repeated arguments.

## 1.4 The system as a spectrum
Not every organization needs the same level of systemization.

|Level|Description|Appropriate when|
|---|---|---|
|Style guide|Basic visual rules and assets|Small brand or short-lived site|
|Foundation library|Tokens, type, color, spacing, icons|Several related experiences|
|Component library|Reusable interface components|Product teams share interaction needs|
|Pattern library|Components plus workflows and page structures|Multiple teams solve similar user journeys|
|Platform system|Cross-platform packages, tooling, governance|Many products or brands|
|Experience language|Brand, product, service, content, motion, and operations|Large or mature ecosystem|

The smallest effective system is usually better than the largest imaginable system.

---

# 2. Decide what kind of system you are building
Before making components, classify the system. The classification determines its scope, governance, and architecture.

## 2.1 Common system archetypes

### Product system
Optimized for one product or closely related product family.

Typical concerns:

- Dense interaction
- Feature velocity
- Application states
- Forms and validation
- Responsive behavior
- Data display
- Accessibility
- Engineering integration

Examples include SaaS tools, consumer apps, marketplaces, and financial products.

### Brand system
Optimized for recognizable expression across digital touchpoints.

Typical concerns:

- Identity
- Typography
- color
- Art direction
- Photography
- Campaign expression
- Motion
- Editorial voice
- Marketing templates

A brand system may contain fewer interactive components but richer guidance on composition and expression.

### Multi-product platform system
Optimized for consistency across independently managed products.

Typical concerns:

- Shared primitives
- Flexible composition
- Theme boundaries
- API stability
- migration
- federated contribution
- platform parity
- documentation at scale

### Multi-brand system
Optimized for a common functional core with differentiated identity.

Typical concerns:

- Core versus brand-owned tokens
- shared interaction behavior
- theme inheritance
- brand-specific assets
- legal separation
- release coordination
- white-labeling rules

### Service system
Optimized for end-to-end customer journeys that cross channels.

Typical concerns:

- Web, mobile, email, support, physical touchpoints
- content consistency
- status messaging
- transactional communication
- service recovery
- handoffs between systems and teams

### Editorial or media system
Optimized for structured storytelling and content production.

Typical concerns:

- typography
- hierarchy
- templates
- embeds
- media ratios
- metadata
- accessibility
- performance
- CMS integration
- sponsored content rules

### Internal enterprise system
Optimized for operational tools and complex workflows.

Typical concerns:

- information density
- permissions
- tables
- bulk actions
- audit trails
- keyboard access
- long-lived browser support
- product-team autonomy

### Campaign or event system
Optimized for speed and controlled variation over a limited lifespan.

Typical concerns:

- reusable campaign templates
- fast assembly
- clear brand guardrails
- launch deadlines
- analytics
- content operations
- retirement plans

## 2.2 Choose the system boundary
Create a boundary map with three zones.

### Inside the system
The system owns these directly.

Examples:

- Core tokens
- component code
- icon library
- accessibility behavior
- documentation
- release process

### Integrated with the system
The system connects to these but does not fully own them.

Examples:

- CMS
- analytics
- localization platform
- charting library
- email renderer
- asset management system

### Outside the system
These remain product- or campaign-specific.

Examples:

- Business logic
- domain-specific workflows
- unique editorial content
- one-off research prototypes
- experimental visual directions

This map prevents the design system from absorbing every design decision in the organization.

## 2.3 Define expected lifespan
A six-week campaign system should not be governed like a decade-long product platform.

Choose an expected lifespan:

- **Temporary:** weeks to months
- **Medium-term:** one to three years
- **Long-term:** three years or more
- **Indefinite platform:** expected to evolve continuously

The longer the lifespan, the more you need:

- Stable naming
- versioning
- contribution rules
- migration tooling
- compatibility promises
- documentation ownership
- automated testing

## 2.4 Identify the variation model
Decide which kinds of variation the system must support.

|Variation|Example|
|---|---|
|Theme|Light, dark, high contrast|
|Brand|Parent brand, sub-brand, partner brand|
|Density|Comfortable, compact|
|Platform|Web, iOS, Android, desktop|
|Locale|Left-to-right, right-to-left, text expansion|
|Input|Pointer, touch, keyboard, voice|
|Motion|Standard, reduced motion|
|Context|Marketing, product, editorial, transactional|
|Audience|Consumer, professional, child, internal|
|Compliance|Regional legal or accessibility needs|

Variation should be modeled deliberately. Do not hide it in local overrides.

## 2.5 Write non-goals
Non-goals protect the system from becoming unmanageably broad.

Examples:

- The system will not define product strategy.
- The system will not replace usability research.
- The system will not supply every possible page layout.
- The system will not prevent product-specific experimentation.
- The system will not own third-party application styling beyond integration guidance.
- The system will not guarantee pixel identity across platforms when native behavior is more appropriate.
- The system will not standardize domain language that must differ by market.

---

# 3. Define the system brief
A system brief is the decision document that aligns sponsors and contributors before production begins.

## 3.1 Minimum system brief
```md
# System brief

## Purpose
What recurring problem does the system solve?

## Users
Who will consume, contribute to, approve, and maintain it?

## Scope
Which products, brands, platforms, and channels are covered?

## Non-goals
What remains outside the system?

## Principles
Which trade-offs should the system consistently make?

## Deliverables
Which libraries, packages, assets, documentation, and processes will exist?

## Governance
Who owns decisions, contributions, releases, and support?

## Quality bar
Which accessibility, performance, compatibility, and testing standards apply?

## Adoption approach
How will existing teams migrate?

## Success measures
Which outcomes will indicate that the system is working?

## Risks
Which dependencies, organizational constraints, or technical limits may block progress?
```

## 3.2 State the problem without prescribing the solution
Weak problem statement:

> We need a React component library.

Stronger problem statement:

> Five teams currently implement the same interaction patterns independently. This causes inconsistent behavior, repeated accessibility defects, slow delivery, and high migration cost.

The stronger statement leaves room to discover whether a component library, token package, documentation, governance change, or workflow intervention is actually needed.

## 3.3 Define success outcomes
Good success outcomes combine user, delivery, quality, and system health.

Examples:

- New product surfaces use approved foundations without local duplication.
- Teams can assemble common flows without rebuilding accessibility behavior.
- Brand changes propagate through tokens rather than manual editing.
- Component upgrades do not create unexpected visual regressions.
- Designers and engineers use the same component names and variant logic.
- Product teams can request, contribute, and track system work.
- Critical components meet defined accessibility and browser support criteria.
- Adoption reduces repeated implementation work without blocking legitimate variation.

Avoid making “number of components” the primary success metric. A large library can still be unusable.

## 3.4 Define constraints early
Record constraints such as:

- Supported browsers and operating systems
- Existing framework choices
- Legacy CSS or native code
- Localization requirements
- white-label needs
- release schedules
- security restrictions
- legal obligations
- vendor contracts
- design-tool access
- package registry access
- staffing and maintenance capacity

A design system that ignores constraints becomes a parallel idealized world rather than a usable platform.

---

# 4. Audit the current experience
An audit reveals what already exists, where inconsistency is costly, and which assets can be reused.

## 4.1 Audit categories
Audit at least these areas:

- Products and channels
- Brand identities
- UI components
- page templates
- interaction patterns
- content patterns
- tokens and variables
- icons and imagery
- accessibility behavior
- code dependencies
- design libraries
- documentation
- analytics or usage evidence
- team workflows
- release processes
- known defects and support tickets

## 4.2 Inventory interfaces
Capture representative screens rather than every screen. Choose examples that expose:

- Common tasks
- high-traffic surfaces
- complex states
- edge cases
- legacy styling
- product-specific exceptions
- mobile and desktop behavior
- authenticated and unauthenticated states
- errors and empty states
- loading and asynchronous behavior

Create a board or database where each item records:

- Source
- owner
- URL or file location
- platform
- screenshot
- component or pattern type
- known variants
- known issues
- usage frequency
- migration priority

## 4.3 Cluster repeated patterns
Group similar elements visually and behaviorally:

- Buttons
- links
- inputs
- selectors
- cards
- dialogs
- navigation
- tables
- alerts
- empty states
- pagination
- search
- filters
- status indicators
- authentication flows
- checkout or onboarding steps

Do not normalize differences immediately. First ask why differences exist.

A difference may be:

- Accidental duplication
- A historical artifact
- A platform convention
- A valid domain requirement
- A brand distinction
- An accessibility fix
- A temporary experiment
- A sign that two patterns should remain separate

## 4.4 Audit the implementation
For code, inspect:

- CSS values and custom properties
- spacing values
- font declarations
- z-index values
- border radii
- shadows
- colors
- media queries
- component props
- duplicated markup
- third-party dependencies
- accessibility attributes
- test coverage
- bundle size
- version fragmentation

Example CSS-value audit questions:

```txt
How many unique:
- colors?
- font sizes?
- spacing values?
- border radii?
- shadows?
- z-index values?
- breakpoints?
- transition durations?
```

The goal is not to reduce every count to one scale. The goal is to distinguish intentional vocabulary from uncontrolled variation.

## 4.5 Audit workflows and organizational friction
Interview system users. Ask:

- Where do you look for approved patterns?
- Which parts do you trust?
- Which parts do you avoid?
- Where do design and code differ?
- Which tasks are repeatedly rebuilt?
- Which components are hardest to customize?
- How are bugs and requests reported?
- Who decides whether a pattern becomes shared?
- How long do upgrades take?
- What makes teams fork or copy components?
- Which accessibility issues recur?
- Which decisions are regularly debated?

This often reveals that the largest problems are ownership and communication, not visual inconsistency.

## 4.6 Produce an audit report
A useful audit report includes:

1. **Ecosystem map**
2. **Inventory summary**
3. **Repeated patterns**
4. **Inconsistency hotspots**
5. **Accessibility risks**
6. **Technical duplication**
7. **High-value candidates**
8. **Dependencies and blockers**
9. **Recommended scope**
10. **Proposed migration sequence**

## 4.7 Prioritize by value and reach
Use a scoring model.

```txt
priority score =
  frequency
  × number of consuming teams
  × user impact
  × defect reduction
  × strategic relevance
  ÷ implementation cost
```

The formula is not mathematically objective. It forces explicit discussion.

A button may be common, but a date picker or data table may generate more actual cost and risk. Build according to evidence, not tradition.

---

# 5. Choose principles and quality criteria
Principles guide trade-offs when documentation does not cover a specific case.

## 5.1 Characteristics of useful principles
A useful principle is:

- Specific enough to affect decisions
- Broad enough to recur
- Memorable
- Testable through examples
- Paired with a trade-off
- Supported by behavior, not only adjectives

Weak:

> Simple, delightful, modern.

Stronger:

> Prefer progressive disclosure over showing every option at once, unless hiding information would obstruct expert workflows.

## 5.2 Example principle set

### Consistency with purpose
Reuse established behavior when the user’s task is the same. Introduce variation only when the task, platform, brand, or audience materially differs.

### Accessible by default
Core components should provide accessible semantics, focus behavior, contrast, keyboard interaction, and reduced-motion support without requiring each product team to rebuild them.

### Composition over configuration
Prefer small interoperable primitives and slots over components with dozens of unrelated boolean props.

### Clear defaults, explicit exceptions
The recommended path should be obvious. Exceptions should be possible, named, documented, and reviewable.

### Stable meaning, flexible expression
Semantic roles such as “critical action” or “muted text” should remain stable even when visual values differ by theme or brand.

### Native where useful
Respect platform conventions when they improve usability, accessibility, or performance. Cross-platform consistency does not require identical pixels.

### Content is part of the interface
Components should account for real labels, errors, translations, truncation, empty states, and dynamic content.

### Evidence over taste
Use research, usage data, accessibility findings, and implementation constraints to resolve disagreements where possible.

## 5.3 Define a quality model
For every system asset, assess:

- **Usability:** Does it support the intended task?
- **Accessibility:** Can people with varied abilities use it?
- **Consistency:** Does it align with system language?
- **Flexibility:** Can it handle supported contexts?
- **Performance:** Is its runtime and asset cost appropriate?
- **Reliability:** Does it behave predictably in edge cases?
- **Maintainability:** Can it be changed safely?
- **Discoverability:** Can users find and understand it?
- **Adoptability:** Is migration practical?
- **Brand fit:** Does it express the intended identity?

## 5.4 Turn principles into acceptance criteria
Example for “accessible by default”:

- Interactive elements have correct semantics.
- All functionality is keyboard operable.
- Focus order follows visual and task order.
- Focus indicators are visible in every supported theme.
- Status changes are conveyed programmatically.
- Motion respects reduced-motion preferences.
- Component examples include accessible labeling.
- Automated checks and manual keyboard checks pass.
- Known limitations are documented.

A principle without acceptance criteria is difficult to govern.

---
