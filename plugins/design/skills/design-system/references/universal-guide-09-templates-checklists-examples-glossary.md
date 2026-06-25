# 34. Working templates
The following templates can be copied directly into an issue tracker or repository.

## 34.1 Component proposal
```md
# Component proposal: [name]

## Problem
Describe the recurring user or implementation problem.

## Evidence
- Products or brands affected:
- Existing implementations:
- Frequency:
- Known defects:
- Research or support evidence:

## Proposed scope
What capability should be shared?

## Non-goals
What should remain local or separate?

## Similar system assets
Which components or patterns are related?

## Required variants and states
List only evidence-backed needs.

## Accessibility risks
Keyboard, semantics, focus, announcements, motion, contrast, or input concerns.

## Content and localization risks
Label length, dynamic content, directionality, terminology, or formatting.

## Technical constraints
Platforms, frameworks, performance, dependencies, or compatibility.

## Contributors
Who can design, implement, test, document, and maintain it?

## Success
How will we know the shared solution is useful?
```

## 34.2 Component specification
```md
# [Component]

Status: Proposed | Beta | Stable | Deprecated
Owner:
Design asset:
Code package:
Introduced:

## Purpose

## Use when

## Do not use when

## Anatomy

## API
### Properties
### Events
### Slots
### Methods
### Tokens

## Variants

## States

## Behavior
### Pointer and touch
### Keyboard
### Focus
### Responsive
### Async
### Directionality

## Semantics

## Content guidance

## Accessibility contract

## Consumer responsibilities

## Theming and extension

## Examples
### Typical
### Long content
### Empty
### Loading
### Error
### Small viewport
### Alternate theme

## Testing matrix

## Known limitations

## Migration

## Decision history
```

## 34.3 Request for comments
```md
# RFC-[number]: [title]

## Status
Draft | Review | Accepted | Rejected | Superseded

## Authors

## Review deadline

## Summary

## Context and problem

## Goals

## Non-goals

## Proposal

## Detailed design
- Concepts
- APIs
- tokens
- behavior
- migration
- tooling

## Accessibility impact

## Brand and content impact

## Platform impact

## Security and privacy impact

## Performance impact

## Alternatives considered

## Risks

## Rollout

## Open questions

## Decision
Completed after review.
```

## 34.4 Token proposal
```md
# Token proposal: [token name]

## Semantic purpose

## Examples of use

## Why an existing token is insufficient

## Proposed name

## Type

## Values by mode or brand

## Contrast or accessibility analysis

## Consumers affected

## Migration from current values

## Owner

## Review date
```

## 34.5 Pattern specification
```md
# Pattern: [name]

## User job

## Context

## Preconditions

## Flow

## Invariants

## Supported variation

## Components

## Content

## Loading, empty, success, error, and cancellation

## Accessibility

## Responsive and platform behavior

## Analytics

## Examples

## Anti-patterns

## Owner and review cadence
```

## 34.6 Contribution pull request
```md
## Problem solved

## Related proposal or RFC

## Scope

## Screenshots or recordings

## API changes

## Token changes

## Accessibility checks
- [ ] Keyboard
- [ ] Focus
- [ ] Semantics
- [ ] Name/description
- [ ] Contrast
- [ ] Zoom/reflow
- [ ] Reduced motion
- [ ] Assistive technology, where needed

## Test coverage
- [ ] Static
- [ ] Unit
- [ ] Interaction
- [ ] Visual
- [ ] Integration

## Documentation

## Migration impact

## Release category

## Maintainer
```

## 34.7 Design review record
```md
# Design review: [asset]

Date:
Reviewers:
Status:

## Problem and context

## System assets reused

## New decisions

## States reviewed

## Content reviewed

## Responsive behavior reviewed

## Accessibility reviewed

## Exceptions

## Follow-up actions

## Final decision
```

