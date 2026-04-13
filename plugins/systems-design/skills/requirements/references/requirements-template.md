# Requirements Template

Example structured requirements output. Copy the structure, fill in the specifics.

---

# Requirements: <System Name>

## Summary

<2-3 sentences: what this system does, who uses it, why it needs to be built now.>

## Functional requirements

| # | Requirement | Priority | Notes |
|---|---|---|---|
| F1 | <What the system must do> | Must | <Any constraints or clarifications> |
| F2 | <...> | Must | |
| F3 | <...> | Should | |
| F4 | <...> | Could | <Nice-to-have for v1, revisit after launch> |

Priority uses MoSCoW: **Must** (launch blocker), **Should** (important but workaround exists), **Could** (nice-to-have), **Won't** (explicitly out of scope for now).

## Non-functional requirements

| NFR | Target | Rationale | Hard constraint? |
|---|---|---|---|
| **Throughput** | <X req/s peak> | <Why this number — based on current traffic * growth factor, or a business event like Black Friday> | Yes / No |
| **Latency** | <p99 < Xms for Y operation> | <Why — conversion impact, user expectation, SLA> | |
| **Availability** | <99.X%> | <Why — revenue impact, contractual, reputational> | |
| **Consistency** | <Strong for X, eventual for Y> | <Why — financial correctness, user perception, etc.> | |
| **Data retention** | <X years> | <Why — legal, audit, compliance> | |
| **Data residency** | <EU / US / any> | <Why — regulation, company policy> | |
| **Security** | <AuthN/AuthZ model, PII handling> | <Why — compliance, threat model> | |

Mark "hard constraint" for NFRs that are non-negotiable (legal, contractual). Soft constraints can be traded off during design.

### Hardest constraint

<Which NFR is the tightest? This is the one the architecture must optimize for. Example: "Availability at 99.95% is the hardest constraint because the weakest dependency (Neon) has a 99.95% SLA, leaving no headroom.">

## Constraints

| Constraint | Impact |
|---|---|
| <Existing stack / tech choice> | <What it forces or prevents> |
| <Team size / skills> | <What it forces or prevents> |
| <Budget> | <What it forces or prevents> |
| <Deadline> | <What it forces or prevents> |
| <Compliance (GDPR, SOC2, etc.)> | <What it forces or prevents> |

## Integrations

| System | Direction | Purpose | Protocol | Owner |
|---|---|---|---|---|
| <External system> | Inbound / Outbound / Both | <What data flows and why> | <REST, webhook, queue, etc.> | <Who maintains the integration> |

## Users and actors

| Actor | Role | Key interactions |
|---|---|---|
| <End user, admin, service, etc.> | <What they do> | <Which features they use> |

## Open questions

- <Question that needs answering before or during design>
- <Decision that's blocked on external input>
- <Ambiguity in a requirement that needs clarification>

## Out of scope

- <Thing that was discussed but explicitly excluded from this work>
- <Future feature that this system should be designed to accommodate but not implement>
