# Agents and Context Forking

Reference for Claude Code agent types and skill execution contexts.

## Agent Types

When spawning subagents with the Task tool, use these `subagent_type` values:

| Agent Type | Purpose | Tools Available |
|------------|---------|-----------------|
| `general-purpose` | Complex multi-step tasks | All tools |
| `Explore` | Codebase exploration, research | Read-only tools (Glob, Grep, Read, WebFetch, WebSearch) |
| `Bash` | Command execution tasks | Bash only |
| `Plan` | Architecture planning | Read-only tools |

### When to Use Each

**`general-purpose`** - Default for most skills
- Needs to create/modify files
- Requires multiple tool types
- Complex workflows with validation loops

**`Explore`** - Fast, focused research
- Finding files or code patterns
- Investigating issues
- Answering questions about codebase
- Cannot modify files (read-only)

**`Bash`** - Command execution
- Running tests, builds
- Git operations
- System commands

**`Plan`** - Design and architecture
- Planning implementation approach
- Identifying critical files
- Considering trade-offs

## Context Modes

The `context` field in skill frontmatter controls execution isolation:

### `context: main` (default)

Skill runs in the main conversation context.

```yaml
---
name: analyzing-code
context: main  # or omit - main is default
---
```

**Use for:**
- Simple skills that complete quickly
- Skills where user wants to see intermediate steps
- Skills that need conversation history

**Behavior:**
- Shares context with main conversation
- User sees all tool calls and outputs
- Can reference earlier conversation

### `context: fork`

Skill runs in an isolated forked context.

```yaml
---
name: investigating-issues
context: fork
agent: general-purpose
---
```

**Use for:**
- Autonomous investigation tasks
- Skills that spawn multiple subagents
- Long-running tasks where intermediate steps aren't useful to show
- Tasks that would clutter main conversation

**Behavior:**
- Isolated from main conversation
- User only sees final result
- Can work autonomously without interruption
- Better for parallel agent spawning

## Spawning Subagents

Use the Task tool to spawn subagents for parallel or delegated work.

### Basic Pattern

```
Spawn a Task agent with:
- subagent_type: Explore
- prompt: "Find all files that handle authentication"
```

### Parallel Investigation Pattern

For investigating multiple hypotheses simultaneously:

```
1. Generate hypotheses:
   - Hypothesis A: Config issue
   - Hypothesis B: Missing env var
   - Hypothesis C: Dependency problem

2. Spawn agents in parallel (single message, multiple Task calls):

   Task 1:
     subagent_type: Explore
     prompt: "Check config files for authentication settings"

   Task 2:
     subagent_type: Explore
     prompt: "Look for missing environment variables"

   Task 3:
     subagent_type: Explore
     prompt: "Check dependency versions and conflicts"

3. Synthesize findings from all agents
```

### Key Rules

- **Parallel calls**: Send multiple Task tool calls in a single message for parallel execution
- **Sequential calls**: If results depend on each other, wait for one to complete before spawning next
- **Explore for research**: Use `subagent_type: Explore` for read-only investigation
- **General-purpose for actions**: Use `subagent_type: general-purpose` when agents need to modify files

## Skill Configuration Examples

### Simple Skill (main context)

```yaml
---
name: searching-packages
description: Searches for packages. Use when finding dependencies.
allowed-tools:
  - mcp__devenv__search
---
```

No context or agent specified = runs in main context with default agent.

### Investigation Skill (forked context)

```yaml
---
name: debugging-issues
description: Debugs complex issues systematically. Use when investigating bugs.
context: fork
agent: general-purpose
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Task
---
```

Forked context with general-purpose agent = can spawn subagents autonomously.

### Workflow Skill (forked context)

```yaml
---
name: deploying-services
description: Guides deployment process. Use when deploying to production.
context: fork
agent: general-purpose
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
---
```

Complex workflow that should run without cluttering main conversation.

## Decision Guide

```
Need to spawn subagents?
├── Yes → context: fork, agent: general-purpose
└── No
    ├── Long-running/autonomous? → context: fork
    └── Quick, user wants to see steps? → context: main (default)

What tools does skill need?
├── Read-only research → subagent_type: Explore
├── Run commands only → subagent_type: Bash
├── Planning only → subagent_type: Plan
└── Mixed/file modifications → subagent_type: general-purpose
```
