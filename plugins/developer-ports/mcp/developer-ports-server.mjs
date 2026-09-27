#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const VERSION = "0.1.0";
const DEFAULT_ROOTS = ["/Volumes/DevDisk/Developer"];
const DEFAULT_RANGE = { start: 43000, end: 49999 };

const SKIP_DIRS = new Set([
	".git",
	"node_modules",
	".next",
	".nuxt",
	"dist",
	"build",
	".build",
	"DerivedData",
	"Pods",
	"vendor",
	"coverage",
	".turbo",
	".astro",
	".expo",
	".venv",
	"venv",
	"__pycache__",
	".idea",
	".swiftpm",
	"xcuserdata",
	"visual-captures",
	".chrome-profile-test",
	".cache",
	".parcel-cache",
	"target",
	".firebase",
	".vercel",
	".wrangler",
	"out",
	"generated",
	"logs",
]);

const SKIP_EXTENSIONS = new Set([
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".ico",
	".icns",
	".pdf",
	".zip",
	".gz",
	".tgz",
	".tar",
	".xcarchive",
	".ipa",
	".app",
	".dSYM",
	".sqlite",
	".db",
	".bin",
	".mp4",
	".mov",
	".mp3",
	".wav",
	".aiff",
	".heic",
	".lock",
	".o",
	".rlib",
	".rmeta",
	".a",
	".dylib",
	".so",
	".d",
	".swiftmodule",
	".swiftinterface",
	".swiftdoc",
	".DS_Store",
]);

const PORT_PATTERNS = [
	{
		kind: "url",
		regexp: /(?<![\w.])(?:https?:\/\/)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1):([1-9]\d{1,4})(?!\d)/g,
	},
	{
		kind: "key",
		regexp: /["']?\b[A-Za-z0-9_-]*(?:port|Port|PORT)[A-Za-z0-9_-]*\b["']?\s*[:=]\s*["']?([1-9]\d{1,4})(?!\d)/g,
	},
	{
		kind: "flag",
		regexp: /(?:--port|--host-port|--listen-port|--inspect|--debug)[=\s]+([1-9]\d{1,4})(?!\d)/g,
	},
	{
		kind: "listen",
		regexp: /\blisten\(\s*(?:process\.env\.[A-Z0-9_]+\s*\|\|\s*)?["']?([1-9]\d{1,4})(?!\d)/gi,
	},
	{
		kind: "expose",
		regexp: /\bEXPOSE\s+([1-9]\d{1,4})(?!\d)/gi,
	},
	{
		kind: "docker-map",
		regexp: /^\s*(?:-\s*)?["']?([1-9]\d{1,4}):([1-9]\d{1,4})(?:\/[a-z]+)?["']?\s*(?:#.*)?$/g,
	},
];

const TRIGGER_WORDS = [
	"port",
	"PORT",
	"Port",
	"localhost",
	"127.0.0.1",
	"0.0.0.0",
	"listen(",
	"EXPOSE",
	"--port",
	"containerPort",
	"targetPort",
	"hostPort",
	"nodePort",
	":300",
	":400",
	":500",
	":800",
	":900",
];

function registryPath() {
	if (process.env.DEVELOPER_PORTS_REGISTRY) {
		return path.resolve(process.env.DEVELOPER_PORTS_REGISTRY);
	}
	const configRoot = process.env.XDG_CONFIG_HOME
		? path.resolve(process.env.XDG_CONFIG_HOME)
		: path.join(os.homedir(), ".config");
	return path.join(configRoot, "developer-ports", "registry.json");
}

function now() {
	return new Date().toISOString();
}

function emptyRegistry() {
	return {
		version: 1,
		updatedAt: now(),
		reservations: [],
		detected: {
			updatedAt: null,
			roots: [],
			projects: [],
			collisions: [],
		},
	};
}

async function loadRegistry() {
	const file = registryPath();
	if (!existsSync(file)) return emptyRegistry();
	const parsed = JSON.parse(await readFile(file, "utf8"));
	return {
		...emptyRegistry(),
		...parsed,
		detected: {
			...emptyRegistry().detected,
			...(parsed.detected ?? {}),
		},
		reservations: Array.isArray(parsed.reservations) ? parsed.reservations : [],
	};
}

async function saveRegistry(registry) {
	const file = registryPath();
	registry.updatedAt = now();
	await mkdir(path.dirname(file), { recursive: true });
	await writeFile(file, `${JSON.stringify(registry, null, "\t")}\n`);
	return file;
}

function assertPort(value, label = "port") {
	const port = Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error(`${label} must be an integer from 1 to 65535`);
	}
	return port;
}

function assertString(value, label) {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new Error(`${label} is required`);
	}
	return value.trim();
}

