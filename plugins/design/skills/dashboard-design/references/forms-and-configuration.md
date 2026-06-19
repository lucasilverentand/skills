# Forms and Configuration UX
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 12. Forms and configuration UX
Forms are where dashboards become control planes. They require more care than the overview because errors can change production systems, expose data, or disrupt customers.

Carbon and PatternFly both describe forms as groups of related controls that may live on pages, in side panels, dialogs, or wizards depending on the task.[^carbon-forms][^patternfly-forms]

### 12.1 Choose the correct form container
|Structure|Use when|Good examples|Avoid when|
|---|---|---|---|
|**Inline edit**|One independent, low-risk value|Rename resource, change owner|Dependencies or broad impact|
|**Popover**|Tiny, reversible adjustment that must stay in context|Change a display option|Any complex validation|
|**Drawer / side panel**|Moderate form; context from the underlying page remains useful|Edit alert, assign ticket, change metadata|User needs full width or many sections|
|**Modal**|Short, focused, interruptive decision|Confirm archive, add small tag set|Large forms, code editors, multi-step tasks|
|**Full page**|Complex or high-impact configuration|App settings, database connection, routing rules|One or two trivial fields|
|**Wizard / stepper**|Ordered dependencies, onboarding, or review|Create database, restore backup, connect integration|Frequent expert edits that can be handled on one page|
|**Bulk editor**|Apply a shared change across many records|Assign owner, change plan, add tags|Items require individual decisions|
|**Builder / canvas**|Users compose rules, schemas, workflows, or queries|Routing workflow, permission policy|Simple choices better represented by standard controls|
|**Code/query editor**|Expert syntax is the natural model|SQL, log query, JSON policy|Novices have no guided alternative or validation|

### 12.2 Practical complexity heuristic
These are defaults, not laws:

- **1–3 simple fields, low risk:** inline, popover, or small modal.
- **3–8 related fields with useful page context:** drawer.
- **More than roughly 8 fields, multiple sections, or significant explanation:** full page.
- **Dependencies across concepts, creation workflow, or mandatory review:** wizard.
- **Any size with severe irreversible impact:** dedicated review and confirmation, usually not a casual modal.

Risk overrides field count. A one-field “delete production database” action is still high complexity from a decision perspective.

### 12.3 Form anatomy
```text
Title
One-sentence purpose and consequence

Section heading
Optional section description

Label
Helper text when needed
[Input] unit / suffix
Inline validation or warning

Additional sections

[Cancel]                         [Primary submit]
```

For long or high-risk forms, add:

- unsaved-change state;
- section navigation;
- review summary;
- effective-value preview;
- impact estimate;
- change reason;
- documentation link;
- last changed by/at;
- audit-history link.

### 12.4 Grouping and ordering
Group fields by the user’s mental model and workflow:

1. identity;
2. behavior;
3. capacity or limits;
4. access and security;
5. notifications;
6. advanced options.

Do not mirror an internal database schema if it produces incoherent sections.

Within a section:

- ask the easiest orienting questions first;
- place dependent fields directly after their controller;
- place dangerous or advanced settings later;
- keep related units and thresholds together;
- avoid multi-column layouts when field order or error association could become ambiguous.

Top-aligned labels are a strong default because they keep labels near controls and adapt well to narrow screens.[^patternfly-forms]

### 12.5 Labels, helper text, and placeholders
MUST:

- use a persistent visible label;
- make label wording specific;
- identify required or optional status consistently;
- provide expected format where it is not obvious;
- associate help and errors programmatically with the field.

Do not use placeholder text as the only label. It disappears during entry, has weak contrast in many implementations, and cannot carry durable meaning.

Good:

```text
Connection timeout
How long a request may wait before the connection is closed.
[ 30 ] seconds
```

Bad:

```text
[ Enter value ]
```

### 12.6 Input selection
|Need|Preferred control|Notes|
|---|---|---|
|Enable an immediate binary state|Switch|Label the resulting state; save immediately only when safe|
|Include/exclude an option in a submitted form|Checkbox|Works independently|
|Choose one of 2–5 visible options|Radio group|Show all options and descriptions|
|Choose one from a longer list|Select or combobox|Add search for large lists|
|Choose several from a short list|Checkboxes|Make “none” valid when appropriate|
|Choose several from a long list|Multi-select/combobox|Show selected values clearly|
|Enter bounded number|Number input plus unit|Define min, max, step, and decimal behavior|
|Choose date/time|Date/time picker plus text entry|Include timezone and format|
|Enter secret|Secret field|Never reveal stored value; support replace/revoke/test|
|Enter structured expression|Builder or code editor|Validate syntax and semantics separately|
|Select hierarchical items|Tree or drill-down picker|Use when hierarchy is essential, not for a small flat set|

PatternFly recommends switches for two states, radio buttons for one choice among a small set, checkboxes for multiple choices in a short set, and selects for longer option lists.[^patternfly-forms]

### 12.7 Defaults
A default is a product decision. It MAY create cost, risk, or bias.

