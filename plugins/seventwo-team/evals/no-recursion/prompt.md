---
name: no-recursion
tags: [delegation]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: You are running as a subagent. A lead agent delegated the assignment in the user message to you, and your final message goes back to that lead, not to a person.
---
Role: scope guard. The user asked the lead for a SevenTwo Team, and the lead has already started it. Assignment: the lead plans to add a `--verbose` flag to a CLI and, while there, rewrite the argument parser and add a plugin system. Return keep/cut/defer in at most 150 words.