## 34.8 Exception request
```md
# System exception: [title]

## Rule or asset affected

## Product and surface

## Reason

## Alternatives tried

## User impact

## Accessibility impact

## Technical impact

## Scope and duration

## Owner

## Expiry/review date

## Return-to-system plan

## Approval
```

## 34.9 Release notes
```md
# Release [version] — [date]

## Highlights

## Added

## Changed

## Fixed

## Accessibility

## Deprecated

## Removed

## Migration actions

## Design-library changes

## Platform differences

## Known issues

## Contributors
```

## 34.10 Deprecation notice
```md
# Deprecation: [asset]

Deprecated from:
Removal target:
Affected platforms:

## Why

## Replacement

## Migration

## Automated tooling

## Behavior differences

## Support

## Remaining usage

## Removal criteria
```

## 34.11 Audit worksheet
```md
# Experience audit item

Product/channel:
Owner:
Location:
Platform:
Last updated:

## Type
Foundation | Component | Pattern | Template | Asset | Workflow

## Screenshot or example

## Current implementation

## Variants

## Frequency

## Accessibility concerns

## Content concerns

## Technical concerns

## Similar items

## Recommended action
Keep | Consolidate | Replace | Investigate | Retire

## Priority rationale
```

## 34.12 Accessibility test report
```md
# Accessibility test: [asset/version]

Tester:
Date:
Environment:

## Scope

## Automated checks

## Keyboard

## Focus

## Screen reader

## Zoom and reflow

## Contrast and forced colors

## Reduced motion

## Touch or voice input

## Findings
| Severity | Finding | Reproduction | Recommendation | Owner |
|---|---|---|---|---|

## Known limitations

## Release recommendation
Pass | Conditional pass | Block
```

## 34.13 Adoption plan
```md
# Adoption plan: [product]

Owner:
Target release:
Current system version:
Target version:

## Current inventory

## Target adoption level

## Migration sequence

## Code changes

## Design changes

## Content changes

## Test plan

## Dependencies

## Exceptions

## Rollback

## Training and support

## Success measures
```

---

# 35. Readiness checklists

## 35.1 Foundation readiness
- [ ] Purpose and scope are documented.
- [ ] Values come from audited needs.
- [ ] Semantic roles are defined.
- [ ] Light and dark or other required modes are tested.
- [ ] Accessibility constraints are recorded.
- [ ] Platform transformations are specified.
- [ ] Naming is stable and searchable.
- [ ] Examples and anti-examples exist.
- [ ] Owner is assigned.
- [ ] Change policy is defined.

## 35.2 Token readiness
- [ ] Token has a stable semantic purpose.
- [ ] An existing token cannot serve the role.
- [ ] Name follows taxonomy.
- [ ] Type is valid.
- [ ] Aliases resolve without circularity.
- [ ] Required modes have values.
- [ ] Theme contract passes.
- [ ] Documentation is generated or updated.
- [ ] Code and design outputs align.
- [ ] Migration impact is understood.

## 35.3 Component design readiness
- [ ] User problem is validated.
- [ ] Shared scope is justified.
- [ ] Anatomy is named.
- [ ] Variants have semantic meaning.
- [ ] State matrix is complete.
- [ ] Responsive behavior is defined.
- [ ] Long and translated content is tested.
- [ ] Accessibility behavior is designed.
- [ ] Composition and extension are defined.
- [ ] Similar components are distinguished.
- [ ] Design and code API concepts align.

## 35.4 Component stable-release readiness
- [ ] Typed implementation is complete.
- [ ] Native semantics are correct.
- [ ] Keyboard behavior passes.
- [ ] Focus management passes.
- [ ] Automated accessibility checks pass.
- [ ] Manual accessibility checks pass.
- [ ] Visual regression coverage exists.
- [ ] Themes and modes pass.
- [ ] Directionality passes where supported.
- [ ] Server/client environments pass where relevant.
- [ ] Performance budget passes.
- [ ] Documentation is complete.
- [ ] Examples compile.
- [ ] Real-product pilot completed.
- [ ] Owner and support path exist.
- [ ] Release and migration notes are ready.

