const args = Bun.argv.slice(2);

const HELP = `
permission-audit — Show all roles and permissions defined in the auth config

Usage:
  bun run tools/permission-audit.ts [path] [options]

Arguments:
  path    Path to the auth package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface RoleInfo {
  name: string;
  permissions: string[];
  source: string;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Scan all TypeScript files in src/ for role/permission definitions
  const glob = new Bun.Glob("src/**/*.{ts,tsx}");
  const roles: RoleInfo[] = [];
  const seenRoles = new Set<string>();

  for await (const file of glob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();

    // Match Better Auth access plugin patterns:
    // roles: { admin: { permissions: ["*"] }, member: { permissions: ["read"] } }
    const rolesBlockMatch = content.match(/roles\s*:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)}/);
    if (rolesBlockMatch) {
      const block = rolesBlockMatch[1];
      // Extract individual role definitions
      const roleMatches = block.matchAll(
        /(\w+)\s*:\s*\{\s*permissions\s*:\s*\[([^\]]*)\]/g
      );
      for (const m of roleMatches) {
        const roleName = m[1];
        if (seenRoles.has(roleName)) continue;
        seenRoles.add(roleName);

        const perms = m[2]
          .split(",")
          .map((p) => p.trim().replace(/['"]/g, ""))
          .filter(Boolean);

        roles.push({
          name: roleName,
          permissions: perms,
          source: file,
        });
      }
    }

    // Also match simple role string arrays:
    // roles: ["admin", "member", "editor"]
    const roleArrayMatch = content.match(/roles\s*:\s*\[([^\]]+)\]/);
    if (roleArrayMatch && !rolesBlockMatch) {
      const names = roleArrayMatch[1]
        .split(",")
        .map((r) => r.trim().replace(/['"]/g, ""))
        .filter(Boolean);

      for (const name of names) {
        if (seenRoles.has(name)) continue;
        seenRoles.add(name);
        roles.push({ name, permissions: [], source: file });
      }
    }
  }

  // Scan for permission checks in middleware/routes
  const permissionChecks: { file: string; permission: string; line: number }[] = [];
  const checkGlob = new Bun.Glob("src/**/*.{ts,tsx}");

  for await (const file of checkGlob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      // Match common permission check patterns
      const checkMatch = lines[i].match(
        /(?:hasPermission|checkPermission|requirePermission|can)\s*\(\s*['"]([^'"]+)['"]/
      );
      if (checkMatch) {
        permissionChecks.push({
          file,
          permission: checkMatch[1],
          line: i + 1,
        });
      }
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ roles, permissionChecks }, null, 2));
  } else {
    if (roles.length === 0) {
      console.log("No roles found in auth config.");
      console.log("Tip: define roles in the access() plugin in src/auth.ts");
      return;
    }

    console.log(`Roles (${roles.length}):\n`);
    for (const role of roles) {
      const perms =
        role.permissions.length > 0
          ? role.permissions.join(", ")
          : "(no permissions defined)";
      console.log(`  ${role.name}`);
      console.log(`    permissions: ${perms}`);
      console.log(`    source: ${role.source}`);
    }

    if (permissionChecks.length > 0) {
      console.log(`\nPermission checks found (${permissionChecks.length}):\n`);
      for (const check of permissionChecks) {
        console.log(`  "${check.permission}" at ${check.file}:${check.line}`);
      }

      // Check for undefined permissions
      const allPerms = new Set(roles.flatMap((r) => r.permissions));
      const checkedPerms = new Set(permissionChecks.map((c) => c.permission));
      const undefined_ = [...checkedPerms].filter(
        (p) => !allPerms.has(p) && !allPerms.has("*")
      );

      if (undefined_.length > 0) {
        console.log("\nUndefined permissions (checked but not granted to any role):");
        for (const p of undefined_) {
          console.log(`  ! ${p}`);
        }
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
