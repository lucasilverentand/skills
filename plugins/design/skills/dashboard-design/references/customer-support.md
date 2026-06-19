# Domain Blueprint: Customer Support
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 19. Domain blueprint: customer support
Customer-support products usually require two distinct surfaces:

1. **Agent workbench** — process conversations efficiently.
2. **Manager dashboard** — monitor queue health, capacity, SLA, quality, and trends.

Do not merge them into one compromised interface.

Zendesk’s support dashboards cover backlog, unsolved tickets, satisfaction, SLA, and agent activity.[^zendesk-dashboard] Intercom’s real-time dashboard focuses on inbox health, unassigned and waiting conversations, teammate capacity, response times, SLA miss rate, and CSAT.[^intercom-dashboard]

### 19.1 Product-area information architecture
```text
Support
├─ Inbox / queues
├─ My work
├─ Customers
├─ Tickets / conversations
├─ Knowledge
├─ Workflows / routing
├─ Macros / templates
├─ Reports
├─ Team / capacity
├─ SLA policies
└─ Settings / audit
```

### 19.2 Agent workbench
```text
[My queue] [Search] [Status] [Priority] [Channel] [Sort]

Conversation list 35% | Conversation 45% | Customer context 20%
                      | Thread            | Identity / plan
                      | Composer          | Recent activity
                      | Actions           | Past tickets
```

Conversation list SHOULD show:

- customer/requester;
- subject or latest meaningful message;
- channel;
- status;
- priority;
- SLA/due time;
- assignee/team;
- waiting-on state;
- age and last update;
- tags or risk flags only when useful.

The workbench SHOULD support:

- next/previous item;
- reply, note, and forwarding modes;
- assignment;
- status transition;
- macros/templates;
- attachment handling;
- customer context;
- related incidents/status;
- collision awareness when another agent is viewing or typing;
- draft preservation;
- keyboard shortcuts with help.

### 19.3 Reply composer
Structure:

```text
Mode: [Reply to customer | Internal note]
Recipients / channel context

[Rich text composer]
[Attachments] [Macro] [Knowledge] [AI assist]

Status after send [Pending ▼]     [Send]
```

MUST:

- visually distinguish public reply from internal note;
- preserve drafts;
- warn before sending sensitive internal content publicly when detectable;
- expose recipient/channel;
- show attachment upload state;
- make send state explicit;
- handle failure without losing content;
- identify AI-generated content and keep the human in control.

### 19.4 Customer context panel
Show only support-relevant context:

- identity and organization;
- plan/tier and entitlements;
- locale/timezone;
- recent conversations;
- product/app status;
- account health flags;
- recent billing or deployment events when authorized;
- consent and sensitive-data markers;
- internal notes.

Avoid a dumping ground of every CRM field. Prioritize data that changes the response or escalation.

### 19.5 Manager real-time dashboard
Recommended structure:

```text
Support · All inboxes · Today / Live

[Unassigned] [Waiting first reply] [SLA at risk] [Open] [Active agents]

Queue health by inbox/team --------------------------------
[Inbox | Unassigned | Oldest | SLA risk | Capacity | Status]

Arrival vs completion trend       Agent/team capacity

Oldest / highest-risk conversations table
```

Operational metrics:

- new volume;
- open backlog;
- unassigned count;
- waiting for first reply;
- oldest waiting time;
- SLA at risk and breached;
- active/available teammates;
- arrivals versus completions;
- current channel queue.

Quality/performance metrics belong in a tactical report unless they affect immediate decisions:

- first response time;
- resolution time;
- reopen rate;
- one-touch resolution;
- CSAT;
- escalation rate;
- backlog aging;
- knowledge deflection;
- automation containment with quality guardrails.

### 19.6 Capacity UX
Do not show “agents online” without queue context. Pair capacity with:

- active workload;
- assigned/open count;
- unassigned count;
- arrival rate;
- oldest wait;
- channel capability;
- availability state and reason;
- schedule/timezone if appropriate.

Avoid simplistic individual leaderboards. They can reward closing easy tickets, discourage collaboration, and ignore case complexity. Prefer team-level outcomes plus drill-down for coaching with appropriate context.

### 19.7 SLA UX
An SLA indicator SHOULD show:

- policy and target;
- metric being timed;
- time remaining or breach duration;
- business versus calendar time;
- pause conditions;
- priority;
- escalation path.

Use relative urgency in queues but provide the exact due timestamp. Make paused timers visibly distinct from active ones.

### 19.8 Routing and automation
Use a rule builder with:

- entry conditions;
- priority/order;
- assignment action;
- capacity/availability behavior;
- fallback;
- test conversation;
- conflict detection;
- version history;
- publish/rollback;
- explanation on each conversation: “Assigned to Billing because …”.

### 19.9 Support reporting
Separate:

- real-time operations;
- daily/weekly team management;
- monthly strategic outcomes;
- quality review;
- customer-segment analysis.

Each needs different freshness, aggregation, and behavior. Do not use a live operational queue as a historical performance report.

### 19.10 Sensitive customer data
- Mask PII according to role and purpose.
- Log access to sensitive records.
- Make exports explicit and permissioned.
- Avoid exposing full payment, credential, health, or private content in list views.
- Protect copied content and screenshots where policy requires it.
- Distinguish customer-visible and internal fields throughout the workflow.

---
