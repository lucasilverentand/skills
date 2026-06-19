# Domain Blueprint: Database Management
Source: Dashboard UX Playbook for Product-Building Agents, version 1.0, June 2026.

## 18. Domain blueprint: database management
Database management spans fleet monitoring, performance diagnosis, schema/data work, backups, replication, access, and dangerous operations. PostgreSQL’s monitoring guidance covers current activity, cumulative statistics, locks, progress, and disk usage; AWS RDS similarly combines fleet monitoring, instance metrics, activity, logs, and performance insights.[^postgres-monitoring][^aws-rds-monitoring]

### 18.1 Product-area information architecture
```text
Databases
├─ Fleet
├─ Instances / clusters
├─ Query performance
├─ Backups
├─ Replication
├─ Jobs / maintenance
├─ Users & access
├─ Audit log
└─ Settings / policies
```

Within one database:

```text
Overview
Activity
Queries
Schema
Data browser
Backups
Replication
Logs
Configuration
Access
Audit
```

### 18.2 Fleet dashboard
Recommended table:

|Field|Why it matters|
|---|---|
|Name|Identity|
|Environment|Risk and scope|
|Engine/version|Compatibility and maintenance|
|Region|Failure domain and latency|
|Status|Current state|
|DB load / connections|Work pressure|
|CPU / memory / storage|Capacity evidence|
|Replication lag|Recovery/read consistency|
|Backup status|Recoverability|
|Maintenance/version warning|Planned risk|
|Owner|Accountability|

Top summary:

- total databases;
- healthy/degraded/critical/unknown;
- backup failures;
- storage risk;
- high load;
- replication issues;
- pending maintenance.

AWS’s fleet-health model similarly summarizes instance state and provides an overview table for alarm state, load, and recency.[^aws-fleet]

### 18.3 Database detail overview
```text
orders-prod  PostgreSQL 18  Degraded
Production · eu-west-1 · primary · Team Commerce
[Connect] [Open query editor] [Create backup] [More]

[DB load] [Connections] [Storage] [Replication lag] [Backup age]

Load over time + deployment/maintenance annotations

Top waits / top queries / blocking locks

Recent events and configuration changes
```

### 18.4 Query performance workbench
Controls:

- database;
- time window;
- normalized query search;
- user/application;
- wait type;
- minimum duration;
- execution count;
- sort by total time, mean, p95, rows, I/O, or calls.

Results SHOULD show:

- normalized query fingerprint;
- total and average time;
- percentile latency if available;
- calls;
- rows;
- CPU/I/O/waits;
- last seen;
- plan changes;
- associated application/service;
- safe access to sample text.

Detail MAY include:

- execution plan visualization;
- plan diff;
- bind/sample values only when permitted and redacted;
- indexes used/missed;
- blocking/lock context;
- related deployments;
- recommendation with confidence and caveats.

Never present a generated index or query rewrite as a one-click safe fix without impact, locking, storage, and rollback considerations.

### 18.5 Activity and locks
Provide a live table with:

- process/session ID;
- user/application;
- database;
- state;
- query duration;
- transaction age;
- wait event;
- blocking relationship;
- client/source;
- current query with redaction.

Actions such as cancel query or terminate session MUST:

- explain difference;
- identify affected transaction and application;
- show target and duration;
- require appropriate permission;
- produce an audit event;
- report actual result, including race conditions where the session ended first.

### 18.6 Schema and data browser
Schema navigation:

- searchable tree or object list;
- tables, views, indexes, functions, types;
- object owner and permissions;
- size and activity;
- dependencies;
- DDL with copy/export;
- recent changes.

Data browser:

- default read-only in production;
- explicit row limits;
- clear ordering caveat;
- type-aware formatting;
- sensitive-column redaction;
- safe filter builder;
- generated query preview;
- export permission and audit;
- no hidden full-table scan caused by innocent UI behavior.

### 18.7 Query editor
MUST include:

- current database/environment and role;
- read/write status;
- syntax highlighting;
- query history with sensitivity controls;
- cancellation;
- elapsed time;
- row limit;
- execution plan option;
- transaction state;
- clear error location;
- result grid and export rules.

For production write queries:

- use a visually persistent production context;
- warn when no `WHERE` clause is detected for destructive statements, while acknowledging that static detection is imperfect;
- support transaction/rollback workflow where possible;
- require elevated permission or approval according to policy;
- do not store sensitive literal values in analytics or URLs.

### 18.8 Backups and restore
Backup list:

- source database;
- backup type;
- start/end;
- status;
- size;
- retention/expiry;
- encryption;
- region/location;
- restore-test status;
- initiator.

Restore wizard:

1. Select backup or point in time.
2. Select target strategy: new database, overwrite, or alternate environment.
3. Configure capacity/network/access.
4. Review data-loss window, downtime, dependencies, and cost.
5. Confirm and monitor job.

A recent backup is central to recovery; database guidance treats regular backups as a foundational maintenance task.[^postgres-maintenance]

### 18.9 Replication and high availability
Show:

- topology;
- primary and replicas;
- role and health;
- replication lag in time and bytes;
- replay position;
- region/zone;
- connection/read traffic;
- failover readiness;
- last test;
- data-loss objective and recovery-time objective if defined.

Failover controls MUST distinguish planned switchover from emergency failover and explain expected downtime, data loss risk, DNS/connection behavior, and rollback limitations.

### 18.10 Database configuration forms
For each parameter show:

- current value;
- effective value;
- source/inheritance;
- default;
- valid range;
- unit;
- restart/reload requirement;
- dynamic versus static behavior;
- risk or recommendation;
- last changed by/at.

Bulk parameter changes SHOULD produce a change set with validation and review rather than saving each field independently.

### 18.11 Delete database flow
A severe-risk flow SHOULD show:

- exact database and environment;
- dependent apps/integrations;
- active connections;
- latest verified backup and retention;
- replicas/readers affected;
- scheduled jobs;
- deletion protection state;
- recovery window after deletion, if any;
- required approval or reauthentication;
- typed resource name only when deliberate identity confirmation is valuable.

Offer safer alternatives:

- disable writes;
- stop/suspend;
- archive;
- create final backup;
- reduce capacity;
- detach app connections.

---
