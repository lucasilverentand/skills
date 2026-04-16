# Documentation Plugin
Skills for creating structured documentation artifacts — decision trees, runbooks, and other formats that serve both human readers and AI agents. This plugin helps turn tribal knowledge and design thinking into durable, machine-readable, and human-auditable documentation.

## Skills

### c4-diagrams
Generates C4 model architecture diagrams (System Context, Container, Component) as Mermaid for embedding in docs. Picks the right level and labels elements with technology and responsibility.

### decision-trees
Creates decision trees that both humans and AI agents can follow reliably — captures expert knowledge as branching logic with concrete conditions, clear enough actions, and visible reasoning traces.

### write-adr
Writes Architecture Decision Records (ADRs) in MADR format — captures context and problem, decision drivers, considered options with pros/cons, the chosen option and why, and consequences.

### write-design-doc
Assembles architecture, data modeling, and API design work into a structured, readable system design document. Focuses on writing quality, document structure, and completeness.

## Installation
Add this plugin to your Claude Code configuration:

```json
{
  "plugins": ["plugins/documentation"]
}
```

## Author
Luca Silverentand (<dev@lucasilverentand.com>)
