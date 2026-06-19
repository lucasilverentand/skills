# Tables, Lists, and Queues
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 10. Tables, lists, queues, and grids
Tables are often the most important component in operational products. They support four common tasks: finding records, comparing them, viewing or editing one record, and taking action on records.[^nng-tables]

### 10.1 Table versus data list versus cards
Use a **table** when:

- rows share consistent fields;
- column comparison matters;
- sorting and filtering matter;
- values are compact.

Use a **data list** when:

- row content varies;
- each item has richer text or media;
- a strict column model would be awkward;
- responsive flexibility matters.

Use **cards** when:

- the set is small;
- visual identity matters;
- each item has a few high-level facts;
- comparison precision is secondary.

PatternFly similarly recommends data lists for flexible, non-tabular rich rows and tables for clearly columnar data.[^patternfly-data-list]

### 10.2 Column design
Order columns by task:

1. identity;
2. actionable status;
3. primary comparison values;
4. ownership or scope;
5. recency;
6. secondary metadata;
7. actions.

Rules:

- Keep the primary identifier visible when horizontally scrolling.
- Align numeric values for comparison.
- Put units in headers when every value shares the unit.
- Use exact timestamps in detail and human-readable relative time in overview, with exact time available.
- Avoid a separate column for every rare attribute; use row detail or customizable columns.
- Truncated content MUST have an accessible way to reveal the full value.

### 10.3 Sorting
- Indicate the current sort and direction.
- Use a useful default: urgency for queues, status/impact for fleets, recency for events.
- Preserve stable ordering when live data updates.
- Explain composite priority when it is algorithmic.
- Avoid ambiguous “Status” sorting unless the status order is defined.

### 10.4 Filtering and search
A table toolbar SHOULD provide only relevant controls:

```text
[Search] [Status] [Owner] [Region] [More filters] [Saved view]
                                              [Columns] [Export]
```

- Show active filters as removable chips or a clear summary.
- Show result count.
- Provide “Clear all.”
- Distinguish a local table search from global product search.
- Do not hide high-frequency filters in an advanced drawer.

### 10.5 Row actions
Use one visible primary row action only when it is frequent and unambiguous. Put secondary actions in an overflow menu.

Do not:

- reveal critical actions only on hover;
- use icon-only actions without accessible names and tooltips where needed;
- place destructive and harmless actions adjacent without separation;
- let clicking an action also trigger row navigation.

### 10.6 Selection and bulk actions
Checkbox selection and row navigation are distinct states.

When items are selected:

```text
12 selected   [Assign] [Change status] [Export] [More]
```

Bulk actions MUST:

- state the count;
- show mixed-value behavior;
- explain unsupported items;
- provide an impact preview for risky operations;
- handle partial success with per-item results;
- retain a downloadable result for large jobs.

### 10.7 Pagination, infinite scroll, and virtualization
Use **pagination** when:

- users need stable pages or shareable positions;
- the dataset is large;
- selection across pages is meaningful;
- exact counts matter.

Use **infinite scroll** sparingly, mainly for chronological feeds where position is less important.

Use **virtualization** for performance in dense expert grids, but preserve:

- keyboard navigation;
- screen-reader semantics as far as technically possible;
- stable focus;
- reliable selection;
- export for the full dataset.

### 10.8 Inline editing
Inline editing works for small, independent, low-risk values such as a label, owner, or priority.

Use a form or drawer when:

- fields depend on one another;
- validation is complex;
- the change has broad impact;
- users need explanatory context;
- multiple values must be reviewed together.

Inline edit MUST show saving, success, error, and conflict states. It SHOULD support cancel and keyboard operation.

### 10.9 Queue-specific details
A queue item SHOULD make priority understandable through a combination of:

- SLA or due time;
- severity or customer impact;
- age;
- assignment;
- status;
- customer or resource identity;
- channel/source;
- last meaningful update.

Do not rely on an unexplained opaque priority score. If machine ranking is used, expose the major reasons and allow a sensible manual sort.

---
