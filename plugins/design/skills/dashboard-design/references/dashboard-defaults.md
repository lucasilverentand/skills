# Dashboard Defaults
Use these as strong defaults when designing, reviewing, or building dashboard-like product surfaces. They are not strict house rules: override them when the product domain, audience, platform, or existing design system clearly calls for a different choice.

## Philosophy
**Default to decision/action-first dashboards** - A dashboard should help someone decide what matters and what to do next. A polished surface that does not change a decision, shorten a workflow, or establish trust is decoration.

**Optimize for repeated operational use** - Most admin consoles, workbenches, and internal tools are used repeatedly by people trying to scan, compare, triage, and act. Prefer compact hierarchy, stable controls, and clear data over presentation-heavy composition.

**Treat product context as the override mechanism** - Use these defaults when the repo or user has not supplied a stronger product-specific design system. Keep the decision/action, data-trust, and safety principles unless there is a concrete reason to depart.

## Layout and Navigation
**Use dense operational layouts by default** - Compact spacing and high information throughput make dashboard work faster when users are scanning many entities, alerts, or work items. Use more spacious layouts for executive scorecards, review reports, onboarding, or mixed non-technical audiences.

**Prefer restrained system UI** - Default to quiet surfaces, semantic color, readable contrast, familiar controls, and a Linear/Stripe-like precision. This keeps attention on the data and actions rather than the chrome.

**Use structured bands, panes, and tables before card grids** - Full-width sections, split panes, drawers, and tables preserve hierarchy and scale better than floating cards. Cards are acceptable for meaningful repeated entities or compact summaries, but a card grid should not be the default page structure.

**Keep navigation stable** - Prefer a predictable sidebar or header with visible current location and persistent scope. Command-driven access can augment expert workflows, but it should not replace obvious navigation for core dashboard areas.

**Preserve context through drill-downs** - Summary clicks should open filtered lists, detail drawers, tabs, or routes that retain scope, time range, filters, and scroll position where practical. The user should not have to rebuild context after following a signal.

## Metrics, Charts, and Tables
**Use KPI rows only when summaries are actionable** - Top-level summaries should explain priority, link to detail, or support a decision. Avoid vanity numbers that occupy prime space without changing the next action.

**Make charts earn their place** - Use charts when trend shape, anomaly detection, comparison, distribution, or composition changes the decision. Use concise text, status rows, timelines, or tables when they communicate the answer faster.

**Prefer capable tables and lists for many resources** - When a dashboard contains many resources or work items, provide clear columns, sorting, filtering, row actions, bulk actions, pagination or virtualization, and useful empty states.

**Use saved views for repeated operational setups** - If users repeatedly apply the same scope, filters, sort, columns, or grouping, include saved views or presets by default. They make repeated work faster and reduce the risk of hidden ad hoc filtering.

## Scope, Trust, and State
**Make scope visible** - Workspace, tenant, environment, region, segment, and time range should live in a stable context area when they affect interpretation. Hidden scope makes dashboards untrustworthy.

**Surface data freshness and uncertainty when decisions depend on them** - Show freshness, stale states, partial coverage, unknown states, and source confidence where they affect action. Monitoring that stops should never look healthy just because no new errors arrived.

**Use semantic status language** - Pair severity color with text, icons, labels, and accessible structure. Do not rely on color alone or use dramatic color treatment where a precise status label would communicate better.

**Prioritize narrow screens by task value** - On small screens, keep the most important status, identity, and action path first. Move dense comparison into focused views instead of trying to preserve the whole desktop grid.

## Actions and Configuration
**Keep risky actions explicit and auditable** - Production-affecting or destructive actions need clear target, consequence, eligibility, permission handling, audit event, and post-action verification. Avoid both casual one-click danger and confirmation-heavy flows that do not improve understanding.

**Choose form containers by complexity and risk** - Use full pages for complex or high-impact configuration, drawers for moderate contextual edits, and modals only for short focused decisions. Do not put large settings or rule builders in modals by default.

**Place actions near their signals** - A warning, failed job, risky resource, or breaching queue should lead directly to the affected object, evidence, and the next safe action. Do not strand users with a status and no path forward.

## Copy and Empty States
**Use concrete, terse copy** - Labels should name the object, state, action, and consequence. Avoid marketing language, vague verbs, and clever labels in operational surfaces.

**Make empty states specific** - Distinguish first use, valid empty, filtered empty, no permission, not configured, loading, stale, partial, error, and unsupported states. Each should explain what happened and provide the appropriate next action when one exists.

## Advisory vs Build Mode
**For advisory conversations, stay concise** - Return the decision brief, recommended archetype, key trade-offs, questions that still matter, and the next decision. Do not produce a full build spec unless asked.

**For autonomous builds, infer ordinary details and ask only on high-impact gaps** - Infer layout, density, component choice, and common states from the repo and product context. Ask before assuming core users, destructive workflows, security posture, billing impact, or other high-impact product decisions.

**Use a compact internal spec before code** - In build mode, form a brief internal spec for audience, decision, scope, data, layout, actions, states, and validation. The final response should mention the key design choices without dumping the full internal working unless useful.

**Verify rendered dashboards visually** - After implementation, inspect desktop and narrow-screen renders for hierarchy, density, overlap, contrast, state clarity, and whether the main decision/action path is obvious.

## Anti-Patterns
**Anti-pattern: decorative dashboards** - Walls of cards and charts can look complete while failing to help users decide or act. Replace decorative sections with priority, evidence, and action.

**Anti-pattern: hidden context** - If scope, time, environment, permissions, or freshness are hard to find, users cannot trust the page. Surface the context that changes interpretation.

**Anti-pattern: charts as filler** - A chart that does not reveal a trend, comparison, distribution, composition, or anomaly is usually weaker than a status row or table.

**Anti-pattern: card grids as IA** - Cards are components, not an information architecture. If the page needs comparison, prioritization, or repeated work, use tables, queues, panes, and filters.

**Anti-pattern: action without verification** - Starting a job, retry, rollback, restore, or delete flow without durable progress, final result, and recovery or verification path leaves the operator guessing.
