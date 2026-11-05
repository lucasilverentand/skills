# Source-control and review practices
Adapt these practices to the current user's VCS, hosting service, repository instructions and accepted workflow. They are not a named person's private policy or an audit of live enforcement. For non-Git version control, use equivalent history/review controls through supported tools; do not pretend Git commits or PRs are available.

## Resolve the applicable convention
Read relevant contribution/agent guidance, commit checks, review templates, merge settings, signing/identity requirements and accepted user preferences. Distinguish an explicit rule from a pattern in old commits or an outdated document. Check actual enforced constraints where delivery depends on them. Ask only when an unresolved conflict materially affects the authorized action.

Preserve repository-specific exceptions. Do not import an organization's conventions into an unrelated upstream project, invent attribution/sign-off, change global Git identity, or weaken protections to fit a preferred workflow.

## Good default proposals when rules are absent
For a Git project without established conventions, propose focused branches and reviewed changes to the default branch, concise Conventional Commit subjects, and squash delivery when a single cohesive result fits. These are recommendations to confirm where consequential, not authority to alter repository settings. Do not impose squash merges on a project using another accepted history strategy.

Use a meaningful type and scope only as allowed by the actual convention. Follow configured subject lengths and breaking-change forms, not a hard-coded regex. Keep a nonempty body clearly separated from its subject. Explain why when useful and keep changes logically cohesive. Do not mix functional work and broad unrelated formatting.

Signing follows the user's/repository's actual requirement and authorized identity. Do not add a mandatory signature or signed-off/co-author trailer merely because a former user required it; do not disable an existing requirement either. Application/distribution signing is a separate concern.

## Check the messages that will actually land
Review the staged/committed delta and intended target. Check exact commit subjects, PR/review titles and final merge/squash messages against the applicable checks. If the host derives the final commit from a review title/body, a valid feature commit cannot rescue an invalid title. Account for appended review numbers and manual overrides. A locally passing checker does not establish that CI is deployed or enforced.

Follow the repository's review template. Explain the concrete problem, resulting behavior, relevant choices, real validation, remaining limitations and rollback considerations where useful. Keep titles/descriptions aligned with the final scope. Do not copy another repository's language-specific test commands or template wholesale.

Use actual work-item links where the project's tracking practice requires them; avoid closing relationships while acceptance remains unfinished. If no tracker is used, do not create one to satisfy a generic preference.

Inspect required current-revision review feedback, including substantive comments and discussions, before handoff/merge and after relevant changes. Missing, pending, stale or usage-limited feedback is not passing review. Respect scoped human/provider review exceptions and the team's applicable quorum policy. Preserve required checks and verify that the delivered result matches reviewed work.

Keep edited, locally tested, committed, pushed, reviewed, merged, deployed and accepted states distinct. None of these practices grants authority to commit, push, merge, publish, rewrite history or change protections beyond the user's requested endpoint.