function uniqueNumbers(values) {
	return [...new Set(values.filter((value) => Number.isInteger(value)))].sort((a, b) => a - b);
}

async function listTopLevelProjects(roots) {
	const projects = [];
	for (const root of roots) {
		const absRoot = path.resolve(root);
		if (!existsSync(absRoot)) continue;
		const rootStat = await stat(absRoot);
		if (!rootStat.isDirectory()) continue;

		const entries = await readdir(absRoot, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
			const projectPath = path.join(absRoot, entry.name);
			projects.push({ name: entry.name, path: projectPath, root: absRoot });
		}
	}
	return projects.sort((a, b) => a.path.localeCompare(b.path));
}

function shouldSkipDirectory(parentRelative, dirname) {
	if (SKIP_DIRS.has(dirname)) return true;
	if ((parentRelative.includes(".claude") || parentRelative.includes(".codex")) && dirname === "worktrees") {
		return true;
	}
	if (dirname.startsWith(".") && ![".claude", ".codex", ".devcontainer", ".github"].includes(dirname)) {
		return true;
	}
	return false;
}

async function walkProjectFiles(projectPath) {
	const files = [];

	async function walk(current) {
		const relativeDir = path.relative(projectPath, current);
		let entries = [];
		try {
			entries = await readdir(current, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			const absolute = path.join(current, entry.name);
			const relative = path.relative(projectPath, absolute);
			if (entry.isDirectory()) {
				if (!shouldSkipDirectory(relativeDir, entry.name)) await walk(absolute);
				continue;
			}
			if (!entry.isFile()) continue;
			if (relative.split(path.sep).some((part) => ["worktrees", ".chrome-profile-test", "visual-captures"].includes(part))) {
				continue;
			}
			if (SKIP_EXTENSIONS.has(path.extname(entry.name))) continue;
			files.push({ absolute, relative });
		}
	}

	await walk(projectPath);
	return files;
}

async function readTextIfSource(file) {
	let info;
	try {
		info = await stat(file.absolute);
	} catch {
		return null;
	}
	if (info.size > 1_000_000) return null;
	let buffer;
	try {
		buffer = await readFile(file.absolute);
	} catch {
		return null;
	}
	if (buffer.subarray(0, 4096).includes(0)) return null;
	return buffer.toString("utf8");
}

function classifyEvidence(relativeFile, line, kind) {
	const file = relativeFile.replace(/\\/g, "/");
	const lower = line.toLowerCase();
	if (
		file.includes("deploy/") ||
		file.includes("kubernetes/") ||
		file.includes("templates/") ||
		file.includes("helm") ||
		file.includes("kustomize") ||
		file.includes("Dockerfile") ||
		kind === "expose" ||
		lower.includes("containerport") ||
		lower.includes("targetport") ||
		lower.includes("hostport") ||
		lower.includes("nodeport")
	) {
		return "container/k8s";
	}
	if (
		file.includes("test") ||
		file.includes("tests") ||
		file.includes("__tests__") ||
		file.includes("fixtures") ||
		file.includes("examples") ||
		line.includes("assert!") ||
		line.includes("expect(")
	) {
		return "test/example";
	}
	if (
		file.includes(".env") ||
		file.includes("package.json") ||
		file.includes("vite.config") ||
		file.includes("astro.config") ||
		file.includes("next.config") ||
		file.includes("wrangler.toml") ||
		file.includes("wrangler.json") ||
		file.includes("firebase.json") ||
		file.includes("playwright.config") ||
		file.includes("devcontainer") ||
		file.includes("compose") ||
		file.includes("docker-compose") ||
		file.includes(".codex") ||
		file.includes(".claude/launch.json") ||
		lower.includes("localhost") ||
		lower.includes("127.0.0.1") ||
		lower.includes("0.0.0.0") ||
		lower.includes("--port") ||
		lower.includes("listen(")
	) {
		return "local/dev";
	}
	if (file.includes("README") || file.includes("AGENTS") || file.includes("CLAUDE") || file.includes("docs/")) {
		return "docs";
	}
	return "source";
}

function extractHits(project, file, text) {
	const hits = [];
	const lines = text.split(/\r?\n/);
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		if (line.includes("containerPortal")) continue;
		if (!TRIGGER_WORDS.some((word) => line.includes(word))) continue;

		for (const pattern of PORT_PATTERNS) {
			pattern.regexp.lastIndex = 0;
			for (const match of line.matchAll(pattern.regexp)) {
				const entries =
					pattern.kind === "docker-map"
						? [
								{ port: Number(match[1]), role: "host" },
								{ port: Number(match[2]), role: "container" },
							]
						: [{ port: Number(match[1]), role: "declared" }];
				for (const entry of entries) {
					if (!Number.isInteger(entry.port) || entry.port < 1 || entry.port > 65535) continue;
					hits.push({
						project: project.name,
						projectPath: project.path,
						port: entry.port,
						role: entry.role,
						kind: pattern.kind,
						scope: classifyEvidence(file.relative, line, pattern.kind),
						file: file.relative.replace(/\\/g, "/"),
						line: index + 1,
						text: line.trim().slice(0, 220),
					});
				}
			}
		}
	}
	return hits;
}

