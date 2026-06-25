# 6. Design the system architecture
The architecture describes how the system’s parts relate.

## 6.1 A practical layer model
```txt
Principles and policies
        ↓
Brand and experience foundations
        ↓
Reference tokens
        ↓
Semantic tokens
        ↓
Component tokens
        ↓
Primitives
        ↓
Components
        ↓
Patterns
        ↓
Templates
        ↓
Product- or brand-specific experiences
```

Each layer should depend primarily on layers above it.

## 6.2 Layer definitions

### Principles and policies
Decision rules, accessibility expectations, support commitments, governance, and contribution rules.

### Brand and experience foundations
Color strategy, typography, motion, imagery, voice, spatial logic, and interaction philosophy.

### Reference tokens
Raw design options such as palettes, spacing scales, font families, and motion durations.

### Semantic tokens
Role-based values such as background surface, text subtle, border critical, or focus ring.

### Component tokens
Optional component-specific decisions such as button primary background or dialog maximum width.

### Primitives
Low-level implementation building blocks such as Box, Stack, Text, Icon, VisuallyHidden, FocusTrap, or Portal.

### Components
Reusable interface units with defined anatomy, behavior, state, and API.

### Patterns
Solutions to recurring tasks that combine components, content, and interaction.

### Templates
Larger structural arrangements for page types, campaigns, communications, or workflows.

### Experiences
Actual products, pages, features, campaigns, and services.

## 6.3 Separate decision layers from delivery layers
Decision layers describe what something means. Delivery layers package it for tools and platforms.

Example:

```txt
Decision:
  color.text.critical = color.red.700 in light mode

Delivery:
  CSS custom property
  Swift color asset
  Android resource
  Figma variable
  JSON export
```

Do not let the limitations of one delivery tool define the conceptual architecture of the whole system.

## 6.4 Separate shared core from extensions
A common architecture is:

```txt
core
├── foundations
├── tokens
├── accessibility utilities
├── primitives
└── common components

extensions
├── product-a
├── product-b
├── brand-a
├── brand-b
├── web
├── ios
└── android
```

Extensions should be able to add or compose without silently changing core behavior.

## 6.5 Define ownership by layer
|Layer|Typical owner|Typical contributors|
|---|---|---|
|Principles|Design-system leads and sponsors|Product, brand, accessibility|
|Brand foundations|Brand design|Product design, marketing|
|Tokens|System design and engineering|Brand and platform teams|
|Primitives|System engineering|Accessibility specialists|
|Components|System design and engineering|Product teams|
|Patterns|Shared ownership|Domain experts|
|Templates|Product, brand, or channel teams|System team|
|Experiences|Product or campaign teams|System consumers|

Ownership need not be centralized, but it must be visible.

---

# 7. Create the operating model
The operating model determines how the system survives after launch.

## 7.1 Centralized, federated, and hybrid models

### Centralized
A dedicated team owns most decisions and implementation.

Advantages:

- Strong consistency
- clear accountability
- coordinated roadmap
- easier release management

Risks:

- Bottlenecks
- distance from product reality
- lower contribution
- “service desk” dynamics

### Federated
Contributors across product teams co-own the system.

Advantages:

- Domain expertise
- distributed capacity
- stronger local adoption
- faster discovery of needs

Risks:

- inconsistent quality
- unclear decision rights
- fragmented priorities
- maintenance gaps

### Hybrid
A core team owns architecture, quality, release, and foundations while product teams contribute components and patterns.

This is often the most practical model for a growing organization.

## 7.2 Define decision rights
Use explicit categories.

|Decision|Decides|Consulted|Informed|
|---|---|---|---|
|Token taxonomy|System team|Brand and platform teams|Consumers|
|New core component|System maintainers|Requesting teams, accessibility|All consumers|
|Product-specific pattern|Product team|System team|Related teams|
|Breaking API change|System maintainers|Major consumers|All consumers|
|Brand refresh|Brand owner|System team, product leads|All affected teams|
|Deprecation deadline|System lead and engineering lead|Consumers|Sponsors|

Avoid consensus for every decision. Consultation is not the same as veto power.

