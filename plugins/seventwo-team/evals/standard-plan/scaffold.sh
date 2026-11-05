#!/usr/bin/env bash
set -euo pipefail
git init -q .
mkdir -p src tests docs
cat > src/status.ts <<'TS'
export type Check = { name: string; ok: boolean; ms: number };
export function formatStatus(checks: Check[]): string {
  return checks.map((c) => `${c.ok ? "ok  " : "FAIL"}  ${c.name} (${c.ms}ms)`).join("\n");
}
TS
cat > src/cli.ts <<'TS'
import { formatStatus, type Check } from "./status";
import { runChecks } from "./checks";
export async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (command !== "status") {
    console.error(`unknown command: ${command}`);
    return 2;
  }
  if (rest.length > 0) {
    console.error(`unexpected arguments: ${rest.join(" ")}`);
    return 2;
  }
  const checks: Check[] = await runChecks();
  console.log(formatStatus(checks));
  return checks.every((c) => c.ok) ? 0 : 1;
}
TS
cat > src/checks.ts <<'TS'
import type { Check } from "./status";
export async function runChecks(): Promise<Check[]> {
  return [{ name: "db", ok: true, ms: 3 }, { name: "cache", ok: false, ms: 12 }];
}
TS
cat > tests/status.test.ts <<'TS'
import { formatStatus } from "../src/status";
test("text output", () => {
  expect(formatStatus([{ name: "db", ok: true, ms: 3 }])).toBe("ok    db (3ms)");
});
TS
cat > docs/usage.md <<'MD'
# Usage

`tool status` runs all health checks and prints one line per check.
Exit code 0 means every check passed, 1 means at least one failed.
MD
cat > CONTRIBUTING.md <<'MD'
Every behaviour change needs a test and a docs/usage.md update.
Keep the text output format and exit codes stable.
MD
git add . && git -c user.name=eval -c user.email=eval@example.com commit -qm init
