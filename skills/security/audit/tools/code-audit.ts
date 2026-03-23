const args = Bun.argv.slice(2);

const HELP = `
code-audit — Deep pattern-based vulnerability scanner (OWASP Top 10+)

Usage:
  bun run tools/code-audit.ts [directory] [options]

Options:
  --severity <list>   Filter by severity (critical,high,medium,low) — default: all
  --category <list>   Filter by category (injection,xss,auth,crypto,ssrf,...) — default: all
  --json              Output as JSON instead of plain text
  --verbose           Show code context for each finding
  --help              Show this help message

Scans source files for vulnerability patterns across OWASP Top 10 categories
without requiring external tools. Covers: injection (SQL, NoSQL, command, LDAP),
XSS, SSRF, path traversal, insecure crypto, prototype pollution, mass assignment,
open redirects, timing attacks, insecure deserialization, eval/exec, regex DoS,
race conditions, information disclosure, and more.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const verbose = args.includes("--verbose");
const severityFlag = args.find((_, i) => args[i - 1] === "--severity") ?? "";
const categoryFlag = args.find((_, i) => args[i - 1] === "--category") ?? "";
const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    args[i - 1] !== "--severity" &&
    args[i - 1] !== "--category",
);

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname } from "node:path";

const SCAN_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs", ".cjs", ".cts",
  ".py", ".go", ".rs", ".rb", ".php", ".java", ".kt",
  ".sh", ".bash", ".zsh",
]);

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", ".next", ".output", "coverage",
  "vendor", "__pycache__", "venv", ".venv", "target", "build",
  ".turbo", ".cache", ".nuxt", ".svelte-kit",
]);

interface VulnFinding {
  file: string;
  line: number;
  column?: number;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  rule: string;
  cwe: string;
  message: string;
  context: string;
  recommendation: string;
}

interface VulnPattern {
  name: string;
  pattern: RegExp;
  severity: VulnFinding["severity"];
  category: string;
  cwe: string;
  message: string;
  recommendation: string;
  languages?: string[];
  falsePositiveCheck?: (match: string, line: string, fullContext: string) => boolean;
}

// ─── Vulnerability Patterns ──────────────────────────────────────────────────

const VULN_PATTERNS: VulnPattern[] = [
  // ── A03:2021 Injection ──────────────────────────────────────────────────

  // SQL Injection
  {
    name: "sql-string-concat",
    pattern: /(?:query|exec|execute|raw|prepare)\s*\(\s*(?:`[^`]*\$\{|['"][^'"]*['"]\s*\+\s*(?!['"]))/gi,
    severity: "critical",
    category: "injection",
    cwe: "CWE-89",
    message: "SQL query built with string concatenation or template literals containing variables",
    recommendation: "Use parameterized queries or an ORM. Never concatenate user input into SQL strings.",
    languages: ["typescript", "javascript"],
    falsePositiveCheck: (_m, line) =>
      /drizzle|prisma|knex\.raw\(.*\?\s*,/.test(line) || /\.prepare\(\s*['"`]/.test(line),
  },
  {
    name: "sql-injection-format-string",
    pattern: /(?:cursor\.execute|\.execute)\s*\(\s*f['"]/gi,
    severity: "critical",
    category: "injection",
    cwe: "CWE-89",
    message: "SQL query built with Python f-string — direct injection vector",
    recommendation: "Use parameterized queries: cursor.execute('SELECT * FROM t WHERE id = %s', (user_id,))",
    languages: ["python"],
  },
  {
    name: "sql-injection-percent-format",
    pattern: /(?:cursor\.execute|\.execute)\s*\(\s*['"].*%s.*['"]\s*%/gi,
    severity: "critical",
    category: "injection",
    cwe: "CWE-89",
    message: "SQL query built with %-formatting — use parameterized queries instead",
    recommendation: "Pass parameters as second argument: cursor.execute('... WHERE id = %s', (val,))",
    languages: ["python"],
  },
  {
    name: "raw-sql-user-input",
    pattern: /(?:sql|SQL|Sql)`[^`]*\$\{(?:req|request|ctx|c|params|query|body|headers)\b/g,
    severity: "critical",
    category: "injection",
    cwe: "CWE-89",
    message: "Raw SQL template literal interpolates request input directly",
    recommendation: "Use parameterized queries. With Drizzle: sql`... WHERE id = ${sql.placeholder('id')}`",
  },

  // NoSQL Injection
  {
    name: "nosql-injection",
    pattern: /\.find(?:One)?\s*\(\s*\{[^}]*(?:req\.|request\.|ctx\.|params\.|query\.|body\.)/g,
    severity: "high",
    category: "injection",
    cwe: "CWE-943",
    message: "MongoDB query includes unvalidated request input — NoSQL injection risk",
    recommendation: "Validate and sanitize input with a schema (Zod) before using in queries. Reject objects with $ operators.",
  },

  // Command Injection
  {
    name: "command-injection-exec",
    pattern: /(?:child_process|exec|execSync|spawn|spawnSync)\s*\(\s*(?:`[^`]*\$\{|['"][^'"]*['"]\s*\+)/gi,
    severity: "critical",
    category: "injection",
    cwe: "CWE-78",
    message: "Shell command built with string interpolation — command injection risk",
    recommendation: "Use spawn/execFile with an argument array instead of exec with string concatenation.",
    falsePositiveCheck: (_m, line) => /execFile\s*\(/.test(line),
  },
  {
    name: "command-injection-shell-true",
    pattern: /spawn\s*\([^)]*\{[^}]*shell\s*:\s*true/g,
    severity: "high",
    category: "injection",
    cwe: "CWE-78",
    message: "spawn() called with shell: true — enables shell metacharacter interpretation",
    recommendation: "Remove shell: true and pass arguments as an array to avoid shell interpretation.",
  },
  {
    name: "command-injection-os-system",
    pattern: /os\.system\s*\(\s*(?:f['"]|['"].*['"]\s*(?:\+|%|\.format))/gi,
    severity: "critical",
    category: "injection",
    cwe: "CWE-78",
    message: "os.system() with dynamic string — command injection risk",
    recommendation: "Use subprocess.run() with a list of arguments instead of os.system().",
    languages: ["python"],
  },
  {
    name: "shell-exec-user-input",
    pattern: /(?:Bun\.spawn|Bun\.spawnSync)\s*\(\s*(?:`[^`]*\$\{|['"][^'"]*['"]\s*\+)/gi,
    severity: "critical",
    category: "injection",
    cwe: "CWE-78",
    message: "Bun.spawn with string interpolation — command injection risk",
    recommendation: "Pass command and arguments as separate array elements to Bun.spawn().",
  },

  // LDAP Injection
  {
    name: "ldap-injection",
    pattern: /(?:ldap|LDAP).*(?:search|filter|bind)\s*\([^)]*(?:`[^`]*\$\{|['"][^'"]*['"]\s*\+)/gi,
    severity: "high",
    category: "injection",
    cwe: "CWE-90",
    message: "LDAP query with string concatenation — LDAP injection risk",
    recommendation: "Use LDAP escape functions for user input before including in filters.",
  },

  // ── A02:2021 Cryptographic Failures ─────────────────────────────────────

  {
    name: "weak-hash-md5",
    pattern: /(?:createHash|hashlib\.md5|MD5|Md5)\s*\(\s*['"]?md5['"]?\s*\)/gi,
    severity: "high",
    category: "crypto",
    cwe: "CWE-328",
    message: "MD5 hash used — cryptographically broken for security purposes",
    recommendation: "Use SHA-256 or bcrypt/scrypt/argon2 for passwords. MD5 is only acceptable for checksums.",
    falsePositiveCheck: (_m, _line, ctx) => /checksum|etag|cache|fingerprint/i.test(ctx),
  },
  {
    name: "weak-hash-sha1",
    pattern: /(?:createHash|hashlib\.sha1)\s*\(\s*['"]?sha1['"]?\s*\)/gi,
    severity: "medium",
    category: "crypto",
    cwe: "CWE-328",
    message: "SHA-1 hash used — deprecated for security purposes due to collision attacks",
    recommendation: "Use SHA-256 or stronger. For passwords, use bcrypt/scrypt/argon2.",
    falsePositiveCheck: (_m, _line, ctx) => /git|checksum|etag|cache/i.test(ctx),
  },
  {
    name: "insecure-random",
    pattern: /Math\.random\s*\(\)/g,
    severity: "medium",
    category: "crypto",
    cwe: "CWE-338",
    message: "Math.random() used — not cryptographically secure",
    recommendation: "Use crypto.getRandomValues() or crypto.randomUUID() for security-sensitive randomness.",
    falsePositiveCheck: (_m, _line, ctx) =>
      /test|mock|sample|example|demo|shuffle|color|animation|jitter|delay|placeholder/i.test(ctx),
  },
  {
    name: "hardcoded-iv",
    pattern: /(?:createCipheriv|createDecipheriv)\s*\([^)]*,\s*(?:Buffer\.from|new Uint8Array)\s*\(/g,
    severity: "high",
    category: "crypto",
    cwe: "CWE-329",
    message: "Cipher uses what appears to be a static IV — IVs must be random per encryption",
    recommendation: "Generate a fresh random IV with crypto.getRandomValues() for each encryption operation.",
  },
  {
    name: "weak-cipher-des",
    pattern: /(?:createCipher(?:iv)?)\s*\(\s*['"](?:des|rc4|rc2|blowfish)['"]/gi,
    severity: "high",
    category: "crypto",
    cwe: "CWE-327",
    message: "Weak/deprecated cipher algorithm used",
    recommendation: "Use AES-256-GCM or ChaCha20-Poly1305 for symmetric encryption.",
  },
  {
    name: "ecb-mode",
    pattern: /(?:createCipher(?:iv)?)\s*\(\s*['"][^'"]*-ecb['"]/gi,
    severity: "high",
    category: "crypto",
    cwe: "CWE-327",
    message: "ECB mode used — does not provide semantic security",
    recommendation: "Use GCM or CBC mode with random IV. AES-256-GCM is recommended.",
  },
  {
    name: "password-plaintext-compare",
    pattern: /(?:password|passwd|pwd)\s*===?\s*(?:req\.|request\.|body\.|params\.|user\.|input)/gi,
    severity: "critical",
    category: "crypto",
    cwe: "CWE-256",
    message: "Password compared in plaintext — passwords must be hashed",
    recommendation: "Hash passwords with bcrypt/scrypt/argon2 and use timing-safe comparison.",
  },

  // ── A07:2021 Cross-Site Scripting (XSS) ─────────────────────────────────

  {
    name: "xss-innerhtml",
    pattern: /\.innerHTML\s*=\s*(?!['"`]\s*$)/g,
    severity: "high",
    category: "xss",
    cwe: "CWE-79",
    message: "Direct innerHTML assignment — XSS risk if value contains user input",
    recommendation: "Use textContent for plain text, or sanitize with DOMPurify before using innerHTML.",
    falsePositiveCheck: (_m, line) => /['"`]\s*$/.test(line.trim()) || /sanitize|purify|escape/i.test(line),
  },
  {
    name: "xss-dangerously-set",
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/g,
    severity: "high",
    category: "xss",
    cwe: "CWE-79",
    message: "dangerouslySetInnerHTML used — XSS risk if content is user-controlled",
    recommendation: "Sanitize HTML with DOMPurify before passing to dangerouslySetInnerHTML.",
    falsePositiveCheck: (_m, _line, ctx) => /sanitize|purify|DOMPurify/i.test(ctx),
  },
  {
    name: "xss-document-write",
    pattern: /document\.write\s*\(/g,
    severity: "high",
    category: "xss",
    cwe: "CWE-79",
    message: "document.write() used — enables DOM-based XSS",
    recommendation: "Use DOM manipulation methods (createElement, appendChild) instead of document.write().",
  },
  {
    name: "xss-template-unescaped",
    pattern: /\{\{\{[^}]+\}\}\}|<%[-=]?\s*[^%]*%>/g,
    severity: "high",
    category: "xss",
    cwe: "CWE-79",
    message: "Unescaped template output — XSS risk if rendering user input",
    recommendation: "Use escaped template syntax ({{ }} instead of {{{ }}}) or sanitize the value.",
  },
  {
    name: "xss-href-javascript",
    pattern: /href\s*=\s*\{?\s*(?:`[^`]*\$\{|['"][^'"]*['"]\s*\+|(?:user|input|param|query|req|data))/gi,
    severity: "medium",
    category: "xss",
    cwe: "CWE-79",
    message: "Dynamic href attribute — could enable javascript: protocol XSS",
    recommendation: "Validate URLs against an allowlist of protocols (http:, https:). Reject javascript: and data: URIs.",
    falsePositiveCheck: (_m, line) => /^['"`](?:https?:|\/|#)/.test(line.trim()),
  },

  // ── A01:2021 Broken Access Control ──────────────────────────────────────

  {
    name: "idor-direct-param",
    pattern: /(?:params|query|body)\s*[\[.](?:id|userId|user_id|accountId|orgId)\b[^;]*(?:findFirst|findUnique|findOne|findById|get|delete|update)\b/gi,
    severity: "high",
    category: "auth",
    cwe: "CWE-639",
    message: "Object lookup uses request parameter directly — potential IDOR vulnerability",
    recommendation: "Verify the requesting user owns or has access to the resource before returning it.",
  },
  {
    name: "missing-auth-mutation",
    pattern: /\.(post|put|patch|delete)\s*\(\s*['"][^'"]+['"]\s*,\s*(?:async\s*)?\(?(?:c|ctx|req|request)\)?\s*=>/g,
    severity: "medium",
    category: "auth",
    cwe: "CWE-862",
    message: "Mutation endpoint handler — verify authentication is enforced (middleware or inline check)",
    recommendation: "Ensure this route is protected by auth middleware or includes an explicit auth check.",
    falsePositiveCheck: (_m, _line, ctx) =>
      /auth|session|requireAuth|isAuthenticated|verifyToken|bearer|middleware.*auth/i.test(ctx),
  },
  {
    name: "cors-wildcard-credentials",
    pattern: /(?:origin|Access-Control-Allow-Origin)\s*[:=]\s*['"]\*['"].*(?:credentials|Access-Control-Allow-Credentials)\s*[:=]\s*['"]?true/gis,
    severity: "critical",
    category: "auth",
    cwe: "CWE-942",
    message: "CORS allows all origins with credentials — browsers block this, but the intent is dangerous",
    recommendation: "Use an explicit origin allowlist when credentials are enabled.",
  },
  {
    name: "cors-wildcard",
    pattern: /(?:Access-Control-Allow-Origin|origin)\s*[:=]\s*['"]?\*/g,
    severity: "medium",
    category: "auth",
    cwe: "CWE-942",
    message: "CORS allows all origins — verify this is intentional for a public API",
    recommendation: "Restrict to specific origins unless this is a fully public, unauthenticated API.",
    falsePositiveCheck: (_m, _line, ctx) => /public|cdn|static|asset/i.test(ctx),
  },

  // ── A10:2021 Server-Side Request Forgery (SSRF) ─────────────────────────

  {
    name: "ssrf-fetch-user-input",
    pattern: /fetch\s*\(\s*(?:req\.|request\.|body\.|params\.|query\.|url|input|data\[)/gi,
    severity: "high",
    category: "ssrf",
    cwe: "CWE-918",
    message: "fetch() called with user-controlled URL — SSRF risk",
    recommendation: "Validate URLs against an allowlist of hosts. Block internal/private IP ranges (127.0.0.1, 10.x, 169.254.x, etc.).",
  },
  {
    name: "ssrf-redirect-follow",
    pattern: /fetch\s*\([^)]*(?:redirect\s*:\s*['"]follow|follow\s*:\s*true)/gi,
    severity: "medium",
    category: "ssrf",
    cwe: "CWE-918",
    message: "fetch() follows redirects — can be used to bypass SSRF protections",
    recommendation: "Set redirect: 'manual' and validate redirect targets when fetching user-supplied URLs.",
  },
  {
    name: "ssrf-axios-user-input",
    pattern: /axios\s*\.(?:get|post|put|delete|request)\s*\(\s*(?:req\.|request\.|body\.|params\.|query\.|url|input)/gi,
    severity: "high",
    category: "ssrf",
    cwe: "CWE-918",
    message: "HTTP client called with user-controlled URL — SSRF risk",
    recommendation: "Validate and restrict allowed URLs. Implement URL allowlisting with host and protocol checks.",
  },

  // ── A08:2021 Insecure Deserialization ───────────────────────────────────

  {
    name: "unsafe-yaml-load",
    pattern: /yaml\.load\s*\(\s*(?!.*Loader\s*=\s*yaml\.SafeLoader)/g,
    severity: "critical",
    category: "deserialization",
    cwe: "CWE-502",
    message: "yaml.load() without SafeLoader — allows arbitrary code execution",
    recommendation: "Use yaml.safe_load() or yaml.load(data, Loader=yaml.SafeLoader).",
    languages: ["python"],
  },
  {
    name: "unsafe-pickle",
    pattern: /pickle\.(?:loads?|Unpickler)\s*\(/g,
    severity: "critical",
    category: "deserialization",
    cwe: "CWE-502",
    message: "pickle.load() used — allows arbitrary code execution from untrusted data",
    recommendation: "Use JSON or a safe serialization format for untrusted data. Only pickle trusted data.",
    languages: ["python"],
  },
  {
    name: "unsafe-eval-json",
    pattern: /eval\s*\(\s*(?:req|request|body|params|query|input|data|response)/gi,
    severity: "critical",
    category: "deserialization",
    cwe: "CWE-502",
    message: "eval() used on external data — arbitrary code execution risk",
    recommendation: "Use JSON.parse() for JSON data. Never eval() untrusted input.",
  },
  {
    name: "unsafe-unserialize",
    pattern: /(?:unserialize|deserialize)\s*\(\s*\$(?:_GET|_POST|_REQUEST|_COOKIE)/gi,
    severity: "critical",
    category: "deserialization",
    cwe: "CWE-502",
    message: "Deserialization of user input — arbitrary object injection risk",
    recommendation: "Use JSON for data exchange. Never unserialize user-controlled input.",
    languages: ["php"],
  },

  // ── Code Execution ──────────────────────────────────────────────────────

  {
    name: "eval-dynamic",
    pattern: /\beval\s*\(\s*(?!['"`])/g,
    severity: "critical",
    category: "code-execution",
    cwe: "CWE-95",
    message: "eval() with dynamic argument — arbitrary code execution risk",
    recommendation: "Remove eval(). Use JSON.parse() for data, Function constructor for templates, or restructure logic.",
    falsePositiveCheck: (_m, line) =>
      /^\s*\/\//.test(line) || /eslint-disable|nosec|nosemgrep|test|spec|mock/i.test(line),
  },
  {
    name: "new-function-dynamic",
    pattern: /new\s+Function\s*\(\s*(?!['"`]\s*\))/g,
    severity: "high",
    category: "code-execution",
    cwe: "CWE-95",
    message: "new Function() with dynamic argument — similar risk to eval()",
    recommendation: "Avoid constructing functions from strings. Use explicit logic or safe templating.",
  },
  {
    name: "vm-runInContext",
    pattern: /vm\.(?:runInNewContext|runInThisContext|runInContext|compileFunction)\s*\(/g,
    severity: "high",
    category: "code-execution",
    cwe: "CWE-94",
    message: "Node.js vm module used — vm is NOT a security sandbox",
    recommendation: "The vm module does not provide security isolation. Use a proper sandbox (vm2 is also broken — consider isolated-vm or subprocess).",
  },

  // ── A01:2021 Path Traversal ─────────────────────────────────────────────

  {
    name: "path-traversal-join",
    pattern: /(?:path\.join|path\.resolve|join|resolve)\s*\([^)]*(?:req\.|request\.|body\.|params\.|query\.)/gi,
    severity: "high",
    category: "path-traversal",
    cwe: "CWE-22",
    message: "File path includes user input — path traversal risk (../ attack)",
    recommendation: "Validate the resolved path starts with the intended base directory. Reject paths containing '..'.",
    falsePositiveCheck: (_m, _line, ctx) =>
      /normalize|sanitize|startsWith|includes\s*\(\s*['"]\.\./.test(ctx),
  },
  {
    name: "path-traversal-readfile",
    pattern: /(?:readFile|readFileSync|createReadStream|writeFile|writeFileSync)\s*\(\s*(?:req\.|request\.|body\.|params\.|query\.)/gi,
    severity: "critical",
    category: "path-traversal",
    cwe: "CWE-22",
    message: "File operation with user-controlled path — arbitrary file read/write risk",
    recommendation: "Resolve the path, validate it's within an allowed directory, and reject '..' sequences.",
  },
  {
    name: "path-traversal-sendfile",
    pattern: /(?:sendFile|download|send|serveFile)\s*\(\s*(?:req\.|request\.|params\.|query\.)/gi,
    severity: "high",
    category: "path-traversal",
    cwe: "CWE-22",
    message: "File serving with user-controlled path — path traversal risk",
    recommendation: "Use a static file server with a confined root directory. Validate paths don't escape the root.",
  },

  // ── Open Redirect ───────────────────────────────────────────────────────

  {
    name: "open-redirect",
    pattern: /(?:redirect|location\.href|window\.location|res\.redirect)\s*(?:=|\()\s*(?:req\.|request\.|body\.|params\.|query\.|url|input|data\[)/gi,
    severity: "medium",
    category: "open-redirect",
    cwe: "CWE-601",
    message: "Redirect target from user input — open redirect risk (phishing, OAuth token theft)",
    recommendation: "Validate redirect URLs against an allowlist of paths or hosts. Only allow relative redirects to known paths.",
    falsePositiveCheck: (_m, _line, ctx) =>
      /allowlist|whitelist|startsWith\s*\(\s*['"]\/|\.includes|validUrl|allowedUrl/i.test(ctx),
  },

  // ── Prototype Pollution ─────────────────────────────────────────────────

  {
    name: "prototype-pollution-bracket",
    pattern: /\[(?:req|request|body|params|query|input|key|prop|name|field)\b[^\]]*\]\s*=/g,
    severity: "high",
    category: "prototype-pollution",
    cwe: "CWE-1321",
    message: "Dynamic property assignment from user input — prototype pollution risk",
    recommendation: "Use Map instead of plain objects, or validate keys against an allowlist. Reject '__proto__', 'constructor', 'prototype'.",
    falsePositiveCheck: (_m, line) =>
      /Map|allowlist|whitelist|hasOwn|hasOwnProperty|__proto__|constructor.*prototype/i.test(line),
  },
  {
    name: "prototype-pollution-merge",
    pattern: /(?:merge|extend|assign|defaults|deepMerge)\s*\([^)]*(?:req\.|request\.|body\.|params\.|query\.)/gi,
    severity: "medium",
    category: "prototype-pollution",
    cwe: "CWE-1321",
    message: "Deep merge with user input — prototype pollution risk via __proto__ keys",
    recommendation: "Use a safe merge library, or filter out __proto__, constructor, and prototype keys before merging.",
  },

  // ── Mass Assignment ─────────────────────────────────────────────────────

  {
    name: "mass-assignment-spread",
    pattern: /(?:create|insert|update|save|upsert)\s*\(\s*\{\s*\.\.\.(?:req\.body|body|params|data|input)/gi,
    severity: "high",
    category: "mass-assignment",
    cwe: "CWE-915",
    message: "Request body spread directly into database operation — mass assignment risk",
    recommendation: "Destructure only the expected fields from the request body. Use a Zod schema to validate and pick allowed fields.",
  },
  {
    name: "mass-assignment-direct",
    pattern: /(?:create|insert|update|save|upsert)\s*\(\s*(?:req\.body|request\.body|ctx\.body|c\.req\.(?:json|valid))/gi,
    severity: "high",
    category: "mass-assignment",
    cwe: "CWE-915",
    message: "Full request body passed to database operation — mass assignment risk",
    recommendation: "Pick only the allowed fields. Validate with a Zod schema: schema.parse(body) to strip unknown fields.",
    falsePositiveCheck: (_m, _line, ctx) => /zod|z\.\w+|\.parse\(|\.safeParse\(|validated|schema/i.test(ctx),
  },

  // ── Timing Attacks ──────────────────────────────────────────────────────

  {
    name: "timing-attack-comparison",
    pattern: /(?:token|secret|apiKey|api_key|hash|signature|hmac|digest)\s*(?:===?|!==?)\s*(?!null|undefined|''|""|true|false|\d)/gi,
    severity: "medium",
    category: "timing-attack",
    cwe: "CWE-208",
    message: "Secret compared with === — vulnerable to timing attacks",
    recommendation: "Use crypto.timingSafeEqual() for comparing secrets, tokens, HMACs, and signatures.",
    falsePositiveCheck: (_m, line) =>
      /timingSafeEqual|constantTime|safeCompare/i.test(line) || /(?:null|undefined|''|"")/.test(line),
  },

  // ── Information Disclosure ──────────────────────────────────────────────

  {
    name: "error-stack-exposure",
    pattern: /(?:res\.(?:json|send)|c\.json)\s*\([^)]*(?:err\.stack|error\.stack|\.stack)/g,
    severity: "medium",
    category: "information-disclosure",
    cwe: "CWE-209",
    message: "Error stack trace sent in response — leaks internal paths and code structure",
    recommendation: "Log the full error server-side. Return only a generic error message to the client.",
  },
  {
    name: "verbose-error-response",
    pattern: /catch\s*\([^)]*\)\s*\{[^}]*(?:res\.(?:json|send|status)|c\.json)\s*\([^)]*(?:err\.message|error\.message|e\.message)/gis,
    severity: "low",
    category: "information-disclosure",
    cwe: "CWE-209",
    message: "Internal error message sent to client — may leak implementation details",
    recommendation: "Return a generic error message. Log the detailed error server-side.",
  },
  {
    name: "console-log-sensitive",
    pattern: /console\.log\s*\([^)]*(?:password|secret|token|apiKey|api_key|private_key|authorization)/gi,
    severity: "medium",
    category: "information-disclosure",
    cwe: "CWE-532",
    message: "Sensitive data logged to console — may appear in log files or monitoring",
    recommendation: "Remove sensitive data from log statements. Redact or mask values if logging is necessary.",
    falsePositiveCheck: (_m, line) => /mask|redact|\*\*\*|\.length|typeof/i.test(line),
  },

  // ── Regex DoS (ReDoS) ──────────────────────────────────────────────────

  {
    name: "redos-nested-quantifier",
    pattern: /new\s+RegExp\s*\(\s*(?:req\.|request\.|body\.|params\.|query\.|input|user)/gi,
    severity: "high",
    category: "redos",
    cwe: "CWE-1333",
    message: "RegExp constructed from user input — ReDoS and injection risk",
    recommendation: "Never build regexes from user input. If needed, escape special chars with a library or use string methods.",
  },

  // ── Race Conditions ─────────────────────────────────────────────────────

  {
    name: "race-condition-check-then-act",
    pattern: /(?:if|while)\s*\([^)]*(?:existsSync|accessSync|statSync)\s*\([^)]*\)\s*\)\s*\{[^}]*(?:readFileSync|writeFileSync|unlinkSync|mkdirSync)/gis,
    severity: "medium",
    category: "race-condition",
    cwe: "CWE-367",
    message: "TOCTOU race condition — checking file existence then acting on it",
    recommendation: "Use atomic file operations. Open with exclusive flags (O_EXCL) or handle ENOENT/EEXIST errors.",
  },

  // ── Insecure Configuration ──────────────────────────────────────────────

  {
    name: "tls-reject-unauthorized",
    pattern: /(?:NODE_TLS_REJECT_UNAUTHORIZED|rejectUnauthorized)\s*[:=]\s*(?:['"]?0['"]?|false|['"]false['"])/gi,
    severity: "critical",
    category: "config",
    cwe: "CWE-295",
    message: "TLS certificate validation disabled — enables man-in-the-middle attacks",
    recommendation: "Remove this setting. Fix the underlying certificate issue (update CA bundle, use valid certs).",
  },
  {
    name: "cookie-no-httponly",
    pattern: /(?:setCookie|set-cookie|cookie\s*[:=])\s*[^;]*(?!.*httpOnly|.*HttpOnly|.*httponly)/gi,
    severity: "medium",
    category: "config",
    cwe: "CWE-1004",
    message: "Cookie set without httpOnly flag — accessible to JavaScript (XSS cookie theft)",
    recommendation: "Set httpOnly: true for session cookies and other sensitive cookies.",
    falsePositiveCheck: (_m, line) => /httpOnly|HttpOnly|httponly/i.test(line),
  },
  {
    name: "cookie-no-secure",
    pattern: /(?:setCookie|cookie)\s*\([^)]*(?!.*secure\s*:\s*true)/gi,
    severity: "medium",
    category: "config",
    cwe: "CWE-614",
    message: "Cookie set without secure flag — will be sent over plain HTTP",
    recommendation: "Set secure: true for all sensitive cookies in production.",
    falsePositiveCheck: (_m, line) => /secure\s*:\s*true|secure/i.test(line),
  },
  {
    name: "debug-mode-production",
    pattern: /(?:DEBUG|debug)\s*[:=]\s*(?:['"]?true['"]?|1|['"]1['"])\s*(?:,|$|\n)/gm,
    severity: "medium",
    category: "config",
    cwe: "CWE-489",
    message: "Debug mode appears enabled — may expose sensitive information in production",
    recommendation: "Ensure debug mode is disabled in production. Use environment variables to control debug settings.",
    falsePositiveCheck: (_m, _line, ctx) => /\.env\.example|\.env\.development|test|spec|mock/i.test(ctx),
  },

  // ── JWT Issues ──────────────────────────────────────────────────────────

  {
    name: "jwt-none-algorithm",
    pattern: /(?:algorithm|alg)\s*[:=]\s*['"]none['"]/gi,
    severity: "critical",
    category: "auth",
    cwe: "CWE-345",
    message: "JWT 'none' algorithm — allows unsigned tokens, bypasses authentication",
    recommendation: "Always specify a strong algorithm (RS256, ES256). Never allow 'none'.",
  },
  {
    name: "jwt-weak-secret",
    pattern: /(?:jwt\.sign|sign)\s*\([^)]*['"](?:secret|password|key|test|1234|admin)['"]/gi,
    severity: "high",
    category: "auth",
    cwe: "CWE-798",
    message: "JWT signed with a weak or hardcoded secret",
    recommendation: "Use a strong, randomly generated secret (256+ bits). Load from environment variable.",
  },
  {
    name: "jwt-no-expiry",
    pattern: /(?:jwt\.sign|sign)\s*\([^)]*\{(?:(?!expiresIn|exp)[^}])*\}\s*\)/gis,
    severity: "medium",
    category: "auth",
    cwe: "CWE-613",
    message: "JWT signed without expiration — tokens valid forever if leaked",
    recommendation: "Always set an expiresIn value. Use short-lived tokens (15min-1hr) with refresh tokens.",
  },

  // ── Sensitive Data Exposure ─────────────────────────────────────────────

  {
    name: "password-in-url",
    pattern: /(?:https?:\/\/)[^@\s]+:[^@\s]+@/g,
    severity: "high",
    category: "information-disclosure",
    cwe: "CWE-522",
    message: "Credentials embedded in URL — may be logged in server logs, browser history, and proxies",
    recommendation: "Pass credentials via headers, environment variables, or a secrets manager.",
    falsePositiveCheck: (_m, line) => /example|placeholder|localhost:.*@localhost|test/i.test(line),
  },
  {
    name: "localstorage-sensitive",
    pattern: /localStorage\.setItem\s*\(\s*['"](?:token|auth|session|jwt|api_key|password|secret)/gi,
    severity: "high",
    category: "auth",
    cwe: "CWE-922",
    message: "Sensitive data stored in localStorage — accessible to XSS attacks",
    recommendation: "Use httpOnly cookies for tokens and session data. localStorage has no XSS protection.",
  },
];

// ─── Scanning Engine ──────────────────────────────────────────────────────────

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else {
      const ext = extname(entry.name);
      if (SCAN_EXTENSIONS.has(ext)) {
        files.push(full);
      }
    }
  }
  return files;
}

function detectLanguage(file: string): string {
  const ext = extname(file);
  const map: Record<string, string> = {
    ".ts": "typescript", ".tsx": "typescript", ".mts": "typescript", ".cts": "typescript",
    ".js": "javascript", ".jsx": "javascript", ".mjs": "javascript", ".cjs": "javascript",
    ".py": "python", ".go": "go", ".rs": "rust", ".rb": "ruby",
    ".php": "php", ".java": "java", ".kt": "kotlin",
    ".sh": "shell", ".bash": "shell", ".zsh": "shell",
  };
  return map[ext] ?? "unknown";
}

function isTestFile(file: string): boolean {
  return /(?:\.test\.|\.spec\.|__tests__|__mocks__|test\/|tests\/|\.stories\.)/i.test(file);
}

async function main() {
  const dir = resolve(filteredArgs[0] ?? ".");
  const files = await collectFiles(dir);
  const findings: VulnFinding[] = [];

  const severityFilter = severityFlag
    ? new Set(severityFlag.split(",").map((s) => s.trim().toLowerCase()))
    : null;
  const categoryFilter = categoryFlag
    ? new Set(categoryFlag.split(",").map((c) => c.trim().toLowerCase()))
    : null;

  for (const file of files) {
    let content: string;
    try {
      content = await readFile(file, "utf-8");
    } catch {
      continue;
    }

    // Skip minified files
    const avgLineLength = content.length / Math.max(content.split("\n").length, 1);
    if (avgLineLength > 500) continue;

    const lines = content.split("\n");
    const rel = relative(dir, file);
    const lang = detectLanguage(file);
    const inTest = isTestFile(file);

    for (const vuln of VULN_PATTERNS) {
      // Skip patterns for other languages
      if (vuln.languages && !vuln.languages.includes(lang) && !vuln.languages.some(l =>
        (l === "typescript" && lang === "javascript") || (l === "javascript" && lang === "typescript")
      )) continue;

      // Apply filters
      if (severityFilter && !severityFilter.has(vuln.severity)) continue;
      if (categoryFilter && !categoryFilter.has(vuln.category)) continue;

      vuln.pattern.lastIndex = 0;
      let match;
      while ((match = vuln.pattern.exec(content)) !== null) {
        const lineNum = content.slice(0, match.index).split("\n").length;
        const lineText = lines[lineNum - 1] ?? "";

        // Skip comments
        const trimmed = lineText.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;

        // Skip suppression markers
        if (/nosec|nosemgrep|eslint-disable|noinspection|NOSONAR|security-ok/i.test(lineText)) continue;

        // Get surrounding context for false positive checks
        const contextStart = Math.max(0, lineNum - 5);
        const contextEnd = Math.min(lines.length, lineNum + 10);
        const fullContext = lines.slice(contextStart, contextEnd).join("\n");

        // Run false positive check
        if (vuln.falsePositiveCheck?.(match[0], lineText, fullContext)) continue;

        // Lower severity for test files
        let severity = vuln.severity;
        if (inTest) {
          if (severity === "critical") severity = "low";
          else if (severity === "high") severity = "low";
          else continue; // skip medium/low in test files
        }

        findings.push({
          file: rel,
          line: lineNum,
          severity,
          category: vuln.category,
          rule: vuln.name,
          cwe: vuln.cwe,
          message: vuln.message,
          context: lineText.trim().slice(0, 200),
          recommendation: vuln.recommendation,
        });
      }
    }
  }

  // Deduplicate (same file + line + rule)
  const seen = new Set<string>();
  const deduped = findings.filter((f) => {
    const key = `${f.file}:${f.line}:${f.rule}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  deduped.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const summary = {
    critical: deduped.filter((f) => f.severity === "critical").length,
    high: deduped.filter((f) => f.severity === "high").length,
    medium: deduped.filter((f) => f.severity === "medium").length,
    low: deduped.filter((f) => f.severity === "low").length,
  };

  const categorySummary: Record<string, number> = {};
  for (const f of deduped) {
    categorySummary[f.category] = (categorySummary[f.category] ?? 0) + 1;
  }

  const result = {
    root: dir,
    filesScanned: files.length,
    totalFindings: deduped.length,
    summary,
    categorySummary,
    findings: deduped,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log("# Code Audit Report\n");
  console.log(`Files scanned: ${files.length}`);
  console.log(`Total findings: ${deduped.length}\n`);

  if (deduped.length === 0) {
    console.log("No vulnerability patterns detected.");
    return;
  }

  console.log("## Severity Summary\n");
  if (summary.critical) console.log(`  CRITICAL: ${summary.critical}`);
  if (summary.high) console.log(`  HIGH:     ${summary.high}`);
  if (summary.medium) console.log(`  MEDIUM:   ${summary.medium}`);
  if (summary.low) console.log(`  LOW:      ${summary.low}`);
  console.log();

  console.log("## Category Summary\n");
  const sortedCats = Object.entries(categorySummary).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCats) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log();

  console.log("## Findings\n");
  let currentSeverity = "";
  for (const f of deduped) {
    if (f.severity !== currentSeverity) {
      currentSeverity = f.severity;
      console.log(`### ${f.severity.toUpperCase()}\n`);
    }
    console.log(`  ${f.file}:${f.line} — ${f.rule} [${f.cwe}]`);
    console.log(`    ${f.message}`);
    if (verbose) {
      console.log(`    Code: ${f.context}`);
    }
    console.log(`    Fix: ${f.recommendation}`);
    console.log();
  }

  console.log("## OWASP Top 10 Coverage\n");
  console.log("  A01 Broken Access Control    — IDOR, CORS, missing auth checks");
  console.log("  A02 Cryptographic Failures   — weak hashes, insecure random, hardcoded secrets");
  console.log("  A03 Injection                — SQL, NoSQL, command, LDAP injection");
  console.log("  A04 Insecure Design          — mass assignment, race conditions");
  console.log("  A05 Security Misconfiguration — TLS bypass, debug mode, cookie flags");
  console.log("  A06 Vulnerable Components    — (see dependency-audit.ts)");
  console.log("  A07 Auth Failures            — JWT issues, localStorage tokens, timing attacks");
  console.log("  A08 Data Integrity Failures  — insecure deserialization, prototype pollution");
  console.log("  A09 Logging Failures         — sensitive data in logs, error stack exposure");
  console.log("  A10 SSRF                     — user-controlled fetch/axios URLs");
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
