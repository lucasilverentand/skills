# 19. Design component APIs
A component has at least two APIs:

1. **The design API** — properties, variants, slots, states, content limits, and composition rules visible to designers.
2. **The code API** — props, events, elements, types, styles, ref behavior, and accessibility semantics visible to engineers.

These APIs should describe the same conceptual model even when their syntax differs.

## 19.1 Decide whether something should be a component
A shared component is justified when several of these are true:

- It appears in multiple products or contexts.
- Its behavior is non-trivial.
- It carries accessibility risk.
- It has a stable conceptual purpose.
- Consistency materially helps users.
- Central maintenance reduces duplicate work.
- It needs coordinated theming.
- It benefits from shared testing.
- Teams are already copying versions of it.

Keep something local when:

- It is unique to one domain.
- Its behavior is still experimental.
- Its abstraction is not understood.
- The variants have little in common.
- Central ownership would slow necessary iteration.
- It is a one-off composition of existing primitives.

A useful rule: standardize proven repetition, not imagined reuse.

## 19.2 Define component anatomy
Document named parts.

Example dialog anatomy:

```txt
Dialog
├── Trigger
├── Backdrop
├── Container
│   ├── Header
│   │   ├── Title
│   │   └── Close action
│   ├── Body
│   └── Footer
│       ├── Secondary actions
│       └── Primary action
└── Focus boundary
```

Named anatomy makes design review, API design, testing, and documentation more precise.

## 19.3 Define the behavioral contract
For each component, answer:

- What job does it perform?
- What does it render semantically?
- Which states exist?
- Which events can occur?
- Who owns state?
- What happens on keyboard input?
- What happens when content overflows?
- What happens while loading?
- What happens when data is missing?
- How does it respond to directionality?
- How does it behave at small widths?
- Which parts can consumers customize?
- Which guarantees must never be overridden?

## 19.4 Prefer variants with meaning
Good variants express intent:

```txt
tone: neutral | accent | critical
emphasis: solid | subtle | minimal
size: compact | default | large
```

Risky variants expose accidental styling:

```txt
blue: true
hasShadow: true
borderWidth: 2
paddingLeft: 12
```

The latter makes consumers reconstruct design decisions from low-level switches.

## 19.5 Avoid boolean-prop explosions
This API permits contradictory combinations:

```tsx
<Button
  primary
  secondary
  danger
  small
  large
  rounded
  textOnly
  loading
/>
```

Prefer constrained unions:

```tsx
type ButtonProps = {
  tone?: "accent" | "neutral" | "critical";
  emphasis?: "solid" | "subtle" | "minimal";
  size?: "compact" | "default" | "large";
  loading?: boolean;
};
```

The design-tool variant model should use the same conceptual axes.

## 19.6 Use composition instead of mega-components
Risky:

```tsx
<Card
  title="Usage"
  subtitle="This month"
  image={...}
  icon={...}
  footerText="Updated now"
  primaryAction="Upgrade"
  secondaryAction="Details"
  selectable
  collapsible
  horizontal
/>
```

More composable:

```tsx
<Card>
  <Card.Header>
    <Card.Title>Usage</Card.Title>
    <Card.Description>This month</Card.Description>
  </Card.Header>
  <Card.Body>{chart}</Card.Body>
  <Card.Footer>
    <Button emphasis="minimal">Details</Button>
    <Button>Upgrade</Button>
  </Card.Footer>
</Card>
```

Composition creates more combinations without encoding each one in the parent API.

## 19.7 Use slots carefully
Slots are named insertion points such as:

- Leading visual
- trailing action
- header
- footer
- description
- empty state

A slot should have:

- A clear purpose
- layout constraints
- semantic expectations
- content guidance
- accessibility ownership
- an answer for absence and overflow

An unrestricted “anything” slot can become an ungoverned escape hatch.

## 19.8 Controlled and uncontrolled state
For stateful code components, decide whether state is:

- Internally managed
- externally controlled
- initialized internally but observable
- shared through context

Example:

```tsx
<Tabs defaultValue="overview">
  ...
</Tabs>
```

