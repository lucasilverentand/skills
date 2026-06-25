# 31. Team structure and roles

## 31.1 Core roles

### Design-system lead
Owns strategy, roadmap, stakeholder alignment, and operating model.

### System designer
Owns foundations, components, patterns, design assets, and documentation.

### System engineer
Owns packages, architecture, testing, tooling, releases, and integrations.

### Content designer
Owns voice, terminology, microcopy patterns, and content guidance.

### Accessibility specialist
Defines criteria, reviews behavior, tests, and builds team capability.

### Program or product manager
Owns planning, intake, adoption, dependencies, and measurement.

### Brand designer
Owns identity expression, art direction, assets, and multi-brand coherence.

### Developer experience engineer
Owns installation, examples, codemods, linting, diagnostics, and consumer workflow.

One person may cover several roles in a small team. The responsibilities still exist.

## 31.2 Extended contributors
- Product designers
- product engineers
- native engineers
- researchers
- QA specialists
- localization specialists
- legal and compliance
- data visualization specialists
- motion designers
- marketing and editorial teams
- agency partners

## 31.3 Responsibility matrix
|Work|Core team|Product team|Brand team|Accessibility|
|---|---|---|---|---|
|Core tokens|Accountable|Consulted|Consulted|Consulted|
|Product pattern|Consulted|Accountable|Informed|Consulted|
|Brand theme|Consulted|Informed|Accountable|Consulted|
|Component code|Accountable|Contributor|Informed|Reviewer|
|Page implementation|Support|Accountable|Consulted|Product QA|
|Release|Accountable|Informed|Informed|Consulted|

## 31.4 Capacity planning
Reserve capacity for:

- Planned roadmap
- maintenance
- support
- contributions
- accessibility
- migrations
- urgent defects
- research and discovery

A roadmap using 100% of capacity for new components is not credible.

## 31.5 Embedded rotations
Temporary rotations from product teams can:

- Bring domain knowledge
- build contributor skill
- improve adoption
- reduce “central team versus product team” dynamics

Give rotating members a defined project and a system maintainer partner.

## 31.6 Sponsorship
An executive or senior sponsor should help resolve:

- Cross-team priorities
- funding
- adoption expectations
- ownership conflicts
- platform investment
- major migration timing

Sponsorship should not substitute for day-to-day product management.

---

# 32. Roadmaps and maturity

## 32.1 Maturity levels

### Level 0: fragmented
- Repeated local values
- no shared ownership
- inconsistent components
- undocumented behavior

### Level 1: foundations
- Shared principles
- tokens
- basic visual assets
- initial source-of-truth map

### Level 2: reusable
- Core components
- design and code alignment
- documentation
- basic release process

### Level 3: operational
- Governance
- contribution
- testing
- versioning
- adoption support
- metrics

### Level 4: scalable
- Multiple platforms or brands
- automated migrations
- federated contribution
- mature patterns
- strong developer experience

### Level 5: adaptive
- Evidence-driven roadmap
- reliable cross-channel language
- proactive quality monitoring
- system evolves with product strategy
- clear experimentation boundaries

Maturity is not a race. A focused Level 2 system may be exactly right for a small organization.

## 32.2 Roadmap categories
Balance work across:

- Foundations
- components
- patterns
- tooling
- documentation
- accessibility
- adoption
- maintenance
- research
- governance

## 32.3 Roadmap scoring
Score proposals on:

- User impact
- number of teams
- strategic alignment
- accessibility or legal risk
- duplication reduced
- readiness
- maintenance cost
- migration cost
- contributor availability
- deadline confidence

Use scores as decision support, not automatic truth.

## 32.4 Build versus buy
For each capability, assess:

|Question|Build|Buy/adopt|
|---|---|---|
|Is it brand- or domain-differentiating?|More likely|Less likely|
|Is accessible behavior complex and standardized?|Only with expertise|Often useful|
|Is sustained maintenance funded?|Required|Vendor/community still needs evaluation|
|Must the API fit existing architecture deeply?|More likely|Wrapper may work|
|Is time-to-value critical?|Slower|Faster initially|
|Is dependency risk acceptable?|N/A|Must be assessed|