## 7.3 Establish recurring rituals
Useful operating rituals include:

- Weekly triage
- component design review
- engineering API review
- accessibility review
- contribution office hours
- release planning
- monthly consumer council
- quarterly roadmap review
- adoption review
- system health review
- retrospective after major migrations

Keep each ritual tied to a decision or output. Meetings without clear decisions become a tax on adoption.

## 7.4 Create service levels
Document expected response and delivery behavior.

Examples:

- Critical system defect: triaged immediately
- Accessibility blocker: prioritized ahead of feature work
- Standard support question: answered through documented channel
- New component request: acknowledged and routed during weekly triage
- Breaking change: announced with migration path and agreed notice period
- Contribution review: reviewer assigned within a defined working window

Do not promise service levels that the team cannot maintain.

## 7.5 Fund maintenance explicitly
Maintenance includes:

- Framework upgrades
- browser and OS changes
- accessibility fixes
- dependency updates
- documentation
- support
- visual regression review
- token migrations
- deprecations
- analytics
- contribution review

A system funded only as a launch project will degrade after launch.

---

# 8. Build the foundations
Foundations encode the visual and behavioral vocabulary shared across experiences.

## 8.1 Recommended foundation set
At minimum, consider:

- Color
- typography
- spacing
- sizing
- grids
- breakpoints
- shape
- borders
- elevation
- opacity
- motion
- iconography
- imagery
- data visualization
- sound and haptics, where relevant
- content voice
- accessibility behavior

Not every foundation needs a large scale. Create only what the ecosystem uses.

## 8.2 Use scales with intent
A scale should express meaningful options, not merely a mathematical sequence.

A good scale:

- Covers real needs
- has understandable steps
- avoids visually indistinguishable values
- supports responsive use
- has names that can survive visual refreshes
- permits exceptions where the system genuinely needs them

## 8.3 Distinguish values from roles
Raw value:

```txt
blue-600 = #1D4ED8
```

Semantic role:

```txt
action-primary-background = blue-600
```

Component role:

```txt
button-primary-background-default = action-primary-background
```

Products should usually consume semantic or component roles, not raw values. This allows themes and brands to change without rewriting every implementation.

## 8.4 Define responsive behavior as a foundation
Responsive systems need more than breakpoints. Define:

- Container widths
- page gutters
- content maximums
- column behavior
- density changes
- type scaling
- target sizes
- reflow rules
- overflow behavior
- image cropping
- navigation transitions
- data-table alternatives
- touch versus pointer affordances

Avoid using device labels such as “tablet” as the only model. Layout should respond to available space and content needs.

## 8.5 Define states globally
Create a shared state vocabulary:

- Default
- hover
- active or pressed
- focus-visible
- selected
- checked
- disabled
- read-only
- loading
- success
- warning
- error
- unavailable
- visited
- current
- expanded or collapsed
- dragging or drop target

Components should use these names consistently in design and code.

---

# 9. Create a token architecture
Tokens convert design decisions into portable, named data.

## 9.1 Why tokens matter
Tokens make it possible to:

- Synchronize design and code
- Theme products
- support multiple brands
- automate visual updates
- reduce arbitrary values
- validate usage
- generate platform assets
- document decisions
- migrate consistently

Tokens do not automatically create consistency. Poorly named or overly granular tokens can make a system harder to understand.

## 9.2 Recommended token tiers

### Tier 1: reference tokens
Raw options.

```json
{
  "color": {
    "blue": {
      "50": { "value": "#EFF6FF" },
      "600": { "value": "#2563EB" },
      "900": { "value": "#1E3A8A" }
    }
  },
  "space": {
    "100": { "value": "0.25rem" },
    "200": { "value": "0.5rem" },
    "300": { "value": "0.75rem" },
    "400": { "value": "1rem" }
  }
}
```

### Tier 2: semantic tokens
Meaningful roles.

```json
{
  "color": {
    "surface": {
      "default": { "value": "{color.neutral.0}" },
      "subtle": { "value": "{color.neutral.50}" },
      "inverse": { "value": "{color.neutral.950}" }
    },
    "text": {
      "default": { "value": "{color.neutral.950}" },
      "muted": { "value": "{color.neutral.600}" },
      "inverse": { "value": "{color.neutral.0}" },
      "critical": { "value": "{color.red.700}" }
    }
  }
}
```