Defaults SHOULD be:

- safe;
- common;
- reversible;
- transparent;
- appropriate to current scope.

For infrastructure:

- show estimated cost before creation;
- do not default to public access;
- do not preselect broad permissions;
- make production-safe backup and recovery settings clear;
- explain whether defaults are inherited from organization policy.

### 12.8 Validation timing
Use three layers:

1. **Input constraints** — prevent impossible characters or values when appropriate.
2. **Inline validation** — after a field is complete or loses focus; do not scold while the user is still typing.
3. **Submission validation** — validate cross-field and server-side rules.

Errors MUST:

- identify the field;
- describe the problem in text;
- suggest a correction when possible;
- preserve entered values;
- move focus to an error summary or first error in a predictable way;
- remain until corrected.

WCAG requires text identification of detected input errors and labels or instructions for required input.[^wcag-forms]

### 12.9 Warnings versus errors
- **Error:** submission cannot or must not proceed.
- **Warning:** submission may proceed, but the user should understand a consequence.
- **Info:** contextual guidance without a risk condition.

Do not use an error style for optional advice. Warning fatigue makes genuine risk easier to miss.

### 12.10 Dependent fields and progressive disclosure
When a choice reveals more fields:

- reveal them directly below the controller;
- preserve or clearly reset previous values;
- update validation and review state;
- announce dynamic changes accessibly;
- avoid large layout jumps where possible.

Use an “Advanced” section for uncommon expert options, but keep any option that materially changes security, cost, data loss, or availability visible enough to be reviewed.

### 12.11 Save models
Choose one save model and communicate it clearly.

#### Explicit save
Best for related configuration that should be applied atomically.

- Track dirty state.
- Keep save/cancel visible for long pages.
- Warn before navigation with unsaved changes.
- Show conflict if the server value changed meanwhile.

#### Immediate save
Best for independent, reversible preferences.

- Show saving and saved state.
- Revert on failure.
- Provide undo when useful.
- Do not use for consequential settings merely because switches look convenient.

#### Draft + publish
Best for workflows, routing rules, content, or policies.

- Distinguish draft from live version.
- Preview effective behavior.
- Show validation status.
- Identify publisher and publication time.
- Preserve version history and rollback.

### 12.12 Review screens
A review screen is valuable when a task:

- creates cost;
- changes access;
- affects production;
- deletes or overwrites data;
- starts a long-running operation;
- involves many sections or collaborators.

GOV.UK’s check-answers pattern recommends a review before confirmation for small-to-medium transactions, with section-level reviews possible for very large ones.[^govuk-check]

A review SHOULD show:

- target resource and environment;
- consequential choices;
- cost or capacity estimate;
- affected users/resources;
- downtime or restart behavior;
- backup/recovery state;
- editable links to the relevant section;
- final action wording that names the result.

### 12.13 Destructive and high-risk actions
A safe sequence is:

1. State the action and target.
2. Explain impact and reversibility.
3. Show dependencies and affected resources.
4. Offer a safer alternative if one exists.
5. Require an appropriate confirmation.
6. Reauthenticate or require elevated approval for the highest-risk operations.
7. Create an audit event.
8. Show progress and final result.

Confirmation strength SHOULD match risk:

|Risk|Appropriate confirmation|
|---|---|
|Low, reversible|Undo toast or simple confirmation|
|Moderate|Confirmation dialog with impact summary|
|High|Dedicated review, explicit target, reason, and permissions check|
|Severe / irreversible|Review + typed target or equivalent deliberate action + reauthentication/approval + recovery guidance|

Typed confirmation is not a universal safety mechanism. It is appropriate only when deliberate target verification adds value. Do not make users type generic words such as `DELETE` for routine reversible actions.

WCAG guidance recognizes reversibility and review/correction as ways to prevent consequential errors.[^wcag-error-prevention]

### 12.14 Forms for secrets and credentials
- Never repopulate an existing secret.
- Show that a secret exists and when it was last rotated.
- Use “Replace,” “Rotate,” or “Revoke,” not ambiguous “Edit.”
- Allow connection testing without exposing the value.
- Explain which services will restart or lose access.
- Redact secrets in logs, previews, errors, and audit records.
- Avoid placing secrets in URLs, copied commands, or client-visible analytics.

### 12.15 Forms for rules and workflows
A rule builder SHOULD expose:

```text
WHEN [conditions]
IF/ELSE [optional branches]
THEN [actions]
EXCEPT [exclusions]
```

Also provide:

- natural-language summary;
- validation;
- test cases or sample matching records;
- conflict and precedence explanation;
- draft/publish state;
- version history;
- rollback;
- “why did this rule run?” evidence in operational records.

### 12.16 One question per page
For novice, public, or cognitively demanding journeys, one primary question per page can reduce cognitive load. GOV.UK recommends this approach for question pages.[^govuk-question]

For expert admin products, a compact grouped form may be faster. Choose based on:

- frequency;
- expertise;
- field dependencies;
- error cost;
- need for overview;
- device constraints.

---