Controlled:

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  ...
</Tabs>
```

Document which model is preferred and how state changes are signaled.

## 19.9 Event naming
Events should describe what happened, not implementation details.

Prefer:

```txt
onValueChange
onOpenChange
onSelectionChange
onDismiss
```

Use `onClick` only when the click itself is the meaningful contract. Components should support keyboard, touch, and assistive input without making the consumer treat those as separate business actions.

## 19.10 Semantic element ownership
Decide whether a component:

- Renders a fixed semantic element
- accepts an explicit semantic element
- exposes a limited `as` option
- is behavior-only and requires the consumer to supply markup

Avoid unrestricted polymorphism when it can produce invalid or inaccessible combinations.

## 19.11 Styling boundaries
Choose which styling mechanisms are supported:

- Semantic variants
- layout props
- class name
- style object
- token overrides
- component tokens
- slots
- composition wrappers
- no external styling

A practical policy is:

- Core behavior and essential state styling cannot be overridden.
- Layout around a component belongs to its parent.
- Meaningful variants are first-class.
- Brand customization goes through tokens or themes.
- One-off product customization uses documented composition or extension points.
- Internal selectors are not a public API.

## 19.12 Escape hatches
Escape hatches are necessary, but they should be visible.

Possible escape-hatch levels:

1. Supported variant
2. composition with primitives
3. documented style hook
4. product extension component
5. exception approval
6. local implementation

Track repeated use of escape hatches. Frequent escape use is evidence that the shared API may be missing a valid need.

## 19.13 Component status
Use a consistent status model:

- Proposed
- exploratory
- beta
- stable
- deprecated
- retired

For each status, define:

- Whether production use is allowed
- stability expectations
- support level
- change policy
- documentation completeness
- migration expectations

## 19.14 Component acceptance criteria
A component is not “done” because its default state matches a mockup. It should have:

- Defined purpose and non-purpose
- complete anatomy
- all supported states
- responsive behavior
- content guidance
- accessibility behavior
- typed API
- design asset
- code implementation
- tests
- documentation
- examples
- ownership
- release entry
- migration guidance if replacing something

---

# 20. Build the component library

## 20.1 Start with enabling primitives
Common primitives:

- Box
- Stack
- Inline
- Grid
- Text
- Heading
- Icon
- Separator
- VisuallyHidden
- AspectRatio
- Portal
- FocusTrap
- ScrollArea
- Presence or transition wrapper

Not every primitive must be public. Some exist only to make system components consistent.

## 20.2 Common component categories

### Actions
- Button
- icon button
- link
- button group
- split action
- floating action

### Form controls
- Text input
- textarea
- checkbox
- radio
- switch
- select
- combobox
- autocomplete
- date and time input
- slider
- file upload
- search field

### Form structure
- Label
- field
- description
- validation message
- field group
- form section
- error summary

### Navigation
- Header
- sidebar
- tabs
- breadcrumb
- pagination
- stepper
- menu
- command palette
- bottom navigation
- tree navigation

### Feedback
- Alert
- inline message
- toast
- progress
- spinner
- skeleton
- status badge
- empty state

### Overlays
- Dialog
- alert dialog
- drawer
- popover
- tooltip
- dropdown menu
- context menu

### Data display
- Table
- list
- card
- description list
- avatar
- tag
- timeline
- statistic
- code block
- chart wrappers

### Content and media
- Accordion
- carousel
- image
- video
- quote
- callout
- rich text
- metadata
- hero

Build only the categories your ecosystem needs.

## 20.3 Prioritize components by risk and utility
A recommended first wave often includes:

- Button and link
- typography and layout primitives
- form field and basic controls
- alert and validation
- icon
- dialog
- menu or navigation primitive
- loading and empty states
- card or surface
- table primitives for data-heavy products

But audit evidence should override generic lists.

## 20.4 Component-specific non-negotiables

### Button
Define:

- Button versus link semantics
- primary-action limits
- loading behavior
- disabled versus unavailable behavior
- icon-only labeling
- destructive confirmation
- text wrapping
- full-width behavior
- form submission defaults

### Link
Define:

- External link treatment
- visited state
- current-page state
- download links
- link versus button distinction
- inline versus standalone styling
- focus state

### Text input
Define:

- Label
- placeholder policy
- description
- prefix and suffix
- clear action
- required and optional indication
- validation timing
- autocomplete attributes
- input modes
- read-only and disabled behavior

### Checkbox, radio, and switch
Define:

- When each control is appropriate
- group labeling
- indeterminate state
- label target area
- immediate versus submitted changes
- required behavior
- keyboard interaction

### Select and combobox
Treat these as different patterns.

A select chooses from a known list. A combobox supports text input, filtering, or free-form values. Document:

- Native versus custom implementation
- option count
- async loading
- grouping
- typeahead
- creation of new values
- selected-value rendering
- mobile behavior
- keyboard interaction
- virtualization constraints

### Dialog
Define:

- Modal versus non-modal behavior
- initial focus
- focus trap
- focus return
- Escape behavior
- backdrop dismissal
- destructive confirmation
- scroll behavior
- nested dialogs
- responsive full-screen behavior
- title requirements

### Tooltip
Tooltips should supplement, not carry essential information. Define:

- Trigger types
- delay
- dismissal
- keyboard and touch behavior
- maximum content
- positioning
- whether interactive content is forbidden

### Toast
Define:

- Which events justify a toast
- duration
- pause behavior
- screen-reader announcement
- action support
- stacking
- deduplication
- persistence
- critical-message alternatives

Do not use transient toasts for errors that require recovery.

### Table
Define:

- Semantic table versus grid behavior
- sorting
- selection
- bulk actions
- column resizing
- sticky regions
- responsive alternatives
- keyboard interaction
- loading
- empty state
- pagination
- virtualization
- cell truncation
- accessible names
- row actions

A table that behaves like a spreadsheet requires a substantially different accessibility and keyboard model from a read-only data table.

### Date and time input
Define:

- Locale formatting
- time zones
- parsing
- invalid dates
- minimum and maximum
- range selection
- keyboard entry
- calendar interaction
- mobile-native options
- ambiguity handling
- daylight-saving behavior

### File upload
Define:

- Accepted types
- size limits
- multi-file behavior
- drag and drop
- keyboard alternative
- progress
- cancellation
- retry
- validation
- security scanning state
- preview
- removal
- failure recovery

## 20.5 State matrices
Create a state matrix for each component.

Example:

|State|Visual|Semantic|Interaction|Content|
|---|---|---|---|---|
|Default|Standard surface|Enabled control|Operable|Label present|
|Hover|Emphasized surface|No semantic change|Pointer only|Unchanged|
|Focus-visible|Focus ring|Focused|Keyboard/assistive|Unchanged|
|Pressed|Active surface|Pressed when relevant|Activation|Unchanged|
|Loading|Progress treatment|Busy|Duplicate action blocked|Progress label|
|Disabled|Reduced emphasis|Disabled|Not operable|Reason nearby if needed|
|Error|Critical border/message|Invalid|Recovery available|Specific error|

## 20.6 Empty, loading, error, and partial states
Every data-dependent component should define:

- Initial loading
- background refresh
- empty result
- no permission
- not configured
- partial data
- stale data
- offline
- rate-limited
- failed request
- retrying
- permanently unavailable

These states are often more important than the ideal populated state.

## 20.7 Component dependencies
Keep dependency graphs understandable.

```txt
Dialog
├── Portal
├── FocusTrap
├── Presence
├── Surface
├── Heading
└── Button
```

Watch for circular dependencies and components that depend on large unrelated packages.

## 20.8 Headless, styled, or hybrid

### Headless
Provides state and behavior without visual style.

Best when:

- Many visual systems share behavior
- consumers need deep control
- the team can support a lower-level API

Risk:

- Accessibility can be weakened during composition.
- adoption requires more expertise.
- visual consistency is not guaranteed.

### Styled
Provides complete behavior and appearance.

Best when:

- Strong consistency is desired
- teams want fast implementation
- themes can cover expected variation

Risk:

- Consumers may fork when customization is insufficient.

### Hybrid
Provides stable behavior and default styling plus controlled slots, tokens, and variants.

This is often a practical balance.

---

# 21. Create patterns and templates
Components answer “what is this interface element?” Patterns answer “how do we solve this recurring user task?”

## 21.1 Pattern examples
- Sign in
- account recovery
- onboarding
- search and filtering
- create/edit flows
- destructive actions
- permissions
- checkout
- empty states
- bulk actions
- autosave
- file import
- notifications
- consent
- error recovery
- progressive disclosure
- settings
- comparison
- data export

## 21.2 Pattern specification
```md
# Pattern name

