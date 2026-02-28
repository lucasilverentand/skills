const args = Bun.argv.slice(2);

const HELP = `
heuristic-checklist — Generate a Nielsen heuristic evaluation checklist

Usage:
  bun run tools/heuristic-checklist.ts <directory> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans a project's component/page files and generates a structured
heuristic evaluation checklist based on Nielsen's 10 usability heuristics,
pre-populated with relevant checks based on detected UI patterns.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname } from "node:path";

interface HeuristicCheck {
  id: number;
  heuristic: string;
  description: string;
  checks: { question: string; relevantFiles: string[] }[];
}

const HEURISTICS: { name: string; description: string }[] = [
  { name: "Visibility of system status", description: "The system should keep users informed about what is going on through appropriate feedback within reasonable time." },
  { name: "Match between system and the real world", description: "The system should speak the users' language, with words, phrases and concepts familiar to the user." },
  { name: "User control and freedom", description: "Users often choose system functions by mistake and need a clearly marked emergency exit." },
  { name: "Consistency and standards", description: "Users should not have to wonder whether different words, situations, or actions mean the same thing." },
  { name: "Error prevention", description: "Even better than good error messages is a careful design which prevents a problem from occurring." },
  { name: "Recognition rather than recall", description: "Minimize the user's memory load by making objects, actions, and options visible." },
  { name: "Flexibility and efficiency of use", description: "Accelerators — unseen by the novice user — may speed up interaction for the expert user." },
  { name: "Aesthetic and minimalist design", description: "Dialogues should not contain information which is irrelevant or rarely needed." },
  { name: "Help users recognize, diagnose, and recover from errors", description: "Error messages should be expressed in plain language, indicate the problem, and suggest a solution." },
  { name: "Help and documentation", description: "It may be necessary to provide help and documentation, focused on the user's task." },
];

const UI_EXTENSIONS = new Set([".tsx", ".jsx"]);

interface UIPattern {
  hasLoadingStates: boolean;
  hasForms: boolean;
  hasModals: boolean;
  hasNavigation: boolean;
  hasErrorBoundary: boolean;
  hasEmptyStates: boolean;
  hasToasts: boolean;
  hasSearch: boolean;
  hasTables: boolean;
  hasWizard: boolean;
  relevantFiles: Record<string, string[]>;
}

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".next"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (UI_EXTENSIONS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

async function detectPatterns(
  files: string[],
  root: string
): Promise<UIPattern> {
  const patterns: UIPattern = {
    hasLoadingStates: false,
    hasForms: false,
    hasModals: false,
    hasNavigation: false,
    hasErrorBoundary: false,
    hasEmptyStates: false,
    hasToasts: false,
    hasSearch: false,
    hasTables: false,
    hasWizard: false,
    relevantFiles: {},
  };

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const rel = relative(root, file);

    if (/loading|spinner|skeleton|isLoading|isPending/i.test(content)) {
      patterns.hasLoadingStates = true;
      (patterns.relevantFiles["loading"] ??= []).push(rel);
    }
    if (/<form\b|<Form\b|onSubmit|handleSubmit/i.test(content)) {
      patterns.hasForms = true;
      (patterns.relevantFiles["forms"] ??= []).push(rel);
    }
    if (/modal|dialog|<Dialog|<Modal|useModal/i.test(content)) {
      patterns.hasModals = true;
      (patterns.relevantFiles["modals"] ??= []).push(rel);
    }
    if (/nav|navigation|sidebar|header|menu|<Nav/i.test(content)) {
      patterns.hasNavigation = true;
      (patterns.relevantFiles["navigation"] ??= []).push(rel);
    }
    if (/ErrorBoundary|errorElement|error\.tsx/i.test(content)) {
      patterns.hasErrorBoundary = true;
      (patterns.relevantFiles["errors"] ??= []).push(rel);
    }
    if (/empty.?state|no.?data|no.?results/i.test(content)) {
      patterns.hasEmptyStates = true;
      (patterns.relevantFiles["empty-states"] ??= []).push(rel);
    }
    if (/toast|snackbar|notification|<Toast/i.test(content)) {
      patterns.hasToasts = true;
      (patterns.relevantFiles["toasts"] ??= []).push(rel);
    }
    if (/search|<Search|searchQuery|useSearch/i.test(content)) {
      patterns.hasSearch = true;
      (patterns.relevantFiles["search"] ??= []).push(rel);
    }
    if (/<table\b|<Table\b|<DataTable|<thead/i.test(content)) {
      patterns.hasTables = true;
      (patterns.relevantFiles["tables"] ??= []).push(rel);
    }
    if (/step|wizard|stepper|currentStep|nextStep/i.test(content)) {
      patterns.hasWizard = true;
      (patterns.relevantFiles["wizard"] ??= []).push(rel);
    }
  }

  return patterns;
}

function buildChecklist(patterns: UIPattern): HeuristicCheck[] {
  const checklist: HeuristicCheck[] = HEURISTICS.map((h, i) => ({
    id: i + 1,
    heuristic: h.name,
    description: h.description,
    checks: [],
  }));

  // H1: Visibility of system status
  const h1 = checklist[0];
  if (patterns.hasLoadingStates) {
    h1.checks.push({ question: "Do loading states appear promptly and indicate progress?", relevantFiles: patterns.relevantFiles["loading"] ?? [] });
  }
  if (patterns.hasForms) {
    h1.checks.push({ question: "Do form submissions show a loading/submitting state?", relevantFiles: patterns.relevantFiles["forms"] ?? [] });
  }
  h1.checks.push({ question: "Are success/failure states communicated clearly after actions?", relevantFiles: patterns.relevantFiles["toasts"] ?? [] });

  // H2: Match with real world
  const h2 = checklist[1];
  h2.checks.push({ question: "Does the UI use language familiar to users (not developer jargon)?", relevantFiles: [] });
  if (patterns.hasNavigation) {
    h2.checks.push({ question: "Are navigation labels clear and user-centric?", relevantFiles: patterns.relevantFiles["navigation"] ?? [] });
  }

  // H3: User control and freedom
  const h3 = checklist[2];
  if (patterns.hasModals) {
    h3.checks.push({ question: "Can users close modals/dialogs easily (X button, Escape, click outside)?", relevantFiles: patterns.relevantFiles["modals"] ?? [] });
  }
  if (patterns.hasForms) {
    h3.checks.push({ question: "Can users cancel form submissions or undo actions?", relevantFiles: patterns.relevantFiles["forms"] ?? [] });
  }
  h3.checks.push({ question: "Is there a clear way to go back from any screen?", relevantFiles: [] });

  // H4: Consistency and standards
  const h4 = checklist[3];
  h4.checks.push({ question: "Are similar actions in similar places across all pages?", relevantFiles: [] });
  h4.checks.push({ question: "Are button styles and labels consistent throughout?", relevantFiles: [] });
  if (patterns.hasTables) {
    h4.checks.push({ question: "Do all tables follow the same patterns for sorting, filtering, and pagination?", relevantFiles: patterns.relevantFiles["tables"] ?? [] });
  }

  // H5: Error prevention
  const h5 = checklist[4];
  if (patterns.hasForms) {
    h5.checks.push({ question: "Do forms validate input inline before submission?", relevantFiles: patterns.relevantFiles["forms"] ?? [] });
    h5.checks.push({ question: "Are destructive actions guarded with a confirmation dialog?", relevantFiles: [] });
  }

  // H6: Recognition rather than recall
  const h6 = checklist[5];
  if (patterns.hasSearch) {
    h6.checks.push({ question: "Does search provide autocomplete or suggestions?", relevantFiles: patterns.relevantFiles["search"] ?? [] });
  }
  if (patterns.hasEmptyStates) {
    h6.checks.push({ question: "Do empty states guide users on what to do next?", relevantFiles: patterns.relevantFiles["empty-states"] ?? [] });
  }
  h6.checks.push({ question: "Are form fields pre-filled with sensible defaults where possible?", relevantFiles: [] });

  // H7: Flexibility and efficiency
  const h7 = checklist[6];
  h7.checks.push({ question: "Are keyboard shortcuts available for common actions?", relevantFiles: [] });
  if (patterns.hasTables) {
    h7.checks.push({ question: "Can users bulk-select and act on multiple items?", relevantFiles: patterns.relevantFiles["tables"] ?? [] });
  }

  // H8: Aesthetic and minimalist design
  const h8 = checklist[7];
  h8.checks.push({ question: "Is each screen focused on a single primary action?", relevantFiles: [] });
  h8.checks.push({ question: "Is secondary information de-emphasized or collapsed?", relevantFiles: [] });

  // H9: Error recovery
  const h9 = checklist[8];
  if (patterns.hasErrorBoundary) {
    h9.checks.push({ question: "Do error boundaries show helpful messages with recovery options?", relevantFiles: patterns.relevantFiles["errors"] ?? [] });
  }
  if (patterns.hasForms) {
    h9.checks.push({ question: "Do form validation errors explain what went wrong and how to fix it?", relevantFiles: patterns.relevantFiles["forms"] ?? [] });
  }

  // H10: Help and documentation
  const h10 = checklist[9];
  if (patterns.hasWizard) {
    h10.checks.push({ question: "Do multi-step flows show progress and allow going back?", relevantFiles: patterns.relevantFiles["wizard"] ?? [] });
  }
  h10.checks.push({ question: "Is contextual help available where needed (tooltips, inline hints)?", relevantFiles: [] });

  return checklist;
}

async function main() {
  const target = resolve(filteredArgs[0]);
  const files = await collectFiles(target);
  const patterns = await detectPatterns(files, target);
  const checklist = buildChecklist(patterns);

  if (jsonOutput) {
    console.log(JSON.stringify({ patterns, checklist }, null, 2));
    return;
  }

  console.log(`# Heuristic Evaluation Checklist\n`);
  console.log(`Project: ${relative(process.cwd(), target)}`);
  console.log(`Files scanned: ${files.length}\n`);

  console.log("## Detected UI Patterns\n");
  const patternList = [
    ["Loading states", patterns.hasLoadingStates],
    ["Forms", patterns.hasForms],
    ["Modals/dialogs", patterns.hasModals],
    ["Navigation", patterns.hasNavigation],
    ["Error boundaries", patterns.hasErrorBoundary],
    ["Empty states", patterns.hasEmptyStates],
    ["Toasts/notifications", patterns.hasToasts],
    ["Search", patterns.hasSearch],
    ["Tables", patterns.hasTables],
    ["Wizard/stepper", patterns.hasWizard],
  ];
  for (const [name, present] of patternList) {
    console.log(`  ${present ? "[x]" : "[ ]"} ${name}`);
  }

  console.log("\n## Checklist\n");
  for (const h of checklist) {
    console.log(`### ${h.id}. ${h.heuristic}\n`);
    console.log(`  ${h.description}\n`);
    if (h.checks.length === 0) {
      console.log("  No specific checks generated — evaluate manually.\n");
    } else {
      for (const check of h.checks) {
        console.log(`  [ ] ${check.question}`);
        if (check.relevantFiles.length > 0) {
          console.log(`      Files: ${check.relevantFiles.slice(0, 3).join(", ")}`);
        }
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
