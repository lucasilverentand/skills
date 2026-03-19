const args = Bun.argv.slice(2);

const HELP = `
report-scaffold — Generate a Markdown report skeleton from type and topic

Usage:
  bun run tools/report-scaffold.ts <type> <topic> [options]

Types:
  status        Project status / sprint update
  analysis      Technical analysis or investigation
  comparison    Comparison of options or technologies
  retro         Retrospective or post-mortem
  research      Research summary
  custom        Generic report

Options:
  --output <path>  Write to file instead of stdout
  --json           Output as JSON instead of Markdown
  --help           Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
const skipIndices = new Set<number>();
args.forEach((a, i) => {
  if (a.startsWith("--")) {
    skipIndices.add(i);
    if (a === "--output" || a === "--since") skipIndices.add(i + 1);
  }
});
const filteredArgs = args.filter((_, i) => !skipIndices.has(i));

const TEMPLATES: Record<string, { sections: string[]; hints: string[] }> = {
  status: {
    sections: ["Summary", "Completed", "In Progress", "Blocked / Risks", "Next Steps"],
    hints: [
      "2-3 sentence overview of the period",
      "List completed work grouped by theme",
      "List ongoing work with progress indicators",
      "Blockers and risks — the most actionable section",
      "What's planned for the next period",
    ],
  },
  analysis: {
    sections: ["Executive Summary", "Background", "Methodology", "Findings", "Recommendations"],
    hints: [
      "Key conclusion in 2-3 sentences",
      "Context and the question being investigated",
      "How evidence was gathered",
      "What was found, with supporting evidence",
      "Concrete, prioritized next steps",
    ],
  },
  comparison: {
    sections: ["Summary", "Criteria", "Options", "Comparison Table", "Recommendation"],
    hints: [
      "Which option is recommended and why, in 2-3 sentences",
      "What criteria were used to evaluate",
      "One subsection per option with details",
      "Table with criteria as rows, options as columns",
      "Clear recommendation with reasoning",
    ],
  },
  retro: {
    sections: ["Summary", "What Went Well", "What Didn't", "Root Causes", "Action Items"],
    hints: [
      "Overview of the period and key takeaways",
      "Patterns and practices worth continuing",
      "Issues and pain points",
      "Why things went wrong — focus on systems, not people",
      "Specific, assigned, time-bound improvements",
    ],
  },
  research: {
    sections: ["Summary", "Background", "Findings", "Open Questions", "Sources"],
    hints: [
      "Key findings in 2-3 sentences",
      "Why this research was needed",
      "What was discovered, separating facts from interpretation",
      "Unresolved questions for further investigation",
      "All sources with links",
    ],
  },
  custom: {
    sections: ["Summary", "Background", "Details", "Conclusion"],
    hints: [
      "Overview of the report",
      "Context the reader needs",
      "Main content",
      "Key takeaways and next steps",
    ],
  },
};

async function main() {
  const type = filteredArgs[0];
  const topic = filteredArgs.slice(1).join(" ") || "Untitled Report";

  if (!type) {
    console.error("Error: missing report type. Run with --help for options.");
    process.exit(1);
  }

  const template = TEMPLATES[type] || TEMPLATES.custom;
  const today = new Date().toISOString().split("T")[0];

  const result = {
    type: type in TEMPLATES ? type : "custom",
    topic,
    date: today,
    sections: template.sections.map((name, i) => ({
      name,
      hint: template.hints[i],
    })),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const lines: string[] = [
      `# Report: ${topic}`,
      "",
      `**Date:** ${today}`,
      `**Type:** ${result.type}`,
      `**Audience:** <!-- who is this for? -->`,
      "",
    ];

    for (const section of result.sections) {
      lines.push(`## ${section.name}`, "", `<!-- ${section.hint} -->`, "", "");
    }

    const markdown = lines.join("\n");

    if (outputPath) {
      await Bun.write(outputPath, markdown);
      console.log(`Written to ${outputPath}`);
    } else {
      console.log(markdown);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