## 35.5 Pattern readiness
- [ ] User job and context are clear.
- [ ] Flow includes error and cancellation.
- [ ] Invariants and variables are separated.
- [ ] Components are identified.
- [ ] Content guidance is included.
- [ ] Accessibility is evaluated end to end.
- [ ] Responsive and cross-platform behavior is covered.
- [ ] Analytics do not distort the user flow.
- [ ] Real examples are included.
- [ ] Pattern owner exists.

## 35.6 Documentation readiness
- [ ] Summary is understandable without internal context.
- [ ] Use and do-not-use guidance exist.
- [ ] Examples cover real states.
- [ ] Design and code links are current.
- [ ] Accessibility contract is explicit.
- [ ] Consumer responsibilities are explicit.
- [ ] Version and status are visible.
- [ ] Search synonyms are included.
- [ ] Page owner is listed.
- [ ] Feedback route works.

## 35.7 Theme readiness
- [ ] Required token contract is complete.
- [ ] Contrast passes for each role.
- [ ] Focus remains visible.
- [ ] Images and icons are appropriate.
- [ ] Charts are tested.
- [ ] Disabled and selected states remain distinct.
- [ ] Overlays and elevation work.
- [ ] Native controls are reviewed.
- [ ] Automated validation passes.
- [ ] Unsupported combinations are documented.

## 35.8 Multi-brand readiness
- [ ] Shared behavior is separated from expression.
- [ ] Brand-owned values have owners.
- [ ] Each brand fulfills semantic contracts.
- [ ] Cross-brand component variants are bounded.
- [ ] Brand-specific patterns are identified.
- [ ] Asset licensing is recorded.
- [ ] Voice and terminology differences are documented.
- [ ] Release coordination is defined.
- [ ] Product fallback behavior exists.

## 35.9 Migration readiness
- [ ] Consumer inventory exists.
- [ ] Target state is defined.
- [ ] Mapping table is complete.
- [ ] Breaking differences are documented.
- [ ] Codemods or scripts are available where feasible.
- [ ] Pilot product passes.
- [ ] Regression plan exists.
- [ ] Product owners have capacity.
- [ ] Rollback or containment is defined.
- [ ] Deprecation timeline is communicated.

## 35.10 Quarterly system health review
- [ ] Adoption data reviewed.
- [ ] Version fragmentation reviewed.
- [ ] Accessibility defects reviewed.
- [ ] Support themes reviewed.
- [ ] Documentation freshness reviewed.
- [ ] Dependency health reviewed.
- [ ] Unowned assets reviewed.
- [ ] Exceptions reviewed.
- [ ] Contribution lead time reviewed.
- [ ] Roadmap re-prioritized.
- [ ] Retirements identified.
- [ ] Consumer research completed or scheduled.

---

# 36. Example repository structure
```txt
design-system/
├── .changes/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── apps/
│   ├── docs/
│   ├── playground/
│   └── visual-tests/
├── packages/
│   ├── tokens/
│   │   ├── src/
│   │   │   ├── reference/
│   │   │   ├── semantic/
│   │   │   ├── component/
│   │   │   └── themes/
│   │   ├── transforms/
│   │   ├── schema/
│   │   └── tests/
│   ├── icons/
│   ├── primitives/
│   ├── components/
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.css
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.visual.tsx
│   │   │   │   ├── Button.docs.mdx
│   │   │   │   └── index.ts
│   │   │   └── Dialog/
│   │   └── package.json
│   ├── patterns/
│   ├── charts/
│   ├── testing/
│   ├── eslint-config/
│   └── codemods/
├── docs/
│   ├── decisions/
│   ├── governance/
│   ├── migration/
│   └── research/
├── scripts/
│   ├── build-tokens/
│   ├── validate-themes/
│   ├── audit-usage/
│   └── release/
├── package.json
├── README.md
└── CONTRIBUTING.md
```