## User problem
What is the user trying to accomplish?

## Use when
Which contexts justify this pattern?

## Do not use when
Which similar situations require another approach?

## Flow
What are the steps and decision points?

## Components
Which system components participate?

## Content
What labels, messages, and terminology are required?

## States
What happens during loading, success, partial success, error, and cancellation?

## Accessibility
What focus, announcement, input, timing, and recovery behavior applies?

## Responsive behavior
How does the pattern reflow or change by context?

## Analytics
Which events or outcomes should be measured?

## Examples
Show typical and edge cases.

## Ownership
Who maintains this pattern?
```

## 21.3 Pattern flexibility
Specify invariants and variables.

Example confirmation pattern:

**Invariant**

- The consequence is named.
- The affected object is identifiable.
- The user can cancel.
- A destructive action is visually and semantically distinct.
- Focus returns logically.

**Variable**

- Dialog, page, or inline presentation
- whether typed confirmation is necessary
- whether recovery is possible
- whether additional authorization is needed

## 21.4 Templates
Templates define larger structures such as:

- Product shell
- dashboard
- settings page
- detail page
- list page
- landing page
- campaign page
- article page
- checkout page
- transactional email
- notification email
- help article
- report
- presentation

A template should provide structure and constraints, not freeze content into a single layout.

## 21.5 Page anatomy
Document named regions:

```txt
Application page
├── Global header
├── Primary navigation
├── Context header
│   ├── Breadcrumb
│   ├── Title
│   ├── Metadata
│   └── Primary actions
├── Main content
│   ├── Local navigation
│   └── Content region
└── Feedback layer
```

## 21.6 Cross-channel patterns
For service systems, map the same status or action across:

- Product UI
- email
- push notification
- SMS
- support script
- help center
- downloadable document

The wording, visual treatment, and timing should remain coherent even when the channel differs.

---

# 22. Support themes, modes, brands, and platforms

## 22.1 Model axes independently
Do not combine every axis into one giant theme name.

Risky:

```txt
brand-a-dark-compact-mobile-high-contrast
```

Prefer independent axes:

```txt
brand = a
colorMode = dark
contrast = high
density = compact
platform = web
```

Resolve combinations through a defined precedence model.

## 22.2 Define theme precedence
Example:

```txt
reference values
→ shared semantic defaults
→ brand semantic values
→ color mode
→ contrast mode
→ component values
→ approved local overrides
```

Document which layer wins and which combinations are unsupported.

## 22.3 Theme contracts
A theme should provide a required set of semantic roles.

```ts
type ThemeContract = {
  color: {
    surfaceDefault: string;
    surfaceRaised: string;
    textDefault: string;
    textMuted: string;
    actionPrimary: string;
    focusRing: string;
  };
  typography: {
    bodyFamily: string;
    displayFamily: string;
  };
  shape: {
    controlRadius: string;
    containerRadius: string;
  };
};
```

Validate that every theme fulfills the contract before publishing.

## 22.4 Multi-brand architecture
Separate:

### Shared behavior
- Accessibility
- interaction
- state models
- layout mechanics
- core component anatomy

### Shared semantic vocabulary
- Text default
- action primary
- surface raised
- status critical

### Brand expression
- Palette values
- typefaces
- radii
- icon style
- motion character
- photography
- voice

### Brand-specific patterns
- Campaign layouts
- editorial modules
- signature interactions
- regulatory content

Not every difference should become a theme token. Some brand differences require a distinct component or composition.

## 22.5 White-label systems
For white-label products, define:

- Required customer inputs
- safe customization ranges
- automated contrast checks
- logo size and format rules
- fallback assets
- prohibited combinations
- preview and validation
- legal ownership
- support boundaries
- upgrade behavior

Do not allow arbitrary customer values to bypass accessibility and layout constraints.

## 22.6 Cross-platform parity
Aim for parity of:

- Purpose
- semantics
- content
- state
- outcome
- accessibility
- brand recognition

Allow platform-specific differences in:

- Native controls
- navigation conventions
- gestures
- typography metrics
- motion
- system dialogs
- feedback patterns
- lifecycle behavior

Create a parity matrix:

|Concept|Web|iOS|Android|Notes|
|---|---|---|---|---|
|Primary action|Button|Native button wrapper|Native button wrapper|Same semantic tone|
|Dialog|Modal dialog|Sheet or alert|Dialog or bottom sheet|Context-dependent|
|Navigation|Sidebar/header|Tab/navigation stack|Navigation bar/drawer|Preserve information architecture|
|Tokens|CSS variables|Asset/code output|Resources/code output|Same semantic source|

## 22.7 Locale and direction modes
Treat directionality as a system concern.

Test:

- Start/end spacing
- icon mirroring
- breadcrumb order
- progress direction
- charts and timelines
- mixed-direction text
- input alignment
- overlay placement
- animation direction
- number formatting

Use logical properties such as `margin-inline` and `padding-block` where available.

---