async function scanExplicitPorts(project) {
	const files = await walkProjectFiles(project.path);
	const hits = [];
	for (const file of files) {
		const text = await readTextIfSource(file);
		if (text === null) continue;
		hits.push(...extractHits(project, file, text));
	}

	const seen = new Set();
	return hits.filter((hit) => {
		const key = `${hit.port}|${hit.role}|${hit.kind}|${hit.scope}|${hit.file}|${hit.line}|${hit.text}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function commandHasExplicitPort(command) {
	return /--port(?:=|\s+)(?:\d+|\$\{[^}]*:-\d+\})/.test(command);
}

async function readPackageScripts(projectPath) {
	const files = await walkProjectFiles(projectPath);
	const scripts = [];
	for (const file of files.filter((entry) => path.basename(entry.relative) === "package.json")) {
		const text = await readTextIfSource(file);
		if (text === null) continue;
		try {
			const packageJson = JSON.parse(text);
			for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
				if (typeof command === "string") scripts.push({ file: file.relative.replace(/\\/g, "/"), name, command });
			}
		} catch {
			// Ignore invalid package fixtures.
		}
	}
	return scripts;
}

function inferDefaultPorts(project, scripts, explicitHits) {
	const inferred = [];
	const explicitLocalPorts = new Set(explicitHits.filter((hit) => hit.scope === "local/dev").map((hit) => hit.port));
	const hasWranglerConfigPort = explicitHits.some(
		(hit) => hit.scope === "local/dev" && hit.kind === "key" && hit.file.toLowerCase().includes("wrangler"),
	);

	function add(port, reason, script) {
		if (explicitLocalPorts.has(port)) return;
		inferred.push({
			project: project.name,
			projectPath: project.path,
			port,
			reason,
			scope: "inferred/default",
			file: script.file,
			script: script.name,
			command: script.command,
		});
	}

	for (const script of scripts) {
		const command = script.command.toLowerCase();
		const scriptName = script.name.toLowerCase();
		const relevant =
			["dev", "start", "web", "storybook"].includes(scriptName) ||
			scriptName.startsWith("dev") ||
			scriptName.startsWith("start");
		if (!relevant) continue;
		if (command.includes("astro dev") && !commandHasExplicitPort(script.command)) add(4321, "Astro dev default", script);
		if (
			/(^|\s)(bunx\s+--bun\s+)?vite(\s|$)/.test(command) &&
			!command.includes("build") &&
			!command.includes("preview") &&
			!commandHasExplicitPort(script.command)
		) {
			add(5173, "Vite dev default", script);
		}
		if (command.includes("react-router dev") && !commandHasExplicitPort(script.command)) {
			add(5173, "React Router/Vite dev default", script);
		}
		if (command.includes("wrangler dev") && !commandHasExplicitPort(script.command) && !hasWranglerConfigPort) {
			add(8787, "Wrangler dev default", script);
		}
		if (command.includes("expo start") && !commandHasExplicitPort(script.command)) add(8081, "Expo/Metro default", script);
		if (command.includes("next dev") && !commandHasExplicitPort(script.command)) add(3000, "Next dev default", script);
	}

	const seen = new Set();
	return inferred.filter((hit) => {
		const key = `${hit.port}|${hit.reason}|${hit.file}|${hit.script}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function compactProject(project, explicitHits, inferredHits) {
	const localPorts = new Map();
	const containerPorts = new Map();

	function add(map, hit) {
		if (!map.has(hit.port)) {
			map.set(hit.port, { port: hit.port, evidence: [] });
		}
		if (map.get(hit.port).evidence.length < 5) map.get(hit.port).evidence.push(hit);
	}

	for (const hit of explicitHits) {
		if (hit.scope === "local/dev") add(localPorts, hit);
		if (hit.scope === "container/k8s") add(containerPorts, hit);
	}

	return {
		name: project.name,
		path: project.path,
		localPorts: [...localPorts.values()].sort((a, b) => a.port - b.port),
		inferredPorts: inferredHits.sort((a, b) => a.port - b.port),
		containerPorts: [...containerPorts.values()].sort((a, b) => a.port - b.port),
	};
}

function buildCollisions(projects) {
	const usage = new Map();
	for (const project of projects) {
		for (const entry of project.localPorts) {
			if (!usage.has(entry.port)) usage.set(entry.port, new Set());
			usage.get(entry.port).add(project.name);
		}
		for (const entry of project.inferredPorts) {
			if (!usage.has(entry.port)) usage.set(entry.port, new Set());
			usage.get(entry.port).add(`${project.name} (inferred)`);
		}
	}
	return [...usage.entries()]
		.filter(([, projectsForPort]) => projectsForPort.size > 1)
		.map(([port, projectsForPort]) => ({
			port,
			projects: [...projectsForPort].sort((a, b) => a.localeCompare(b)),
		}))
		.sort((a, b) => a.port - b.port);
}

async function scanProjects(args = {}) {
	const roots = Array.isArray(args.roots) && args.roots.length ? args.roots.map(String) : DEFAULT_ROOTS;
	const write = args.write !== false;
	const projects = await listTopLevelProjects(roots);
	const scannedProjects = [];
	let explicitHitCount = 0;
	let inferredHitCount = 0;

	for (const project of projects) {
		const explicitHits = await scanExplicitPorts(project);
		const scripts = await readPackageScripts(project.path);
		const inferredHits = inferDefaultPorts(project, scripts, explicitHits);
		explicitHitCount += explicitHits.length;
		inferredHitCount += inferredHits.length;
		const compact = compactProject(project, explicitHits, inferredHits);
		if (compact.localPorts.length || compact.inferredPorts.length || compact.containerPorts.length) {
			scannedProjects.push(compact);
		}
	}

	const detected = {
		updatedAt: now(),
		roots,
		projectCount: projects.length,
		projectsWithPorts: scannedProjects.length,
		explicitHitCount,
		inferredHitCount,
		projects: scannedProjects,
		collisions: buildCollisions(scannedProjects),
	};

	if (write) {
		const registry = await loadRegistry();
		registry.detected = detected;
		await saveRegistry(registry);
	}

	return {
		registryPath: registryPath(),
		wroteRegistry: write,
		...detected,
	};
}

function activeReservations(registry) {
	return registry.reservations.filter((reservation) => reservation.status !== "released");
}

function registryPorts(registry) {
	const ports = new Set();
	for (const reservation of activeReservations(registry)) ports.add(reservation.port);
	for (const project of registry.detected.projects ?? []) {
		for (const entry of project.localPorts ?? []) ports.add(entry.port);
		for (const entry of project.inferredPorts ?? []) ports.add(entry.port);
	}
	return ports;
}

async function checkListening(port, host = "127.0.0.1", timeoutMs = 400) {
	return await new Promise((resolve) => {
		const socket = net.createConnection({ host, port });
		let settled = false;
		const finish = (listening, error = null) => {
			if (settled) return;
			settled = true;
			socket.destroy();
			resolve({ host, port, listening, error });
		};
		socket.setTimeout(timeoutMs);
		socket.once("connect", () => finish(true));
		socket.once("timeout", () => finish(false, "timeout"));
		socket.once("error", (error) => finish(false, error.code ?? error.message));
	});
}

async function checkPort(args) {
	const port = assertPort(args.port);
	const host = typeof args.host === "string" && args.host.length ? args.host : "127.0.0.1";
	const registry = await loadRegistry();
	const listening = await checkListening(port, host, Number(args.timeoutMs ?? 400));
	const reservations = activeReservations(registry).filter((reservation) => reservation.port === port);
	const detected = [];
	for (const project of registry.detected.projects ?? []) {
		for (const entry of project.localPorts ?? []) {
			if (entry.port === port) detected.push({ project: project.name, type: "local/dev", evidence: entry.evidence?.[0] });
		}
		for (const entry of project.inferredPorts ?? []) {
			if (entry.port === port) detected.push({ project: project.name, type: "inferred/default", evidence: entry });
		}
	}
	return {
		registryPath: registryPath(),
		port,
		host,
		listening,
		reservations,
		detected,
		available: !listening.listening && reservations.length === 0 && detected.length === 0,
	};
}

async function suggestPorts(args = {}) {
	const registry = await loadRegistry();
	const start = assertPort(args.rangeStart ?? DEFAULT_RANGE.start, "rangeStart");
	const end = assertPort(args.rangeEnd ?? DEFAULT_RANGE.end, "rangeEnd");
	if (end < start) throw new Error("rangeEnd must be greater than or equal to rangeStart");
	const count = Math.max(1, Math.min(100, Number(args.count ?? 1)));
	const host = typeof args.host === "string" && args.host.length ? args.host : "127.0.0.1";
	const avoid = new Set((Array.isArray(args.avoid) ? args.avoid : []).map((port) => assertPort(port, "avoid port")));
	const used = registryPorts(registry);
	for (const port of avoid) used.add(port);

	const suggestions = [];
	for (let port = start; port <= end && suggestions.length < count; port += 1) {
		if (used.has(port)) continue;
		const listening = args.checkListening === false ? { host, port, listening: false, skipped: true } : await checkListening(port, host);
		if (listening.listening) continue;
		suggestions.push({ port, host, listening });
	}

	return {
		registryPath: registryPath(),
		range: { start, end },
		count,
		suggestions,
		exhausted: suggestions.length < count,
	};
}

async function reservePort(args) {
	const project = assertString(args.project, "project");
	const registry = await loadRegistry();
	const port = args.port === undefined ? (await suggestPorts({ ...args, count: 1 })).suggestions[0]?.port : assertPort(args.port);
	if (!port) throw new Error("no free port found in the requested range");

	const existing = activeReservations(registry).find(
		(reservation) =>
			reservation.port === port &&
			reservation.project === project &&
			(args.service === undefined || reservation.service === args.service),
	);
	if (existing) {
		return { registryPath: registryPath(), reservation: existing, alreadyReserved: true };
	}

	const check = await checkPort({ port, host: args.host });
	if (check.listening.listening && args.allowListening !== true) {
		throw new Error(`port ${port} is currently listening on ${check.listening.host}`);
	}
	if (check.reservations.length && args.allowCollision !== true) {
		throw new Error(`port ${port} is already reserved; pass allowCollision to record an intentional overlap`);
	}

	const timestamp = now();
	const reservation = {
		project,
		service: typeof args.service === "string" && args.service.length ? args.service : "default",
		port,
		protocol: typeof args.protocol === "string" && args.protocol.length ? args.protocol : "tcp",
		scope: typeof args.scope === "string" && args.scope.length ? args.scope : "local/dev",
		notes: typeof args.notes === "string" ? args.notes : "",
		status: "active",
		createdAt: timestamp,
		updatedAt: timestamp,
	};
	registry.reservations.push(reservation);
	await saveRegistry(registry);
	return { registryPath: registryPath(), reservation, alreadyReserved: false };
}

async function releasePort(args) {
	const project = assertString(args.project, "project");
	const port = assertPort(args.port);
	const registry = await loadRegistry();
	const matches = activeReservations(registry).filter(
		(reservation) =>
			reservation.project === project &&
			reservation.port === port &&
			(args.service === undefined || reservation.service === args.service),
	);
	for (const reservation of matches) {
		reservation.status = "released";
		reservation.updatedAt = now();
	}
	if (matches.length) await saveRegistry(registry);
	return { registryPath: registryPath(), released: matches.length, reservations: matches };
}

async function listPorts(args = {}) {
	const registry = await loadRegistry();
	const projectFilter = typeof args.project === "string" && args.project.length ? args.project : null;
	const projects = (registry.detected.projects ?? []).filter((project) => !projectFilter || project.name === projectFilter);
	const reservations = activeReservations(registry).filter(
		(reservation) => !projectFilter || reservation.project === projectFilter,
	);
	return {
		registryPath: registryPath(),
		updatedAt: registry.updatedAt,
		detectedUpdatedAt: registry.detected.updatedAt,
		reservations,
		projects,
		collisions: registry.detected.collisions ?? [],
	};
}

async function registryInfo() {
	const registry = await loadRegistry();
	return {
		registryPath: registryPath(),
		exists: existsSync(registryPath()),
		updatedAt: registry.updatedAt,
		reservationCount: activeReservations(registry).length,
		detectedUpdatedAt: registry.detected.updatedAt,
		detectedProjectCount: registry.detected.projects?.length ?? 0,
		collisionCount: registry.detected.collisions?.length ?? 0,
		defaultRoots: DEFAULT_ROOTS,
		defaultRange: DEFAULT_RANGE,
	};
}

const TOOLS = [
	{
		name: "registry_info",
		description: "Return the user-scoped developer port registry path and summary counts.",
		inputSchema: { type: "object", additionalProperties: false, properties: {} },
		run: registryInfo,
	},
	{
		name: "scan_projects",
		description: "Scan project roots for explicit and inferred local ports, update the user registry by default, and return collisions.",
		inputSchema: {
			type: "object",
			additionalProperties: false,
			properties: {
				roots: { type: "array", items: { type: "string" }, description: "Top-level roots containing project directories." },
				write: { type: "boolean", description: "Write scan results into the user registry. Defaults to true." },
			},
		},
		run: scanProjects,
	},
	{
		name: "list_ports",
		description: "List active reservations, detected project ports, and current collision candidates from the registry.",
		inputSchema: {
			type: "object",
			additionalProperties: false,
			properties: {
				project: { type: "string", description: "Optional project name filter." },
			},
		},
		run: listPorts,
	},
	{
		name: "check_port",
		description: "Check whether a port is listening locally and whether it is already reserved or detected in the registry.",
		inputSchema: {
			type: "object",
			additionalProperties: false,
			required: ["port"],
			properties: {
				port: { type: "integer", minimum: 1, maximum: 65535 },
				host: { type: "string", default: "127.0.0.1" },
				timeoutMs: { type: "integer", minimum: 50, maximum: 5000 },
			},
		},
		run: checkPort,
	},
	{
		name: "suggest_ports",
		description: "Suggest free ports from the registry-aware range, optionally checking live listeners.",
		inputSchema: {
			type: "object",
			additionalProperties: false,
			properties: {
				count: { type: "integer", minimum: 1, maximum: 100, default: 1 },
				rangeStart: { type: "integer", minimum: 1, maximum: 65535, default: DEFAULT_RANGE.start },
				rangeEnd: { type: "integer", minimum: 1, maximum: 65535, default: DEFAULT_RANGE.end },
				host: { type: "string", default: "127.0.0.1" },
				avoid: { type: "array", items: { type: "integer", minimum: 1, maximum: 65535 } },
				checkListening: { type: "boolean", default: true },
			},
		},
		run: suggestPorts,
	},
	{
		name: "reserve_port",
		description: "Reserve a specific or suggested port for a project in the user registry.",
		inputSchema: {
			type: "object",
			additionalProperties: false,
			required: ["project"],
			properties: {
				project: { type: "string" },
				service: { type: "string" },
				port: { type: "integer", minimum: 1, maximum: 65535 },
				rangeStart: { type: "integer", minimum: 1, maximum: 65535, default: DEFAULT_RANGE.start },
				rangeEnd: { type: "integer", minimum: 1, maximum: 65535, default: DEFAULT_RANGE.end },
				host: { type: "string", default: "127.0.0.1" },
				protocol: { type: "string", default: "tcp" },
				scope: { type: "string", default: "local/dev" },
				notes: { type: "string" },
				allowListening: { type: "boolean", default: false },
				allowCollision: { type: "boolean", default: false },
			},
		},
		run: reservePort,
	},
	{
		name: "release_port",
		description: "Mark an active project port reservation as released in the user registry.",
		inputSchema: {
			type: "object",
			additionalProperties: false,
			required: ["project", "port"],
			properties: {
				project: { type: "string" },
				service: { type: "string" },
				port: { type: "integer", minimum: 1, maximum: 65535 },
			},
		},
		run: releasePort,
	},
];

function writeMessage(message) {
	process.stdout.write(`${JSON.stringify(message)}\n`);
}

function toolResult(result) {
	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(result, null, 2),
			},
		],
	};
}

