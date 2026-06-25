# 23. Engineering architecture

## 23.1 Choose delivery boundaries
Possible packages:

```txt
@system/tokens
@system/icons
@system/styles
@system/primitives
@system/components
@system/patterns
@system/charts
@system/content
@system/testing
@system/eslint-config
@system/codemods
```

Avoid publishing a package for every tiny concept if coordinated versioning becomes burdensome.

## 23.2 Repository strategy

### Monorepo
Useful when:

- Packages change together
- shared tooling matters
- atomic changes are valuable
- maintainers span packages

### Multiple repositories
Useful when:

- Platform teams have independent release cycles
- access boundaries differ
- technology stacks are unrelated
- ownership is clearly separated

The repository model should follow ownership and release needs, not fashion.

## 23.3 CSS architecture
A web system may use:

- CSS custom properties for tokens
- cascade layers
- scoped component classes
- logical properties
- normalized base styles
- utility classes or layout primitives
- media and container queries
- theme attributes
- forced-color adaptations

Example:

```css
@layer reset, tokens, base, components, utilities, overrides;

@layer tokens {
  :root {
    --color-text-default: #171717;
    --color-surface-default: #ffffff;
    --space-control-inline: 0.75rem;
    --radius-control: 0.5rem;
  }

  [data-color-mode="dark"] {
    --color-text-default: #f5f5f5;
    --color-surface-default: #171717;
  }
}

@layer components {
  .Button {
    color: var(--button-text, var(--color-text-on-action));
    background: var(--button-background, var(--color-action-primary));
    padding-inline: var(--space-control-inline);
    border-radius: var(--radius-control);
  }
}
```

Keep public custom properties distinct from internal implementation variables.

## 23.4 Component implementation shape
A conceptual typed component:

```tsx
type ButtonProps = {
  tone?: "accent" | "neutral" | "critical";
  emphasis?: "solid" | "subtle" | "minimal";
  size?: "compact" | "default" | "large";
  loading?: boolean;
  loadingLabel?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  tone = "accent",
  emphasis = "solid",
  size = "default",
  loading = false,
  loadingLabel = "Loading",
  disabled,
  children,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "button"}
      data-tone={tone}
      data-emphasis={emphasis}
      data-size={size}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
    >
      {loading ? <span>{loadingLabel}</span> : children}
    </button>
  );
}
```

This is illustrative, not a complete production implementation. Real components need decisions about label persistence, spinner semantics, layout stability, and form behavior.

## 23.5 Keep DOM contracts intentional
Changing DOM structure can affect:

- CSS selectors
- screen-reader interpretation
- focus behavior
- browser autofill
- tests
- analytics hooks
- product integrations

Do not promise DOM structure as public API unless consumers truly need it. Provide explicit hooks instead.

## 23.6 Avoid prop forwarding hazards
Filter internal props so they do not become invalid DOM attributes. Preserve native attributes where possible. Avoid redefining native behavior with incompatible types.

## 23.7 Ref and imperative behavior
Use imperative APIs only for actions that cannot be represented declaratively, such as:

- Focus
- scroll into view
- measure
- open a native picker

Document lifecycle and server-rendering constraints.

## 23.8 Server rendering and hydration
Components should avoid:

- Reading browser globals during server rendering
- generating unstable IDs
- rendering different initial markup on client and server
- depending on layout measurement before initial paint without fallback
- hiding essential content until hydration

Test components in the rendering environments used by consuming applications.

## 23.9 Performance
Set budgets for:

- Package size
- per-component import cost
- CSS size
- icon payload
- font payload
- runtime work
- layout shift
- animation cost
- chart and editor dependencies

Support tree-shaking or equivalent dead-code elimination where the ecosystem relies on it. Avoid making every consumer download the entire library for one component.

## 23.10 Dependency policy
For each dependency, assess:

- Maintenance health
- accessibility
- bundle impact
- security
- licensing
- platform support
- API stability
- theming capability
- replacement cost

Wrap third-party behavior behind your own stable API when replacing the dependency later would otherwise affect every consumer.

## 23.11 Native delivery
For native platforms, consider generated:

- Color assets
- dimensions
- text styles
- icons
- motion values
- component themes

Keep native interaction code native where practical. Sharing token data does not require sharing one runtime.

## 23.12 Email delivery
Email systems have severe rendering constraints. Create a separate supported layer with:

- Inline-compatible styles
- tested layout primitives
- accessible table structure where required
- dark-mode treatment
- image fallbacks
- text alternatives
- client test matrix
- strict component subset
- content length guidance

Do not assume web components can be reused directly in email.

## 23.13 Security and privacy
System components can affect security.

Review:

- Link safety
- HTML sanitization
- rich-text rendering
- file upload
- password controls
- authentication flows
- clipboard behavior
- external content
- analytics defaults
- personally identifiable information in examples
- safe error messages

A system should not introduce hidden telemetry. Any usage analytics should be documented and privacy-reviewed.

## 23.14 Linting and automation
Useful automation:

- Ban raw color values outside token packages
- detect deprecated imports
- enforce accessible labels
- flag invalid component combinations
- generate token types
- validate theme completeness
- check package boundaries
- create codemods
- scan visual snapshots
- verify documentation examples compile

Automation should teach through actionable messages, not merely fail builds.

---

# 24. Design tooling and source-of-truth rules

## 24.1 Define a source-of-truth map
There is rarely one tool that can own everything.

