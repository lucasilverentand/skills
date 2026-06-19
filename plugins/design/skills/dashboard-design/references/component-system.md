# Component and Design-System Requirements
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 21. Component and design-system requirements
A dashboard product SHOULD have a reusable component system rather than bespoke cards on every page.

### 21.1 Foundation tokens
Define:

- spacing scale;
- typography roles;
- semantic colors;
- border and elevation rules;
- radii;
- motion durations and reduced-motion behavior;
- breakpoints;
- density modes;
- z-index layers;
- chart palette;
- focus style.

### 21.2 Core components
At minimum:

- app shell and navigation;
- page header;
- breadcrumbs;
- environment/scope selector;
- time picker;
- filter bar and chips;
- search/combobox;
- status indicator;
- metric card;
- chart frame with common loading/error/empty behavior;
- table/data grid;
- data list;
- pagination;
- primary-detail drawer;
- tabs;
- description list;
- timeline;
- alert/banner/toast;
- empty state;
- skeleton;
- form controls;
- error summary;
- modal/drawer;
- wizard;
- code/query editor wrapper;
- job progress and jobs center;
- confirmation/review pattern;
- audit diff.

### 21.3 Component state contract
Every data-bearing component MUST define:

```yaml
states:
  - loading_initial
  - loading_refresh
  - loaded
  - empty_first_use
  - empty_filtered
  - stale
  - partial
  - error_recoverable
  - error_terminal
  - permission_denied
```

Every interactive component MUST define:

```yaml
interaction_states:
  - default
  - hover
  - focus_visible
  - active
  - selected
  - disabled
  - saving
  - success
  - error
```

### 21.4 Density
Support at least:

- **comfortable** — general product use and touch-friendly layouts;
- **compact** — expert tables and queues.

Density MUST not reduce touch targets, focus visibility, or readable line height below accessible requirements. Compact mode is an information-density option, not permission to make controls unusable.

### 21.5 Card usage
Use cards to create meaningful groups, not to put a border around every piece of text.

Avoid nested cards. Prefer whitespace, headings, dividers, and aligned layout when the relationship is already clear.

### 21.6 Content style
- Use nouns for destinations: “Databases,” “Incidents,” “Backups.”
- Use verbs for actions: “Create database,” “Retry job.”
- Use sentence case.
- Use consistent domain terms.
- Avoid unexplained acronyms.
- Make error and warning copy concrete.
- Name the object and environment in risky actions.

---
