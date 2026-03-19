const args = Bun.argv.slice(2);

const HELP = `
marketplace-lint — Validate marketplace.json against schema and report errors

Usage:
  bun run tools/marketplace-lint.ts [marketplace-path] [options]

Options:
  --json    Output as JSON instead of plain text
  --fix     Auto-fix ordering issues (sort plugins and skills alphabetically)
  --help    Show this help message

Defaults to .claude-plugin/marketplace.json in the repo root if no path is given.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const autoFix = args.includes("--fix");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

type Severity = "error" | "warning";

interface LintError {
  path: string;
  code: string;
  message: string;
  severity: Severity;
}

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const VALID_CATEGORIES = new Set(["devtools", "editor", "web-development"]);
const MAX_DESCRIPTION_LENGTH = 1024;

const RESERVED_MARKETPLACE_NAMES = new Set([
  "claude-code-marketplace",
  "claude-code-plugins",
  "claude-plugins-official",
  "anthropic-marketplace",
  "anthropic-plugins",
  "agent-skills",
  "life-sciences",
]);

const KNOWN_TOOLS = new Set([
  "Read",
  "Edit",
  "Write",
  "Bash",
  "Glob",
  "Grep",
  "WebFetch",
  "WebSearch",
  "Agent",
  "Zsh",
]);

const VALID_SOURCE_TYPES = new Set([
  "github",
  "url",
  "git-subdir",
  "npm",
  "pip",
]);

function err(
  errors: LintError[],
  path: string,
  code: string,
  message: string,
  severity: Severity = "error",
) {
  errors.push({ path, code, message, severity });
}

function parseFrontmatter(
  content: string,
): Record<string, string> | null {
  const lines = content.split("\n");
  if (!lines.length || lines[0].trim() !== "---") return null;

  let endIdx: number | null = null;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIdx = i;
      break;
    }
  }
  if (endIdx === null) return null;

  const fm: Record<string, string> = {};
  for (const line of lines.slice(1, endIdx)) {
    const stripped = line.trim();
    if (!stripped || stripped.startsWith("#")) continue;
    const colonIdx = stripped.indexOf(":");
    if (colonIdx !== -1) {
      const key = stripped.slice(0, colonIdx).trim();
      const value = stripped.slice(colonIdx + 1).trim();
      if (value) fm[key] = value;
    }
  }
  return fm;
}

function isSorted(arr: string[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

async function main() {
  const { existsSync, readFileSync, writeFileSync } = await import("node:fs");
  const { resolve, dirname, basename } = await import("node:path");

  // Find repo root by walking up to find .claude-plugin/
  let dir = resolve(".");
  while (dir !== "/") {
    if (existsSync(resolve(dir, ".claude-plugin"))) break;
    dir = dirname(dir);
  }
  if (dir === "/" && !existsSync(resolve(dir, ".claude-plugin"))) {
    console.error(
      "Error: could not find .claude-plugin directory in any parent — are you inside a plugin repo?",
    );
    process.exit(1);
  }

  const target =
    filteredArgs[0] ?? resolve(dir, ".claude-plugin/marketplace.json");
  if (!existsSync(target)) {
    console.error(`Error: marketplace.json not found at ${target}`);
    process.exit(1);
  }

  const content = readFileSync(target, "utf-8");
  const errors: LintError[] = [];

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(content);
  } catch {
    err(errors, "root", "invalid-json", "Invalid JSON syntax");
    report(errors);
    return;
  }

  // ── Top-level required fields ──

  if (!data.name) {
    err(errors, "name", "missing-required-field", "Missing required field: name");
  } else if (typeof data.name !== "string") {
    err(errors, "name", "invalid-type", "Field 'name' must be a string");
  } else if (!KEBAB.test(data.name)) {
    err(errors, "name", "invalid-name", `Name '${data.name}' must be kebab-case`);
  } else if (RESERVED_MARKETPLACE_NAMES.has(data.name)) {
    err(errors, "name", "reserved-name", `Name '${data.name}' is reserved and cannot be used`);
  }

  if (!data.owner) {
    err(errors, "owner", "missing-required-field", "Missing required field: owner");
  } else if (typeof data.owner !== "object" || Array.isArray(data.owner)) {
    err(errors, "owner", "invalid-type", "Field 'owner' must be an object");
  } else {
    const owner = data.owner as Record<string, unknown>;
    if (
      !owner.name ||
      typeof owner.name !== "string" ||
      owner.name.trim() === ""
    ) {
      err(
        errors,
        "owner.name",
        "missing-required-field",
        "Missing required field: owner.name (must be a non-empty string)",
      );
    }
    if (owner.url !== undefined && typeof owner.url !== "string") {
      err(errors, "owner.url", "invalid-type", "Field 'owner.url' must be a string");
    }
    if (owner.email !== undefined && typeof owner.email !== "string") {
      err(errors, "owner.email", "invalid-type", "Field 'owner.email' must be a string");
    }
  }

  // ── Metadata ──

  if (data.metadata !== undefined) {
    if (typeof data.metadata !== "object" || Array.isArray(data.metadata)) {
      err(errors, "metadata", "invalid-type", "Field 'metadata' must be an object");
    } else {
      const metadata = data.metadata as Record<string, unknown>;
      if (metadata.version !== undefined) {
        if (typeof metadata.version !== "string") {
          err(errors, "metadata.version", "invalid-type", "Field 'metadata.version' must be a string");
        } else if (!SEMVER.test(metadata.version)) {
          err(errors, "metadata.version", "invalid-version", `Version '${metadata.version}' must be valid semver (X.Y.Z)`);
        }
      }
      if (metadata.description !== undefined) {
        if (typeof metadata.description !== "string") {
          err(errors, "metadata.description", "invalid-type", "Field 'metadata.description' must be a string");
        } else if (metadata.description.length > MAX_DESCRIPTION_LENGTH) {
          err(errors, "metadata.description", "description-too-long", `Metadata description is ${metadata.description.length} chars (max ${MAX_DESCRIPTION_LENGTH})`);
        }
      }
      for (const urlField of ["homepage", "repository"] as const) {
        if (metadata[urlField] !== undefined) {
          if (typeof metadata[urlField] !== "string") {
            err(errors, `metadata.${urlField}`, "invalid-type", `Field 'metadata.${urlField}' must be a string`);
          } else {
            try {
              new URL(metadata[urlField] as string);
            } catch {
              err(errors, `metadata.${urlField}`, "invalid-url", `Field 'metadata.${urlField}' is not a valid URL: ${metadata[urlField]}`, "warning");
            }
          }
        }
      }
    }
  }

  // ── Plugins ──

  if (!Array.isArray(data.plugins)) {
    err(errors, "plugins", "missing-required-field", "Missing required field: plugins (must be an array)");
    report(errors);
    return;
  }

  if (data.plugins.length === 0) {
    err(errors, "plugins", "empty-array", "Plugins array must contain at least one plugin");
  }

  const seenPluginNames = new Set<string>();
  const allSkillPaths = new Set<string>();
  const skillPathToPlugin = new Map<string, string>();
  const plugins = data.plugins as unknown[];
  let pluginsOutOfOrder = false;
  const pluginNameOrder: string[] = [];

  for (let i = 0; i < plugins.length; i++) {
    const prefix = `plugins[${i}]`;

    // Type guard: each plugin must be a non-null object
    if (
      plugins[i] === null ||
      typeof plugins[i] !== "object" ||
      Array.isArray(plugins[i])
    ) {
      err(errors, prefix, "invalid-type", `Plugin at index ${i} must be an object`);
      continue;
    }

    const plugin = plugins[i] as Record<string, unknown>;
    const pluginName = plugin.name as string | undefined;

    // Required: name
    if (!pluginName) {
      err(errors, `${prefix}.name`, "missing-required-field", `Plugin at index ${i} missing 'name'`);
    } else if (typeof pluginName !== "string") {
      err(errors, `${prefix}.name`, "invalid-type", `Plugin name at index ${i} must be a string`);
    } else {
      if (!KEBAB.test(pluginName)) {
        err(errors, `${prefix}.name`, "invalid-name", `Plugin name '${pluginName}' must be kebab-case`);
      }
      if (pluginName.length > 64) {
        err(errors, `${prefix}.name`, "invalid-name", `Plugin name '${pluginName}' exceeds 64 characters`);
      }
      if (seenPluginNames.has(pluginName)) {
        err(errors, `${prefix}.name`, "duplicate-name", `Duplicate plugin name: '${pluginName}'`);
      }
      seenPluginNames.add(pluginName);
      pluginNameOrder.push(pluginName);
    }

    // Required: source
    if (plugin.source === undefined || plugin.source === null) {
      err(errors, `${prefix}.source`, "missing-required-field", `Plugin at index ${i} missing 'source'`);
    } else if (typeof plugin.source === "object" && !Array.isArray(plugin.source)) {
      // Object source — validate by type
      const src = plugin.source as Record<string, unknown>;
      if (!src.source || typeof src.source !== "string") {
        err(errors, `${prefix}.source`, "invalid-source", "Source object missing 'source' type field");
      } else if (!VALID_SOURCE_TYPES.has(src.source)) {
        err(errors, `${prefix}.source`, "invalid-source", `Unknown source type '${src.source}' — must be one of: ${[...VALID_SOURCE_TYPES].join(", ")}`);
      } else {
        // Type-specific required fields
        if (src.source === "github") {
          if (!src.repo || typeof src.repo !== "string") {
            err(errors, `${prefix}.source.repo`, "missing-required-field", "GitHub source requires 'repo' field (format: owner/repo)");
          } else if (!/^[^/]+\/[^/]+$/.test(src.repo)) {
            err(errors, `${prefix}.source.repo`, "invalid-source", `GitHub repo '${src.repo}' must be in 'owner/repo' format`);
          }
        } else if (src.source === "url") {
          if (!src.url || typeof src.url !== "string") {
            err(errors, `${prefix}.source.url`, "missing-required-field", "Git URL source requires 'url' field");
          }
        } else if (src.source === "git-subdir") {
          if (!src.url || typeof src.url !== "string") {
            err(errors, `${prefix}.source.url`, "missing-required-field", "Git subdir source requires 'url' field");
          }
          if (!src.path || typeof src.path !== "string") {
            err(errors, `${prefix}.source.path`, "missing-required-field", "Git subdir source requires 'path' field");
          }
        } else if (src.source === "npm" || src.source === "pip") {
          if (!src.package || typeof src.package !== "string") {
            err(errors, `${prefix}.source.package`, "missing-required-field", `${src.source} source requires 'package' field`);
          }
        }
      }
    } else if (typeof plugin.source !== "string") {
      err(errors, `${prefix}.source`, "invalid-type", "Plugin source must be a string or object");
    }

    // Optional: strict (must be boolean)
    if (plugin.strict !== undefined && typeof plugin.strict !== "boolean") {
      err(errors, `${prefix}.strict`, "invalid-type", `Plugin 'strict' field must be a boolean, got ${typeof plugin.strict}`);
    }

    // Optional: category (must be from taxonomy)
    if (plugin.category !== undefined) {
      if (typeof plugin.category !== "string") {
        err(errors, `${prefix}.category`, "invalid-type", "Plugin category must be a string");
      } else if (!VALID_CATEGORIES.has(plugin.category)) {
        err(errors, `${prefix}.category`, "invalid-category", `Invalid category '${plugin.category}' — must be one of: ${[...VALID_CATEGORIES].join(", ")}`);
      }
    }

    // Optional: description (non-empty, length limit)
    if (plugin.description !== undefined) {
      if (typeof plugin.description !== "string") {
        err(errors, `${prefix}.description`, "invalid-type", "Plugin description must be a string");
      } else if (plugin.description === "") {
        err(errors, `${prefix}.description`, "empty-field", "Plugin description must not be empty");
      } else if (plugin.description.length > MAX_DESCRIPTION_LENGTH) {
        err(errors, `${prefix}.description`, "description-too-long", `Plugin description is ${plugin.description.length} chars (max ${MAX_DESCRIPTION_LENGTH})`);
      }
    }

    // Optional: version (semver)
    if (plugin.version !== undefined) {
      if (typeof plugin.version !== "string") {
        err(errors, `${prefix}.version`, "invalid-type", "Plugin version must be a string");
      } else if (!SEMVER.test(plugin.version)) {
        err(errors, `${prefix}.version`, "invalid-version", `Plugin version '${plugin.version}' must be valid semver (X.Y.Z)`);
      }
    }

    // Optional: keywords (array of strings)
    if (plugin.keywords !== undefined) {
      if (!Array.isArray(plugin.keywords)) {
        err(errors, `${prefix}.keywords`, "invalid-type", "Plugin keywords must be an array");
      } else {
        for (let k = 0; k < (plugin.keywords as unknown[]).length; k++) {
          if (typeof (plugin.keywords as unknown[])[k] !== "string") {
            err(errors, `${prefix}.keywords[${k}]`, "invalid-type", "Each keyword must be a string");
          }
        }
      }
    }

    // Optional: plugin-level URLs
    for (const urlField of ["homepage", "repository"] as const) {
      if (plugin[urlField] !== undefined) {
        if (typeof plugin[urlField] !== "string") {
          err(errors, `${prefix}.${urlField}`, "invalid-type", `Plugin '${urlField}' must be a string`);
        } else {
          try {
            new URL(plugin[urlField] as string);
          } catch {
            err(errors, `${prefix}.${urlField}`, "invalid-url", `Plugin '${urlField}' is not a valid URL: ${plugin[urlField]}`, "warning");
          }
        }
      }
    }

    // Skills array validation
    if (plugin.skills !== undefined) {
      if (!Array.isArray(plugin.skills)) {
        err(errors, `${prefix}.skills`, "invalid-type", "Plugin skills must be an array");
      } else {
        const skills = plugin.skills as unknown[];

        if (skills.length === 0) {
          err(errors, `${prefix}.skills`, "empty-array", `Plugin '${pluginName ?? i}' has an empty skills array — remove the plugin or add skills`);
        }

        const seenInPlugin = new Set<string>();
        const stringSkills: string[] = [];

        for (let j = 0; j < skills.length; j++) {
          const skillPath = skills[j];

          if (typeof skillPath !== "string") {
            err(errors, `${prefix}.skills[${j}]`, "invalid-type", `Skill path must be a string, got ${typeof skillPath}`);
            continue;
          }

          stringSkills.push(skillPath);

          // Path format checks
          if (!skillPath.startsWith("./")) {
            err(errors, `${prefix}.skills[${j}]`, "invalid-path", `Skill path '${skillPath}' must start with './'`);
          }
          if (skillPath.endsWith("/")) {
            err(errors, `${prefix}.skills[${j}]`, "invalid-path", `Skill path '${skillPath}' must not have a trailing slash`);
          }
          if (skillPath.includes("\\")) {
            err(errors, `${prefix}.skills[${j}]`, "invalid-path", `Skill path '${skillPath}' must use forward slashes`);
          }
          if (/\/\.\.\//.test(skillPath) || skillPath.endsWith("/..")) {
            err(errors, `${prefix}.skills[${j}]`, "invalid-path", `Skill path '${skillPath}' must not contain '..' segments`);
          }

          // Duplicate within same plugin
          if (seenInPlugin.has(skillPath)) {
            err(errors, `${prefix}.skills[${j}]`, "duplicate-skill", `Skill path '${skillPath}' is listed twice in plugin '${pluginName ?? i}'`);
          } else if (allSkillPaths.has(skillPath)) {
            // Duplicate across plugins (only if not already a within-plugin dup)
            err(errors, `${prefix}.skills[${j}]`, "duplicate-skill", `Skill path '${skillPath}' already in plugin '${skillPathToPlugin.get(skillPath)}'`);
          }
          seenInPlugin.add(skillPath);
          allSkillPaths.add(skillPath);
          if (pluginName) skillPathToPlugin.set(skillPath, pluginName);

          // Disk existence, SKILL.md, PURPOSE.md, and frontmatter validation
          const resolved = resolve(dir, skillPath);
          if (!existsSync(resolved)) {
            err(errors, `${prefix}.skills[${j}]`, "source-not-found", `Skill path does not exist: ${skillPath}`);
          } else if (!existsSync(resolve(resolved, "SKILL.md"))) {
            err(errors, `${prefix}.skills[${j}]`, "missing-skill-md", `No SKILL.md found at: ${skillPath}`);
          } else {
            // PURPOSE.md check
            if (!existsSync(resolve(resolved, "PURPOSE.md"))) {
              err(errors, `${prefix}.skills[${j}]`, "missing-purpose-md", `No PURPOSE.md found at: ${skillPath}`, "warning");
            }

            // Cross-reference: validate SKILL.md frontmatter
            const skillMdContent = readFileSync(
              resolve(resolved, "SKILL.md"),
              "utf-8",
            );
            const fm = parseFrontmatter(skillMdContent);
            if (!fm) {
              err(errors, `${prefix}.skills[${j}]`, "invalid-frontmatter", `SKILL.md at '${skillPath}' has no valid frontmatter`);
            } else {
              const sp = `${prefix}.skills[${j}]`;

              // name field: must exist, be kebab-case, match directory
              if (!fm.name) {
                err(errors, sp, "missing-frontmatter-field", `SKILL.md at '${skillPath}' missing 'name' in frontmatter`);
              } else {
                if (!KEBAB.test(fm.name)) {
                  err(errors, sp, "invalid-name", `SKILL.md name '${fm.name}' at '${skillPath}' must be kebab-case`);
                }
                const dirName = basename(resolved);
                const normalizedDirName = dirName.replace(/_/g, "-");
                if (fm.name !== dirName && fm.name !== normalizedDirName) {
                  err(errors, sp, "name-mismatch", `SKILL.md name '${fm.name}' does not match directory name '${dirName}' at ${skillPath}`);
                }
              }

              // description field: must exist, length check
              if (!fm.description) {
                err(errors, sp, "missing-frontmatter-field", `SKILL.md at '${skillPath}' missing 'description' in frontmatter`);
              } else if (fm.description.length > MAX_DESCRIPTION_LENGTH) {
                err(errors, sp, "description-too-long", `SKILL.md description at '${skillPath}' is ${fm.description.length} chars (max ${MAX_DESCRIPTION_LENGTH})`, "warning");
              }

              // allowed-tools: validate against known tool names
              if (fm["allowed-tools"]) {
                const tools = fm["allowed-tools"]
                  .split(/[\s,]+/)
                  .filter(Boolean);
                for (const tool of tools) {
                  // Strip parenthesized restrictions like Bash(gh *)
                  const baseTool = tool.replace(/\(.*\)$/, "");
                  if (!KNOWN_TOOLS.has(baseTool)) {
                    err(errors, sp, "unknown-tool", `SKILL.md at '${skillPath}' references unknown tool '${tool}' in allowed-tools`, "warning");
                  }
                }
              }
            }

            // Check SKILL.md has content beyond frontmatter
            const bodyContent = skillMdContent
              .replace(/^---[\s\S]*?---/, "")
              .trim();
            if (bodyContent.length === 0) {
              err(errors, `${prefix}.skills[${j}]`, "empty-skill-body", `SKILL.md at '${skillPath}' has no content beyond frontmatter`, "warning");
            }
          }
        }

        // Alphabetical ordering for skills
        if (stringSkills.length > 1 && !isSorted(stringSkills)) {
          err(errors, `${prefix}.skills`, "unsorted", `Skills in plugin '${pluginName ?? i}' are not in alphabetical order`, "warning");
        }
      }
    }
  }

  // Plugin alphabetical ordering
  if (pluginNameOrder.length > 1 && !isSorted(pluginNameOrder)) {
    pluginsOutOfOrder = true;
    err(errors, "plugins", "unsorted", "Plugins are not in alphabetical order by name", "warning");
  }

  // ── Bundles ──

  if (data.bundles !== undefined) {
    if (!Array.isArray(data.bundles)) {
      err(errors, "bundles", "invalid-type", "Field 'bundles' must be an array");
    } else {
      const bundles = data.bundles as unknown[];
      const seenBundleNames = new Set<string>();

      for (let i = 0; i < bundles.length; i++) {
        const prefix = `bundles[${i}]`;

        // Type guard: each bundle must be a non-null object
        if (
          bundles[i] === null ||
          typeof bundles[i] !== "object" ||
          Array.isArray(bundles[i])
        ) {
          err(errors, prefix, "invalid-type", `Bundle at index ${i} must be an object`);
          continue;
        }

        const bundle = bundles[i] as Record<string, unknown>;
        const bundleName = bundle.name as string | undefined;

        // Required: name
        if (!bundleName) {
          err(errors, `${prefix}.name`, "missing-required-field", `Bundle at index ${i} missing 'name'`);
        } else if (typeof bundleName !== "string") {
          err(errors, `${prefix}.name`, "invalid-type", `Bundle name at index ${i} must be a string`);
        } else {
          if (!KEBAB.test(bundleName)) {
            err(errors, `${prefix}.name`, "invalid-name", `Bundle name '${bundleName}' must be kebab-case`);
          }
          if (seenBundleNames.has(bundleName)) {
            err(errors, `${prefix}.name`, "duplicate-name", `Duplicate bundle name: '${bundleName}'`);
          }
          seenBundleNames.add(bundleName);

          if (seenPluginNames.has(bundleName)) {
            err(errors, `${prefix}.name`, "name-collision", `Bundle name '${bundleName}' collides with a plugin name`, "warning");
          }
        }

        // Required: description
        if (!bundle.description) {
          err(errors, `${prefix}.description`, "missing-required-field", `Bundle at index ${i} missing 'description'`);
        } else if (typeof bundle.description !== "string") {
          err(errors, `${prefix}.description`, "invalid-type", "Bundle description must be a string");
        } else if (bundle.description === "") {
          err(errors, `${prefix}.description`, "empty-field", "Bundle description must not be empty");
        } else if (
          (bundle.description as string).length > MAX_DESCRIPTION_LENGTH
        ) {
          err(errors, `${prefix}.description`, "description-too-long", `Bundle description is ${(bundle.description as string).length} chars (max ${MAX_DESCRIPTION_LENGTH})`);
        }

        // Required: plugins
        if (!bundle.plugins) {
          err(errors, `${prefix}.plugins`, "missing-required-field", `Bundle at index ${i} missing 'plugins'`);
        } else if (!Array.isArray(bundle.plugins)) {
          err(errors, `${prefix}.plugins`, "invalid-type", "Bundle plugins must be an array");
        } else {
          const bundlePlugins = bundle.plugins as unknown[];

          if (bundlePlugins.length === 0) {
            err(errors, `${prefix}.plugins`, "empty-array", `Bundle '${bundleName ?? i}' has an empty plugins array`);
          }

          const hasWildcard = bundlePlugins.includes("*");
          if (hasWildcard && bundlePlugins.length > 1) {
            err(errors, `${prefix}.plugins`, "invalid-wildcard", `Bundle '${bundleName ?? i}' uses '*' wildcard but has other entries — '*' must be the only element`);
          }

          if (!hasWildcard) {
            const seenInBundle = new Set<string>();
            const stringRefs: string[] = [];
            for (let j = 0; j < bundlePlugins.length; j++) {
              const ref = bundlePlugins[j];
              if (typeof ref !== "string") {
                err(errors, `${prefix}.plugins[${j}]`, "invalid-type", `Bundle plugin reference must be a string, got ${typeof ref}`);
                continue;
              }
              stringRefs.push(ref);
              if (!seenPluginNames.has(ref)) {
                err(errors, `${prefix}.plugins[${j}]`, "unknown-plugin", `Bundle '${bundleName ?? i}' references unknown plugin '${ref}'`);
              }
              if (seenInBundle.has(ref)) {
                err(errors, `${prefix}.plugins[${j}]`, "duplicate-ref", `Bundle '${bundleName ?? i}' references plugin '${ref}' more than once`);
              }
              seenInBundle.add(ref);
            }

            // Note: bundle plugin order is intentional (priority/loading sequence), not alphabetical
          }
        }
      }

      // Note: bundle order is intentional (semantic grouping), not alphabetical
    }
  }

  // ── Orphan detection ──

  const skillsDir = resolve(dir, "skills");
  if (existsSync(skillsDir)) {
    const glob = new Bun.Glob("**/SKILL.md");
    for (const match of glob.scanSync({ cwd: skillsDir })) {
      const skillDir = dirname(match);
      const marketplacePath = `./skills/${skillDir}`;
      if (!allSkillPaths.has(marketplacePath)) {
        err(errors, "orphans", "orphan-skill", `Skill on disk not in any plugin: ${marketplacePath}`, "warning");
      }
    }
  }

  // ── Auto-fix ──

  const hasUnsorted = errors.some((e) => e.code === "unsorted");
  if (autoFix && hasUnsorted) {
    const fixablePlugins = data.plugins as unknown[];

    // Sort plugins alphabetically (only if they're all objects)
    if (
      fixablePlugins.every(
        (p) => p !== null && typeof p === "object" && !Array.isArray(p),
      )
    ) {
      (fixablePlugins as Array<Record<string, unknown>>).sort((a, b) =>
        String(a.name ?? "").localeCompare(String(b.name ?? "")),
      );

      // Sort skills arrays within each plugin
      for (const plugin of fixablePlugins as Array<Record<string, unknown>>) {
        if (
          Array.isArray(plugin.skills) &&
          plugin.skills.every((s: unknown) => typeof s === "string")
        ) {
          (plugin.skills as string[]).sort();
        }
      }
    }

    const fixed = JSON.stringify(data, null, 2) + "\n";
    writeFileSync(target, fixed);
    console.log(
      "Auto-fixed: sorted plugins and skills arrays alphabetically.",
    );
  }

  // ── Summary ──

  const totalSkills = allSkillPaths.size;
  const totalPlugins = seenPluginNames.size;
  const totalBundles = Array.isArray(data.bundles) ? data.bundles.length : 0;

  report(errors, { totalSkills, totalPlugins, totalBundles });
}

function report(
  errors: LintError[],
  stats?: { totalSkills: number; totalPlugins: number; totalBundles: number },
) {
  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warnCount = errors.filter((e) => e.severity === "warning").length;

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          errors,
          total: errors.length,
          errorCount,
          warningCount: warnCount,
          passed: errorCount === 0,
          ...(stats ?? {}),
        },
        null,
        2,
      ),
    );
  } else {
    if (errors.length === 0) {
      const parts = ["marketplace.json is valid."];
      if (stats) {
        parts.push(
          `${stats.totalSkills} skills, ${stats.totalPlugins} plugins, ${stats.totalBundles} bundles.`,
        );
      }
      console.log(parts.join(" "));
    } else {
      if (errorCount > 0) {
        console.log(`Found ${errorCount} error(s):\n`);
        for (const e of errors.filter((e) => e.severity === "error")) {
          console.log(`  [${e.code}] ${e.path}: ${e.message}`);
        }
      }
      if (warnCount > 0) {
        if (errorCount > 0) console.log();
        console.log(`Found ${warnCount} warning(s):\n`);
        for (const e of errors.filter((e) => e.severity === "warning")) {
          console.log(`  [${e.code}] ${e.path}: ${e.message}`);
        }
      }
      if (stats) {
        console.log(
          `\nScanned: ${stats.totalSkills} skills, ${stats.totalPlugins} plugins, ${stats.totalBundles} bundles.`,
        );
      }
    }
  }

  if (errorCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
