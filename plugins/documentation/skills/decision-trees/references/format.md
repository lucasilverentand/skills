# Decision Tree Format

## Syntax

Decision trees use indented markdown bullet lists. Three node types:

### Questions (plain text)

The decision point. Written as a question or observation prompt.

```markdown
- What HTTP status code is the error?
```

### Conditions (bold text)

The branches from a question. Must be mutually exclusive at each level.

```markdown
- **4xx client error** -> ...
- **5xx server error** -> ...
- **Network timeout / no response** -> ...
```

### Actions (after `->` arrow)

What to do when a condition matches. Can be inline or point to a section/file.

```markdown
- **5xx server error** -> check the application logs with `kubectl logs -l app=api --tail=100`
```

## Full example

```markdown
- Is the deployment failing?
  - **Yes, during build** -> what's the build error?
    - **Dependency resolution failure** -> run `bun install --frozen-lockfile` locally to reproduce, fix lockfile, push
    - **TypeScript compilation error** -> run `bun run typecheck`, fix the reported errors
    - **Out of memory** -> increase the build container memory limit in `deploy.yml`
    - **Something else** -> read the full build log, search for the first error (not the last — cascading failures mislead)
  - **Yes, during rollout** -> are new pods starting?
    - **Pods are CrashLoopBackOff** -> check logs: `kubectl logs <pod> --previous`, fix the crash, redeploy
    - **Pods won't schedule** -> check resources: `kubectl describe pod <pod>`, look for insufficient CPU/memory events
    - **Pods start but health checks fail** -> verify the health endpoint works locally, check if the port or path changed
  - **No, deployment succeeded but something is wrong** -> follow the "post-deploy triage" tree
```

## Nesting rules

- **Max depth: 4 levels.** Root question → condition → sub-question → condition → action. If you need a 5th level, split into a sub-tree and link to it.
- **Every condition set needs a fallback.** Add "**Something else**", "**None of the above**", or "**Not sure**" as the last sibling.
- **Conditions at the same level must be mutually exclusive.** If two could match simultaneously, restructure — either make conditions more specific or add a disambiguating question above.

## Writing conditions

Good conditions are observable — the reader can evaluate them right now:

| Observable (good)                         | Unobservable (bad)         |
| ----------------------------------------- | -------------------------- |
| `curl /health` returns 503                | The service is unhealthy   |
| The error message contains "ECONNREFUSED" | There's a connection issue |
| `git status` shows uncommitted changes    | The repo is dirty          |
| The file has more than 500 lines          | The file is too large      |

When a condition requires running a command, include the command inline so agents can execute it and humans know exactly what to check.

## Writing actions

Actions at leaf nodes must be self-contained. Include:

1. **What to do** — the specific action, not a category of action
2. **How to do it** — commands, file paths, settings to change
3. **What "done" looks like** — how to verify the action worked (optional but valuable for agents)

```markdown
- **Memory limit exceeded** -> edit `wrangler.toml`, increase `[limits] memory_mb` to 256, redeploy with `wrangler deploy`, verify with `curl /health`
```

## Linking sub-trees

When a branch is complex enough to warrant its own tree, link to it rather than inlining:

```markdown
- **Database-related error** -> follow the database troubleshooting tree in `references/db-triage.md`
```

The linked tree should be self-contained — it has its own root question and doesn't assume the reader remembers where they came from.

## Agent-specific annotations

For conditions that require judgment, add a parenthetical hint that includes both **what matches** and **what rules it out** from siblings:

```markdown
- **The error looks transient** (appears intermittently, succeeds on retry, timing-related; NOT a consistent reproduction) -> retry once, if it persists treat as persistent
- **The error looks persistent** (same error every time, deterministic reproduction; NOT intermittent or timing-dependent) -> investigate root cause
```

These hints serve the pro/con evaluation protocol — agents must argue for _and_ against each sibling before committing. When the condition itself names what would contradict it, the agent has a concrete check to perform rather than having to invent counter-evidence on its own.

### Writing conditions that support pro/con evaluation

Each condition should make it easy to argue against it, not just for it. This means:

- **Include distinguishing signals** — what would you see if this condition is true that you wouldn't see for any sibling? "The build fails at the `tsc` step" is better than "There's a TypeScript error" because it tells you exactly where to look.
- **Name the negation when it's non-obvious** — for subjective or judgment-based conditions, add a parenthetical with what would rule it out: `**Performance regression** (p95 latency increased >20% since last deploy; not a spike from a single outlier request)`
- **Keep boolean conditions simple** — when the check is truly binary (file exists / doesn't exist), no negation hint is needed. The pro/con protocol still applies, but the evidence is self-evident.