## 36.1 Per-component source structure
```txt
Component/
├── Component.tsx
├── Component.css
├── Component.types.ts
├── Component.test.tsx
├── Component.a11y.test.tsx
├── Component.visual.tsx
├── Component.examples.tsx
├── Component.docs.mdx
├── README.md
└── index.ts
```

Do not duplicate documentation files unless each has a distinct generated or consumer-facing role.

## 36.2 Token source structure
```txt
tokens/
├── reference/
│   ├── color.json
│   ├── dimension.json
│   ├── typography.json
│   └── motion.json
├── semantic/
│   ├── color.json
│   ├── space.json
│   └── motion.json
├── component/
│   ├── button.json
│   └── dialog.json
├── themes/
│   ├── brand-a.json
│   ├── brand-b.json
│   ├── dark.json
│   └── high-contrast.json
├── schema/
└── index.json
```

## 36.3 Documentation and decision structure
```txt
docs/
├── getting-started/
├── foundations/
├── components/
├── patterns/
├── templates/
├── accessibility/
├── content/
├── governance/
├── contribution/
├── releases/
├── migration/
└── decisions/
    ├── ADR-001-token-tiers.md
    ├── ADR-002-theme-precedence.md
    └── RFC-007-dialog-api.md
```

---

# 37. Example implementation plan
The correct sequence depends on the audit, but this plan is a practical starting point.

## 37.1 Days 1–30: frame and audit
Deliver:

- Sponsor and core owners
- system brief
- boundary map
- product and brand inventory
- component and value audit
- consumer interviews
- accessibility risk summary
- initial principles
- first priority ranking
- source-of-truth map
- pilot candidates

Decisions:

- System archetype
- supported platforms
- initial governance
- expected lifespan
- first adoption target
- non-goals

Avoid:

- Building dozens of components
- choosing token names before auditing use
- announcing a launch date before migration is understood

## 37.2 Days 31–60: architecture and foundations
Deliver:

- Layer architecture
- token taxonomy
- color and type semantic roles
- spacing and layout model
- theme contract
- state vocabulary
- repository and package setup
- test infrastructure
- documentation skeleton
- contribution and status model

Pilot assets:

- Button
- link
- field
- one high-value complex component
- layout primitives

Decisions:

- Styling boundaries
- design/code property mapping
- release strategy
- accessibility test matrix
- stable versus beta criteria

## 37.3 Days 61–90: pilot in a real product
Deliver:

- Working design and code libraries
- pilot implementation
- migration mapping
- component documentation
- release notes
- support channel
- consumer feedback report
- revised APIs based on actual use
- baseline adoption metrics

Use the pilot to test:

- Installation
- theme integration
- responsive behavior
- content variation
- accessibility
- versioning
- review process
- issue handling

## 37.4 Months 4–6: establish reliability
Focus on:

- Highest-value component set
- forms and validation
- overlays and navigation
- accessibility hardening
- visual regression coverage
- codemods
- documentation search
- contribution pipeline
- second and third product migrations
- design-library release coordination
- metrics dashboard

Retire or merge early abstractions that did not survive product use.

## 37.5 Months 7–12: scale deliberately
Potential work:

- Patterns and templates
- multi-brand or dark-mode expansion
- native platform outputs
- data visualization
- content terminology system
- cross-channel templates
- federated contribution
- usage linting
- supported-version policy
- deprecation program
- consumer council
- quarterly health reviews

Do not add platforms or brands merely to demonstrate scale. Add them when there is ownership and sustained demand.

## 37.6 Minimal viable system by archetype

### Small digital product
Start with:

- Principles
- semantic color and typography
- spacing
- button, link, field, inputs, alert, dialog
- layout primitives
- accessibility checklist
- code package
- short documentation
- one owner and contribution route

### Brand and marketing ecosystem
Start with:

- Brand principles
- color and typography
- layout and composition
- imagery and motion
- voice and content
- responsive page sections
- campaign templates
- CMS content models
- accessibility and performance rules
- asset governance

