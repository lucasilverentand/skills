// Shared utilities for authoring scripts.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface SkillMeta {
  name: string;
  description: string;
  content: string;
}

export function parseSkillMd(skillPath: string): SkillMeta {
  const content = readFileSync(join(skillPath, "SKILL.md"), "utf-8");
  const lines = content.split("\n");

  if (lines[0].trim() !== "---") {
    throw new Error("SKILL.md missing frontmatter (no opening ---)");
  }

  let endIdx: number | null = null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIdx = i;
      break;
    }
  }
  if (endIdx === null) {
    throw new Error("SKILL.md missing frontmatter (no closing ---)");
  }

  let name = "";
  let description = "";
  const frontmatterLines = lines.slice(1, endIdx);

  let i = 0;
  while (i < frontmatterLines.length) {
    const line = frontmatterLines[i];
    if (line.startsWith("name:")) {
      name = line.slice("name:".length).trim().replace(/^["']|["']$/g, "");
    } else if (line.startsWith("description:")) {
      const value = line.slice("description:".length).trim();
      if ([">", "|", ">-", "|-"].includes(value)) {
        const continuationLines: string[] = [];
        i++;
        while (
          i < frontmatterLines.length &&
          (frontmatterLines[i].startsWith("  ") || frontmatterLines[i].startsWith("\t"))
        ) {
          continuationLines.push(frontmatterLines[i].trim());
          i++;
        }
        description = continuationLines.join(" ");
        continue;
      } else {
        description = value.replace(/^["']|["']$/g, "");
      }
    }
    i++;
  }

  return { name, description, content };
}

export function findProjectRoot(): string {
  let current = process.cwd();

  while (true) {
    if (existsSync(join(current, ".claude"))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return process.cwd();
}
