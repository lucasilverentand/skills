# 26. Governance and contribution
Governance should make good contributions easier, not protect the system from its users.

## 26.1 Intake process
Accept requests through one visible path. Capture:

- Problem
- users affected
- current workaround
- frequency
- products or brands affected
- accessibility risk
- deadline
- proposed solution, if any
- evidence
- willing contributors

Do not require a fully designed solution before the problem can enter triage.

## 26.2 Shared-or-local decision test
Ask:

1. Does the same user problem exist in multiple contexts?
2. Is the behavior stable enough to standardize?
3. Would inconsistent behavior harm users?
4. Does central maintenance reduce meaningful cost or risk?
5. Can the system support the variants without becoming incoherent?
6. Is there an owner?
7. Can consumers migrate?
8. Is documentation possible?

Possible outcomes:

- Core system component
- shared domain pattern
- product extension
- experimental package
- local implementation
- rejected or deferred

## 26.3 Contribution lanes
Provide several contribution levels:

### Feedback
Bug report, usage evidence, documentation correction.

### Design proposal
Problem framing, interaction model, visual exploration.

### Implementation contribution
Code, tests, documentation, migration.

### Co-owned contribution
Product team builds with system-team review and shared maintenance.

### Maintainer-led work
Core architecture, high-risk accessibility, or broad breaking changes.

Not every contributor needs to complete every step alone.

## 26.4 Review stages
A substantial contribution may pass through:

1. Triage
2. problem validation
3. scope decision
4. design review
5. content review
6. accessibility review
7. engineering API review
8. implementation
9. testing
10. documentation
11. beta use
12. stable release
13. adoption review

For small fixes, use a lighter path.

## 26.5 Request for comments
Use an RFC for changes that are broad, costly, or difficult to reverse.

RFC topics:

- New token category
- theme architecture
- new foundational component
- major API redesign
- framework migration
- accessibility behavior change
- package restructuring
- deprecation of widely used patterns

## 26.6 Decision records
Use short architecture or design decision records.

```md
# ADR-017: Use semantic color tokens in product code

## Status
Accepted

## Context
Product code currently consumes raw palette tokens, preventing reliable theming.

## Decision
Product code must consume semantic or component tokens. Raw palette tokens remain internal to theme definitions.

## Consequences
- Themes can remap roles.
- Some current usage requires migration.
- A lint rule and codemod will be added.

## Alternatives considered
- Keep raw tokens and document preferred values.
- Generate separate palette files per theme.
```

## 26.7 Exceptions
Create an exception process for legitimate divergence.

Record:

- Rule being bypassed
- reason
- affected users
- scope
- owner
- risk
- accessibility review
- expiry or review date
- migration plan

Exceptions should not be hidden local overrides.

## 26.8 Fork policy
Define:

- When forking is allowed
- naming of forked components
- whether upstream fixes are inherited
- who owns the fork
- how divergence is tracked
- when a fork can return to core
- when the system stops supporting it

A fork without ownership becomes permanent accidental infrastructure.

## 26.9 Consumer council
A consumer council can:

- Surface cross-team needs
- review roadmap priorities
- identify migration blockers
- test proposals
- share local extensions
- prevent the core team from designing in isolation

Keep it representative but small enough to make decisions.

---

# 27. Versioning, releases, and deprecation

## 27.1 Version every consumable artifact
Version:

- Code packages
- token packages
- icon sets
- design libraries
- documentation
- templates
- native assets
- email components

These versions may be coordinated without being numerically identical.

## 27.2 Change categories

### Patch-like change
- Bug fix
- documentation correction
- accessibility fix that does not alter consumer API
- visual adjustment within stated contract

### Additive change
- New component
- new optional prop
- new token
- new variant
- additional platform support

### Breaking change
- Removed or renamed API
- changed default behavior
- changed semantics
- removed token
- DOM change promised as public
- visual change outside accepted tolerance
- theme-contract change
- changed keyboard interaction
- design property renamed in a way that breaks instances

Visual and behavioral changes can be breaking even when TypeScript still compiles.

## 27.3 Release strategy
Possible models:

- Continuous patch releases
- scheduled release train
- independent package releases
- coordinated platform releases
- long-term support channels

Choose based on consumer capacity and dependency structure.

## 27.4 Changelog entries
Each meaningful change should state:

- What changed
- why
- who is affected
- action required
- deadline
- migration steps
- screenshots or examples
- accessibility impact
- support contact