Example:

|Concern|Authoritative source|
|---|---|
|Token semantics|Version-controlled token repository|
|Code behavior|Component source and tests|
|Design variants|Published design library|
|Accessibility contract|Documentation and tests|
|Content guidance|Documentation|
|Icons|Asset repository|
|Roadmap|Work-tracking system|
|Decisions|RFC/ADR repository|
|Releases|Package registry and changelog|

The important part is knowing which source wins when tools disagree.

## 24.2 Design library structure
Possible library split:

```txt
Foundations
Core components
Product patterns
Brand assets
Marketing templates
Experimental
Deprecated
```

Split libraries based on ownership, publication cadence, and consumer needs. Too many libraries make discovery difficult; one enormous library becomes slow and hard to govern.

## 24.3 Align design and code properties
Example mapping:

|Design property|Code prop|
|---|---|
|Tone|`tone`|
|Emphasis|`emphasis`|
|Size|`size`|
|Loading|`loading`|
|Leading icon|`leadingIcon`|
|Full width|`width="full"` or layout wrapper|

Use the same values where practical. Do not create a design variant called “Filled/Blue” and a code variant called `primary` if they represent the same concept.

## 24.4 Component naming
Names should be:

- Based on purpose
- stable across visual redesigns
- shared across tools
- searchable
- distinct from product-specific names
- singular or plural by a consistent rule

Document synonyms so users searching for “dropdown” can still find Menu, Select, or Combobox guidance and understand the difference.

## 24.5 Design-library release process
A release should include:

- Updated component or variable assets
- version or release marker
- change summary
- affected components
- migration notes
- links to documentation
- deprecation flags
- communication to affected teams

Coordinate design releases with code releases when property names or behavior change.

## 24.6 Branching and experimentation
Use separate areas for:

- Stable
- beta
- exploratory
- product-local
- deprecated

Do not publish unfinished experiments into the default consumer library without visible status.

## 24.7 Design-code parity
Track parity at the concept level:

```txt
Component: Dialog
Design asset: stable
Web code: stable
iOS code: beta
Android code: not planned
Documentation: stable
Accessibility test: passed
```

Perfect simultaneous parity may be unrealistic. Visible status is better than pretending parity exists.

## 24.8 Handoff
A system-aware handoff should communicate:

- Component names
- properties
- tokens
- layout rules
- responsive changes
- states
- content
- analytics hooks
- accessibility behavior
- product-specific logic
- exceptions

Avoid redlining values that already exist as system tokens or component properties.

---

# 25. Documentation
Documentation is the interface of the design system.

## 25.1 Documentation audiences
Create paths for:

- New designers
- new engineers
- experienced consumers
- contributors
- product managers
- writers and marketers
- accessibility testers
- brand teams
- external partners

Do not force every audience through the same level of implementation detail.

## 25.2 Information architecture
A practical structure:

```txt
Getting started
├── What the system covers
├── Installation and access
├── Design setup
├── Engineering setup
└── Support

Foundations
├── Color
├── Typography
├── Layout
├── Motion
├── Imagery
└── Content

Components
Patterns
Templates
Brand and themes
Accessibility
Contribution
Releases
Migration
Roadmap and status
```

## 25.3 Component documentation template
```md
# Component name

## Summary
One sentence describing the component's job.

## Use when
Supported situations.

## Do not use when
Commonly confused alternatives.

## Anatomy
Named parts and structure.

## Variants
Purpose of each supported variant.

## States
Default, hover, focus, active, disabled, loading, error, and others.

## Behavior
Mouse, touch, keyboard, focus, async, and responsive behavior.

## Content
Labels, length, terminology, and localization guidance.

## Accessibility
Semantics, names, keyboard model, announcements, and consumer duties.

## Design
Library link, properties, tokens, and examples.

## Code
Installation, imports, API, examples, and supported environments.

## Theming
Supported tokens and customization boundaries.

## Testing
What the system tests and what consumers must test.

## Related
Alternatives, patterns, and dependencies.

## Status
Owner, version, stability, and known limitations.
```

## 25.4 Show decisions, not only demos
A component gallery says what exists. Good documentation explains:

- Why it exists
- when to use it
- when not to use it
- how to choose variants
- what breaks
- which responsibilities remain with consumers

## 25.5 Use realistic examples
Examples should include:

- Typical content
- long content
- empty content
- translated content
- errors
- loading
- small viewports
- dense data
- keyboard operation
- dark and high-contrast themes

Avoid examples made entirely from “Lorem ipsum” and “Button.”

## 25.6 Executable examples
Where possible:

- Compile code examples
- run accessibility checks
- test examples as part of CI
- link examples to source
- allow theme and viewport switching
- show event output
- expose markup or accessibility tree summaries

A broken example damages trust in the whole system.

## 25.7 Versioned documentation
Consumers should be able to identify:

- Current version
- documentation version
- previous versions
- deprecated features
- migration path
- release date
- support window

Documentation that always shows only the newest API is risky during staggered migrations.

## 25.8 Documentation maintenance
Give each page:

- Owner
- last reviewed date
- status
- related package version
- feedback mechanism

Include documentation work in the definition of done.

## 25.9 Search and discovery
Support:

- Synonyms
- task-based search
- component names
- common incorrect terms
- filters by platform and status
- links from design-tool assets
- links from code warnings
- related-content suggestions

Track searches with no result. They reveal missing guidance and vocabulary mismatches.

---
