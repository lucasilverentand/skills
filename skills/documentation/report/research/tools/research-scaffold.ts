const args = Bun.argv.slice(2);

const HELP = `
research-scaffold — Create a research report document with structured sections and source tracking

Usage:
  bun run tools/research-scaffold.ts --topic <topic> [options]

Options:
  --topic <topic>      Research topic (required)
  --questions <list>   Comma-separated research questions
  --sources <n>        Expected number of source slots to pre-fill (default: 5)
  --output <path>      Write to file instead of stdout
  --json               Output as JSON instead of Markdown
  --help               Show this help message

Examples:
  bun run tools/research-scaffold.ts --topic "Edge computing databases"
  bun run tools/research-scaffold.ts --topic "Auth patterns" --questions "Which is fastest?,Which is most secure?"
  bun run tools/research-scaffold.ts --topic "React state management" --sources 10 --output research.md
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const topicIdx = args.indexOf("--topic");
const topic = topicIdx !== -1 ? args[topicIdx + 1] : "Untitled Research";
const questionsIdx = args.indexOf("--questions");
const questions = questionsIdx !== -1
  ? args[questionsIdx + 1].split(",").map((s) => s.trim())
  : ["<!-- Primary research question -->"];
const sourcesIdx = args.indexOf("--sources");
const sourceCount = sourcesIdx !== -1 ? parseInt(args[sourcesIdx + 1], 10) : 5;
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;

interface ResearchData {
  topic: string;
  date: string;
  questions: string[];
  sourceSlots: number;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];

  const data: ResearchData = {
    topic,
    date: today,
    questions,
    sourceSlots: sourceCount,
  };

  if (jsonOutput) {
    const output = JSON.stringify(data, null, 2);
    if (outputPath) {
      await Bun.write(outputPath, output);
      console.log(`Written to ${outputPath}`);
    } else {
      console.log(output);
    }
    return;
  }

  const lines: string[] = [
    `# Research: ${topic}`,
    "",
    `**Date:** ${today}`,
    `**Author:** <!-- name -->`,
    `**Audience:** <!-- who this is for -->`,
    `**Status:** Draft`,
    "",
    "## Summary",
    "",
    "<!-- 2-3 sentences: the key findings and their implications -->",
    "",
    "## Research Questions",
    "",
    ...questions.map((q, i) => `${i + 1}. ${q}`),
    "",
    "## Methodology",
    "",
    "- **Sources searched:** <!-- web, docs, repos, papers -->",
    "- **Search terms:** <!-- what you searched for -->",
    "- **Date range:** <!-- when the sources are from -->",
    "- **Inclusion criteria:** <!-- what qualified as relevant -->",
    "- **Limitations:** <!-- what this research doesn't cover -->",
    "",
    "## Background",
    "",
    "<!-- Context the reader needs to understand the findings -->",
    "",
    "## Findings",
    "",
    "### Finding 1: <!-- title -->",
    "",
    "<!-- Description of what was found -->",
    "",
    "**Sources:** <!-- [Source A](url), [Source B](url) -->",
    "**Confidence:** High | Medium | Low",
    "**Implication:** <!-- what this means -->",
    "",
    "### Finding 2: <!-- title -->",
    "",
    "<!-- Description -->",
    "",
    "**Sources:** <!-- [Source](url) -->",
    "**Confidence:** High | Medium | Low",
    "**Implication:** <!-- what this means -->",
    "",
    "### Finding 3: <!-- title -->",
    "",
    "<!-- Description -->",
    "",
    "**Sources:** <!-- [Source](url) -->",
    "**Confidence:** High | Medium | Low",
    "**Implication:** <!-- what this means -->",
    "",
    "## Synthesis",
    "",
    "### Key themes",
    "",
    "1. <!-- theme --> — supported by findings 1, 3",
    "2. <!-- theme --> — supported by findings 2",
    "",
    "### Consensus vs. debate",
    "",
    "- **Consensus:** <!-- what most sources agree on -->",
    "- **Debated:** <!-- where sources disagree and why -->",
    "",
    "## Conclusions",
    "",
    ...questions.map((q, i) => `${i + 1}. **${q}** — <!-- answer with confidence level -->`),
    "",
    "## Open Questions",
    "",
    "- <!-- question that remains unanswered -->",
    "- <!-- area that needs deeper investigation -->",
    "",
    "## Sources",
    "",
    "| # | Source | Type | Date | Relevance |",
    "|---|---|---|---|---|",
  ];

  for (let i = 1; i <= sourceCount; i++) {
    lines.push(
      `| ${i} | <!-- [title](url) --> | Article / Docs / Repo / Paper | <!-- date --> | <!-- relevance --> |`
    );
  }

  lines.push("");

  const markdown = lines.join("\n");

  if (outputPath) {
    await Bun.write(outputPath, markdown);
    console.log(`Written to ${outputPath}`);
  } else {
    console.log(markdown);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
