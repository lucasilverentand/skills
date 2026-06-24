# Migration and Review

## Existing Repo Audit
Before moving files, inspect:

- top-level tree and package/workspace files;
- build system and generated-file rules;
- app entrypoints and deployment config;
- test layout and CI commands;
- import aliases and path mapping;
- public API exports;
- docs that may reference paths.

Classify every top-level folder as one of:

|Class|Meaning|Action|
|---|---|---|
|Deployable|Built, shipped, or run independently|Keep as a first-class boundary|
|Domain|Owns product/business behavior|Keep close to its app unless shared by contract|
|Shared package|Imported by multiple deployables|Require a public API and tests|
|Generated|Produced by tooling|Do not reorganize manually without updating generator|
|Artifact|Build output, cache, local state|Remove from source or ignore|
|Ambiguous bucket|`utils`, `helpers`, broad `lib`, broad `services`|Split by owner or keep only tiny framework glue|

## Migration Plan
Use small moves that preserve behavior:

1. Propose the target tree and explain the boundary rule.
2. Move one domain or deployable at a time.
3. Update imports, path aliases, package exports, and build config.
4. Run the smallest validation command that proves the move.
5. Repeat until the layout matches the target structure.
6. Leave compatibility shims only when downstream callers need a staged migration.

Avoid cosmetic churn if the repo is actively shipping. A better tree that breaks deployment is not better.

## LLM-Generated Layout Smells
- `src/components`, `src/services`, `src/utils`, and `src/types` contain most of the application.
- Many files have names like `Manager`, `Service`, `Handler`, `Helper`, or `Provider` without domain meaning.
- Business rules live in UI components or route files.
- Tests are absent, only snapshots exist, or all tests are in one global folder without ownership.
- Environment config is copied across apps instead of validated and owned.
- Generated files are mixed with authored source.
- Multiple frameworks or package managers appear without a clear migration reason.

When these appear, preserve working behavior but restructure around deployables and domains.

## Review Checklist
- Can a new agent find the entrypoint for each deployable in under a minute?
- Is there one obvious owner for each domain concept?
- Do shared packages have narrow names, tests, and public exports?
- Are route files, command handlers, and Worker handlers thin enough to read quickly?
- Are test locations predictable from the source location?
- Are generated files and artifacts clearly separated?
- Does the structure match the actual deployment and CI model?
- Are risky moves broken into commits or steps that can be validated independently?

## Recommended Response Format
For a structural review, answer in this order:

1. Current classification: project type, deployables, shared packages, generated/artifact roots.
2. Main structural risks, ordered by maintenance impact.
3. Proposed target tree.
4. Migration sequence with validation after each step.
5. Follow-up work that is useful but out of scope.