### Multi-product platform
Start with:

- Governance and sponsorship
- ecosystem audit
- token architecture
- primitives
- high-risk common components
- package and version policy
- contribution model
- migration tooling
- parity dashboard
- consumer council

### Multi-brand platform
Start with:

- Shared semantic vocabulary
- theme contract
- reference and semantic token split
- brand ownership model
- automated theme validation
- shared functional components
- brand-specific extension rules
- preview tooling
- release coordination

### Internal enterprise suite
Start with:

- Dense layout and typography
- forms
- tables
- filters
- bulk actions
- permission and status patterns
- keyboard operation
- error recovery
- long-lived browser constraints
- migration inventory

### Editorial or media platform
Start with:

- Typography
- reading widths
- grid and templates
- media ratios
- rich-text rules
- embeds
- metadata
- accessibility
- performance
- CMS schemas
- sponsored-content distinctions

## 37.7 The first ten concrete artifacts
When the scope is still overwhelming, produce these first:

1. System brief
2. ecosystem boundary map
3. interface and code audit
4. principle set
5. architecture diagram
6. semantic token draft
7. one simple component specification
8. one complex component specification
9. governance and contribution page
10. real-product pilot and findings report

These artifacts reveal most structural mistakes early.

---

# 38. Glossary
**Accessibility contract**
The behavior and semantics the system guarantees, plus responsibilities left to consumers.

**Alias**
A token value that references another token.

**Anatomy**
The named structural parts of a component or pattern.

**API**
The properties, events, slots, methods, semantics, and customization surface through which a consumer uses an asset.

**Component**
A reusable interface unit with defined purpose, structure, behavior, and states.

**Component token**
A token representing a decision scoped to a component.

**Composition**
Combining smaller assets to create a larger interface rather than configuring one large asset for every case.

**Consumer**
A person or team using the system to make an experience.

**Contribution**
A proposed or completed change supplied by someone outside or inside the core maintenance team.

**Design debt**
Accumulated inconsistency or outdated design decisions that increase future effort or reduce quality.

**Design language**
The shared visual, verbal, and behavioral vocabulary of an experience family.

**Design system**
The combined language, materials, operations, and evidence used to produce coherent experiences.

**Foundation**
A broad visual or behavioral rule such as color, typography, spacing, motion, or voice.

**Governance**
The decision rights and processes used to maintain and evolve the system.

**Headless component**
A reusable behavior or state implementation with little or no prescribed appearance.

**Mode**
A named set of token values or behaviors, such as dark, compact, or high contrast.

**Pattern**
A reusable solution to a recurring user task, usually combining multiple components and content rules.

**Primitive**
A low-level building block used to construct components or layouts.

**Reference token**
A raw design option such as a palette value or spacing step.

**Semantic token**
A token named for purpose or role rather than raw appearance.

**Slot**
A named insertion point for consumer-provided content or components.

**Source of truth**
The authoritative location for a particular decision or artifact.

**Template**
A reusable larger-scale structure for a page, communication, or workflow.

**Theme**
A coordinated value set that changes expression while preserving system semantics and contracts.

**Token**
A named, portable representation of a design decision.

**Variant**
A supported form of a component that expresses a meaningful difference in purpose, emphasis, size, or behavior.

---

# Closing rule set
When deciding whether any design-system choice is good, ask:

1. Does it solve a repeated, evidenced problem?
2. Is its meaning clear?
3. Is the default safe and accessible?
4. Can teams use it without reconstructing hidden decisions?
5. Can it handle real content and failure states?
6. Is the variation intentional and bounded?
7. Can it be tested?
8. Can it be changed and migrated?
9. Is someone accountable for maintaining it?
10. Does the system become more useful than the local workaround?

A design system earns adoption through reliability, clarity, and practical value. Build the shared parts that deserve to be shared, leave room for product and brand judgment, and operate the result as living infrastructure.