async function handleRequest(message) {
	if (message.method === "initialize") {
		return {
			protocolVersion: "2024-11-05",
			capabilities: { tools: {} },
			serverInfo: { name: "developer-ports", version: VERSION },
		};
	}
	if (message.method === "tools/list") {
		return {
			tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
		};
	}
	if (message.method === "tools/call") {
		const tool = TOOLS.find((candidate) => candidate.name === message.params?.name);
		if (!tool) throw new Error(`unknown tool: ${message.params?.name ?? ""}`);
		return toolResult(await tool.run(message.params?.arguments ?? {}));
	}
	if (message.method === "notifications/initialized") {
		return undefined;
	}
	throw new Error(`unsupported method: ${message.method}`);
}

let bufferedInput = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
	bufferedInput += chunk;
	let newlineIndex = bufferedInput.indexOf("\n");
	while (newlineIndex !== -1) {
		const line = bufferedInput.slice(0, newlineIndex).trim();
		bufferedInput = bufferedInput.slice(newlineIndex + 1);
		if (line) {
			void processLine(line);
		}
		newlineIndex = bufferedInput.indexOf("\n");
	}
});

async function processLine(line) {
	let message;
	try {
		message = JSON.parse(line);
	} catch (error) {
		console.error(`Invalid JSON-RPC message: ${error instanceof Error ? error.message : String(error)}`);
		return;
	}

	if (!message.id && message.method?.startsWith("notifications/")) {
		return;
	}

	try {
		const result = await handleRequest(message);
		if (message.id !== undefined && result !== undefined) {
			writeMessage({ jsonrpc: "2.0", id: message.id, result });
		}
	} catch (error) {
		if (message.id !== undefined) {
			writeMessage({
				jsonrpc: "2.0",
				id: message.id,
				error: {
					code: -32000,
					message: error instanceof Error ? error.message : String(error),
				},
			});
		} else {
			console.error(error instanceof Error ? error.message : String(error));
		}
	}
}
