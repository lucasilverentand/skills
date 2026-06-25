# 16. Data visualization
Data visualization is a semantic system, not merely a color palette.

## 16.1 Define chart purpose
Classify needs:

- Comparison
- trend
- distribution
- part-to-whole
- relationship
- ranking
- geography
- flow
- uncertainty
- progress
- status

Recommend chart types by task, not by aesthetics.

## 16.2 Visualization foundations
Define:

- Categorical palette
- sequential palette
- diverging palette
- status colors
- gridlines
- axes
- labels
- annotation
- tooltips
- legends
- focus states
- selection
- empty and loading states
- print behavior
- dark mode
- high-contrast mode

## 16.3 Accessibility
Provide:

- Text alternatives
- accessible summaries
- keyboard exploration where interaction is essential
- visible focus
- non-color differentiation
- patterns or shapes when needed
- direct labels where possible
- sufficient target sizes
- screen-reader ordering
- table alternatives for critical data

## 16.4 Numeric integrity
Document:

- Axis baseline policy
- truncation rules
- aggregation
- rounding
- missing data
- uncertainty
- outliers
- logarithmic scales
- normalization
- comparison periods

A design system should prevent visually misleading defaults.

## 16.5 Chart component strategy
Decide whether to:

- Build wrappers around an existing charting engine
- create higher-level chart recipes
- provide only tokens and guidance
- create domain-specific visualization patterns

Do not rebuild a complete charting engine unless there is a compelling reason and sustained capacity.

---

# 17. Content design and voice
Words are interface material.

## 17.1 Content system layers

### Voice
The stable personality of the organization or product.

### Tone
How the voice adapts to context, urgency, emotion, and audience.

### Terminology
Approved names for actions, objects, statuses, roles, and domain concepts.

### Microcopy patterns
Reusable structures for labels, errors, confirmations, onboarding, empty states, and notifications.

### Content operations
Ownership, review, localization, and maintenance.

## 17.2 Define voice dimensions
Use concrete axes such as:

- Formal ↔ conversational
- concise ↔ explanatory
- reserved ↔ expressive
- technical ↔ plain-language
- authoritative ↔ collaborative
- playful ↔ serious

For each dimension, provide real examples.

```md
Prefer: “Save changes”
Avoid: “Execute configuration update”

Prefer: “We couldn’t upload the file. It exceeds the 25 MB limit.”
Avoid: “An error occurred.”
```

## 17.3 Component content guidance
Each component should document content constraints.

For a button:

- Use a verb plus object when useful.
- Describe the immediate action.
- Avoid punctuation except where language requires it.
- Do not use “Click here.”
- Keep paired actions distinct.
- Do not use “Yes” and “No” when the underlying action can be named.

For an error:

- State what happened.
- Explain the cause when known.
- Tell the user how to recover.
- Preserve entered data when possible.
- Avoid blame.
- Include support or reference information only when useful.

## 17.4 Terminology governance
Maintain a terminology register with:

- Preferred term
- definition
- forbidden or deprecated terms
- grammatical form
- plural
- capitalization
- localization notes
- owner
- related UI labels

Terminology changes can be breaking experience changes. Coordinate them across product, support, legal, analytics, and documentation.

## 17.5 Localization readiness
Design content patterns for:

- Text expansion
- plural rules
- grammatical gender
- formal and informal address
- regional terminology
- date and number formats
- right-to-left layout
- sentence fragments
- dynamic placeholders
- variables and interpolation
- legal text
- unavailable translations

Avoid concatenating translated fragments.

Bad:

```ts
t("You have") + count + t("new messages")
```

Better:

```ts
t("messageCount", { count })
```

## 17.6 Content models
For CMS-driven systems, define structured fields rather than one large rich-text field where possible.

Example content model:

```txt
Hero
- eyebrow
- heading
- summary
- primary action
- secondary action
- media
- theme
- alignment
```

The design system should specify content limits and fallback behavior for each field.

---

# 18. Accessibility and inclusive design
Accessibility is a cross-cutting requirement, not a separate component category.

## 18.1 Accessibility model
Address:

- Perception
- operation
- understanding
- compatibility
- cognitive load
- motion sensitivity
- language
- input diversity
- temporary impairments
- environmental constraints

## 18.2 Accessibility responsibilities by layer

### Tokens
- Contrast-safe semantic roles
- visible focus values
- target-size values
- reduced-motion values
- high-contrast modes

### Components
- Semantics
- keyboard behavior
- focus management
- labels
- state announcement
- validation behavior
- touch target
- zoom and reflow

### Patterns
- Logical task order
- clear recovery
- error prevention
- status communication
- timeout handling
- authentication alternatives

### Content
- Plain language
- descriptive labels
- meaningful link text
- accessible names
- alt text
- captions and transcripts

### Documentation
- Accessibility expectations
- tested assistive technologies
- examples
- known limits
- consumer responsibilities

## 18.3 Keyboard interaction
For each interactive component, document:

- Tab order
- arrow-key behavior
- Enter and Space behavior
- Escape behavior
- Home and End behavior
- typeahead
- focus entry
- focus exit
- focus restoration
- disabled-item behavior

Do not invent keyboard interactions without checking established platform and accessibility conventions.

## 18.4 Focus management
Focus should:

- Move only when necessary
- remain visible
- follow task logic
- enter overlays appropriately
- stay contained where required
- return to a logical trigger
- survive rerenders
- not be lost during loading
- not jump merely because content updated

## 18.5 Forms and errors
Accessible forms need:

- Persistent labels
- programmatic label association
- descriptions
- required-state communication
- input purpose
- clear validation
- field-level errors
- summary errors for long forms
- focus movement after failed submission where useful
- preserved values
- non-color error cues

## 18.6 Zoom, reflow, and text resizing
Test:

- Browser zoom
- text-only resizing where relevant
- narrow viewports
- landscape mobile
- dynamic type on native platforms
- long content
- fixed-position controls
- sticky regions
- dialogs
- tables
- navigation

Avoid critical actions that disappear or overlap at enlarged text sizes.

## 18.7 Assistive technology testing
Automated checks find only part of the problem. Include manual testing with:

- Keyboard only
- screen reader
- zoom and magnification
- high contrast
- reduced motion
- voice control where relevant
- touch exploration on mobile

Document the test matrix and ownership.

## 18.8 Inclusive defaults
Good inclusive defaults include:

- Clear labels
- forgiving targets
- plain error messages
- persistent state
- multiple ways to complete critical tasks
- no time limits without extension
- no required motion gestures
- no dependence on color
- no audio-only information
- readable text and line length
- predictable navigation
- respectful identity fields
- flexible name and address models

---