### Tier 3: component tokens
Local component roles where justified.

```json
{
  "button": {
    "primary": {
      "background": {
        "default": { "value": "{color.action.primary.default}" },
        "hover": { "value": "{color.action.primary.hover}" }
      },
      "text": {
        "default": { "value": "{color.text.on-action}" }
      }
    }
  }
}
```

Do not create component tokens for every CSS property by default. Add them when consumers need stable customization or when a component’s values carry distinct meaning.

## 9.3 Token naming model
A scalable name often follows:

```txt
category.role.variant.state.property
```

Examples:

```txt
color.text.default
color.text.muted
color.border.critical
color.action.primary.hover
space.component.control.inline
size.target.minimum
motion.duration.exit
shadow.overlay.modal
```

For component tokens:

```txt
component.button.primary.background.hover
component.input.border.invalid
component.dialog.size.maximum
```

Use the shortest name that remains unambiguous.

## 9.4 Naming rules
Prefer names that describe meaning:

- `color.text.muted`
- `space.container.gutter`
- `motion.duration.enter`

Avoid names that encode current appearance or location:

- `light-gray-text`
- `left-padding`
- `blue-button`
- `big-shadow`

Appearance-based names break when themes or brand values change.

## 9.5 Token granularity
Too coarse:

```txt
brand-color
spacing
font
```

Too fine:

```txt
search-field-icon-right-offset-on-tablet
```

Useful granularity usually maps to:

- A stable semantic role
- A repeated component need
- A customization boundary
- A cross-platform value
- A governance decision worth naming

## 9.6 Modes and themes
A mode is a named set of token values.

Examples:

```txt
light
dark
high-contrast
brand-a
brand-b
comfortable
compact
```

Keep semantic names stable across modes.

```json
{
  "color.text.default": {
    "light": "#111827",
    "dark": "#F9FAFB",
    "highContrast": "#000000"
  }
}
```

Avoid scattering theme logic inside individual components. Resolve modes at the token layer where possible.

## 9.7 Alias strategy
Prefer alias chains that remain understandable.

Good:

```txt
button.primary.background
→ color.action.primary
→ color.blue.600
```

Risky:

```txt
button.primary.background
→ component.interactive.accent
→ brand.emphasis.strong
→ palette.brand.dynamic
→ color.blue.600
```

Deep alias chains make debugging difficult. Keep them shallow unless each layer provides meaningful separation.

## 9.8 Token metadata
Useful metadata may include:

- Description
- type
- supported modes
- owner
- status
- introduced version
- deprecated version
- replacement
- accessibility notes
- platform exceptions
- usage examples
- do-not-use guidance

Example:

```json
{
  "color": {
    "text": {
      "critical": {
        "value": "{color.red.700}",
        "type": "color",
        "description": "Text that communicates an error or destructive state.",
        "status": "stable"
      }
    }
  }
}
```

## 9.9 Platform transformation
A token pipeline may output:

- CSS custom properties
- Sass variables
- TypeScript constants
- JSON
- iOS assets
- Android XML
- design-tool variables
- documentation tables
- linting rules

Conceptual pipeline:

```txt
token source
  → schema validation
  → alias resolution
  → mode expansion
  → platform transform
  → generated artifacts
  → package publishing
```

Generated files should not normally be edited by hand.

## 9.10 Token governance
Require review for changes that:

- Alter semantic meaning
- remove or rename a token
- change contrast behavior
- change theme inheritance
- introduce a new naming category
- affect many components
- expose a new customization surface

Treat token renames as API changes.

## 9.11 Token anti-patterns
Avoid:

- Tokens named after a single screen
- raw palette values used directly throughout products
- duplicate aliases with no semantic difference
- tokens created only to avoid writing one literal once
- arbitrary scales with no visual or functional rationale
- component internals exposed as public tokens without a customization need
- theme values hard-coded in component source
- one token file owned by nobody
- design-tool variables that do not map to code
- code tokens that have no documentation or design representation

---