Example:

```md
## Button: `kind` renamed to `tone`

**Affected:** Web component consumers using `kind`.

**Why:** `tone` aligns design and code terminology and supports neutral,
accent, and critical intent consistently.

**Action:** Replace `kind="danger"` with `tone="critical"`.

**Automation:** Run `npx @system/codemods button-tone`.

**Deprecated in:** 4.2
**Removed in:** 5.0
```

## 27.5 Deprecation lifecycle
1. Announce
2. mark as deprecated in design and code
3. provide replacement
4. provide automated migration when possible
5. warn in development
6. measure remaining use
7. contact major consumers
8. remove in a major release
9. archive old guidance

Never deprecate without a usable alternative unless the capability is unsafe or fundamentally unsupported.

## 27.6 Compatibility windows
State:

- Supported package versions
- framework versions
- browser and OS range
- design-library support
- deprecation period
- long-term-support exceptions

Avoid indefinite support promises.

## 27.7 Coordinating design and code changes
For a renamed property:

1. Add the new property to code.
2. retain and deprecate the old property.
3. update the design component.
4. publish mapping guidance.
5. update docs and examples.
6. supply codemod or migration script.
7. measure use.
8. remove after notice.

Design assets often lack automated migration. Plan for instance updates and communication.

---

# 28. Adoption and migration
A technically strong system can fail because migration is too expensive.

## 28.1 Segment consumers
Group by:

- Product importance
- technical stack
- legacy complexity
- team capacity
- release cadence
- accessibility risk
- brand relevance
- willingness to pilot

Do not expect one migration plan to fit every team.

## 28.2 Adoption levels
Define levels such as:

|Level|Description|
|---|---|
|0|No shared system use|
|1|Shared foundations or tokens|
|2|Core components|
|3|Components plus patterns|
|4|Current version and contribution|
|5|Fully integrated with automated checks|

This is more informative than a binary “adopted/not adopted.”

## 28.3 Brownfield migration strategies

### Opportunistic
Migrate when a feature is touched.

Best for:

- Low-risk legacy surfaces
- long timelines
- limited capacity

Risk: mixed UI persists for a long time.

### Component-by-component
Replace one shared component across the product.

Best for:

- Highly repeated elements
- automated codemods
- coordinated regression testing

### Surface-by-surface
Migrate complete pages or workflows.

Best for:

- preserving local coherence
- measuring user outcomes
- redesign opportunities

### Shell-first
Migrate global navigation, tokens, and layout before local content.

Best for:

- visible brand alignment
- shared application infrastructure

### Rebuild boundary
Use the system only in new architecture or major rewrites.

Best for:

- deeply incompatible legacy stacks

Risk: old and new systems coexist indefinitely.

## 28.4 Migration inventory
For each product, record:

- Current library and version
- local components
- raw styling usage
- deprecated patterns
- technical blockers
- visual risk
- owner
- target state
- estimated effort
- migration sequence

## 28.5 Mapping tables
Example:

|Existing|Replacement|Notes|
|---|---|---|
|`.btn-primary`|`<Button tone="accent">`|Remove local hover CSS|
|`OldModal`|`<Dialog>`|Update focus behavior|
|`gray-600` text|`color.text.muted`|Verify context|
|Local spinner|`<ProgressSpinner>`|Add accessible label|
|Custom error banner|`<Alert tone="critical">`|Preserve support code|

## 28.6 Pilot program
Choose pilots that are:

- Representative
- important enough to expose real constraints
- not on an immovable critical deadline
- staffed by engaged teams
- measurable
- willing to document friction

Use pilots to change the system, not just prove it.

## 28.7 Adoption incentives
Adoption improves when the system provides:

- Faster implementation
- tested accessibility
- easier theming
- support
- migration tools
- good documentation
- reliable releases
- visible roadmap
- influence through contribution

Mandates without value lead to hidden workarounds.

## 28.8 Support model
Provide:

- Searchable documentation
- issue templates
- office hours
- chat or forum
- named maintainers
- examples
- migration clinics
- escalation path

Turn repeated support questions into documentation or API improvements.

## 28.9 Measure migration progress
Track:

- Products by adoption level
- version distribution
- deprecated imports
- raw token use
- local duplicates
- migration blockers
- support volume
- defect trends
- time per migration

Measure quality as well as installation. A package can be installed but barely used.

---

# 29. Testing and quality assurance