You can adopt behavior primitives, style them, and own the public API. “Build” and “buy” are not always binary.

## 32.5 Backlog hygiene
Every backlog item should have:

- Problem
- affected users
- evidence
- scope
- owner
- dependencies
- status
- next decision
- age

Close or revalidate stale requests. A permanent backlog hides priorities.

---

# 33. Common failure modes

## 33.1 Starting with a giant component checklist
**Symptom:** The team builds dozens of components before understanding actual needs.

**Correction:** Audit real products, rank repeated risk, and pilot a narrow set.

## 33.2 Treating the system as a redesign
**Symptom:** A new visual language launches, but ownership, code, migration, and documentation remain unresolved.

**Correction:** Treat visual refresh and system operations as separate workstreams with shared milestones.

## 33.3 Copying the design file into code
**Symptom:** Code mirrors visual frames but misses semantics, content variation, and state behavior.

**Correction:** Design the behavioral and semantic contract before implementation.

## 33.4 Building only for the happy path
**Symptom:** Components fail with errors, long labels, loading, permissions, or small screens.

**Correction:** Require state matrices and realistic examples before stable release.

## 33.5 Too many tokens
**Symptom:** Consumers cannot tell which token to use, and aliases duplicate one another.

**Correction:** Remove tokens without stable meaning. Publish decision guidance and lint common misuse.

## 33.6 Too few semantic tokens
**Symptom:** Products use raw palette values everywhere and theming becomes expensive.

**Correction:** Introduce role-based tokens and migrate by context, not simple color replacement.

## 33.7 Prop soup
**Symptom:** Components expose many booleans, contradictory states, and styling controls.

**Correction:** Use constrained variants, composition, named slots, and separate components where purposes differ.

## 33.8 Central-team bottleneck
**Symptom:** Every request waits for a small team.

**Correction:** Create contribution lanes, domain-owned patterns, published criteria, and delegated review.

## 33.9 Uncontrolled federation
**Symptom:** Contributions enter without coherent architecture or maintenance.

**Correction:** Keep central quality and release ownership while distributing discovery and implementation.

## 33.10 Design-code drift
**Symptom:** Properties, variants, or values differ between tools.

**Correction:** Map concepts explicitly, coordinate releases, and track parity status.

## 33.11 Documentation afterthought
**Symptom:** Consumers copy examples without understanding constraints.

**Correction:** Treat documentation as part of component acceptance and test examples in CI.

## 33.12 Accessibility delegated to consumers
**Symptom:** Each product rebuilds keyboard and focus behavior.

**Correction:** Put stable accessibility guarantees into primitives and components, while documenting page-level responsibilities.

## 33.13 Accessibility treated as a final audit
**Symptom:** Fundamental interaction models need redesign near release.

**Correction:** Include accessibility during problem definition, API design, and prototype testing.

## 33.14 No migration budget
**Symptom:** The new system exists beside the old one indefinitely.

**Correction:** Fund codemods, pilots, product work, regression testing, and deprecation follow-up.

## 33.15 Mandatory adoption without support
**Symptom:** Teams comply superficially or create hidden forks.

**Correction:** Pair standards with useful defaults, migration help, contribution rights, and exception handling.

## 33.16 Over-customizable system
**Symptom:** Every consumer can override every visual and behavioral detail, so consistency disappears.

**Correction:** Expose intentional customization boundaries and keep core semantics protected.

## 33.17 Over-rigid system
**Symptom:** Valid product or brand needs cannot be represented.

**Correction:** Separate invariants from variables, support extensions, and use evidence from exceptions.

## 33.18 Framework lock-in at the conceptual layer
**Symptom:** Token names and component concepts are defined by one framework’s implementation details.

**Correction:** Keep semantic architecture platform-neutral and create platform delivery adapters.

## 33.19 Stale ownership
**Symptom:** Components remain “stable” after maintainers leave.

**Correction:** Review ownership periodically and retire unsupported assets.

## 33.20 Measuring inventory instead of value
**Symptom:** Success reports count components, tokens, or documentation pages.

**Correction:** Measure reach, quality, efficiency, satisfaction, and sustainability.

---