## 29.1 Test layers

### Static checks
- Types
- linting
- token schema
- forbidden imports
- accessibility rules
- package boundaries

### Unit tests
- State transitions
- utility behavior
- formatting
- token transforms

### Interaction tests
- Keyboard behavior
- pointer behavior
- focus
- controlled state
- dismissal
- validation

### Accessibility tests
- Automated rules
- semantics
- accessible names
- keyboard operation
- focus management
- assistive-technology checks

### Visual regression
- States
- themes
- density
- viewport sizes
- content lengths
- localization
- platform rendering

### Integration tests
- Forms
- overlays
- routing
- server rendering
- application frameworks
- CSS coexistence

### Performance tests
- Bundle size
- rendering cost
- layout shift
- animation smoothness
- asset weight

## 29.2 Test matrix
For each stable component, consider:

```txt
Variants
× states
× themes
× direction
× viewport
× content length
× input method
× browser/platform
```

Testing every combination may be impossible. Use risk-based pairwise coverage and prioritize critical paths.

## 29.3 Visual regression principles
- Use deterministic data.
- freeze animation.
- control fonts and rendering environment.
- review changes rather than blindly updating baselines.
- store a rationale for broad baseline changes.
- include focus, error, loading, and overflow states.
- test theme contrast, not only visual similarity.

## 29.4 Accessibility test ownership
The system team tests component-level guarantees. Product teams still test:

- Page structure
- labels and content
- flow order
- component composition
- route changes
- data states
- task completion
- integrations

A compliant component can be assembled into an inaccessible page.

## 29.5 Manual release checks
Before a major release:

- Keyboard through examples
- inspect focus
- test zoom and reflow
- switch themes
- test long translated text
- inspect loading and errors
- test screen-reader announcements for changed components
- test representative applications
- inspect bundle changes
- verify migration instructions

## 29.6 Quality gates
Possible stable-release gates:

- API approved
- design review passed
- accessibility review passed
- tests passed
- documentation complete
- at least one real-product pilot
- no critical known defect
- owner assigned
- telemetry or feedback path ready
- migration path available

A beta may relax some gates, but the missing guarantees must be explicit.

---

# 30. Measure system health
Metrics should answer whether the system is useful, trusted, adopted, and maintainable.

## 30.1 Metric categories

### Reach
- Number of eligible products
- number of active consumers
- platforms supported
- teams represented

### Adoption
- Products using tokens
- products using core components
- component coverage
- current-version rate
- design-library usage
- deprecated-API use

### Efficiency
- Time to implement common flows
- duplicate implementations removed
- migration time
- support resolution time
- contribution lead time

### Quality
- Accessibility defects
- visual defects
- component regressions
- consistency audit scores
- performance impact
- task success for shared patterns

### Satisfaction
- Consumer confidence
- documentation usefulness
- support quality
- likelihood to reuse
- qualitative friction

### Sustainability
- Maintainer capacity
- review backlog
- issue age
- documentation freshness
- test coverage
- dependency health
- bus factor

## 30.2 Example formulas

### Weighted adoption
```txt
weighted adoption =
  Σ(product importance × adoption level)
  ÷ Σ(product importance × maximum level)
```

### Current-version rate
```txt
consumers on supported versions
÷ all active consumers
```

### Shared-component coverage
```txt
eligible shared component instances
implemented with the system
÷ all eligible instances
```

Define “eligible” carefully. Unique domain components should not lower the score.

## 30.3 Outcome metrics
Connect system work to broader outcomes where evidence supports it:

- Lower accessibility defect rate
- faster feature delivery
- lower brand-update effort
- fewer inconsistent support instructions
- improved task completion
- reduced frontend maintenance
- reduced design rework
- faster onboarding

Do not claim causation from correlation alone. Pair quantitative data with case studies and before/after comparisons.

## 30.4 Qualitative research
Run periodic interviews or surveys:

- What did you try to use?
- Where did you get stuck?
- What did you copy locally?
- Which guidance was missing?
- Which changes created migration pain?
- Where did the system save time?
- What would make you trust it more?

## 30.5 Avoid metric gaming
Bad target:

> Reach 100 components.

Better target:

> Cover the highest-frequency and highest-risk shared interface needs for the three priority products.

Bad target:

> Achieve 100% adoption.

Better target:

> Reach current supported packages on all actively developed priority surfaces, with documented exceptions for legacy systems.

---
