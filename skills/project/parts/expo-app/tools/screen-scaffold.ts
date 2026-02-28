const args = Bun.argv.slice(2);

const HELP = `
screen-scaffold — Generate a new Expo Router screen with NativeWind boilerplate

Usage:
  bun run tools/screen-scaffold.ts <route> [options]

Arguments:
  route    Route path, e.g. "(tabs)/settings" or "(auth)/login"

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Creates the screen file in app/<route>.tsx with NativeWind styling
and typed route exports.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function toPascalCase(str: string): string {
  return str
    .split(/[-_/()]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

async function main() {
  const route = filteredArgs[0];
  if (!route) {
    console.error("Error: missing required route argument");
    process.exit(1);
  }

  const root = process.cwd();
  const filePath = `${root}/app/${route}.tsx`;

  // Check if file already exists
  if (await Bun.file(filePath).exists()) {
    console.error(`Error: file already exists at app/${route}.tsx`);
    process.exit(1);
  }

  // Derive component name from route
  const routeParts = route.split("/").filter((p) => !p.startsWith("(") && !p.endsWith(")"));
  const screenName = routeParts.pop() || "screen";
  const componentName = toPascalCase(screenName) + "Screen";

  // Check for dynamic params
  const paramMatches = route.matchAll(/\[([^\]]+)\]/g);
  const params: string[] = [];
  for (const m of paramMatches) {
    params.push(m[1].replace("...", ""));
  }

  let content: string;

  if (params.length > 0) {
    content = `import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ${componentName}() {
  const { ${params.join(", ")} } = useLocalSearchParams<{ ${params.map((p) => `${p}: string`).join("; ")} }>();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">${toPascalCase(screenName)}</Text>
    </View>
  );
}
`;
  } else {
    content = `import { View, Text } from "react-native";

export default function ${componentName}() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">${toPascalCase(screenName)}</Text>
    </View>
  );
}
`;
  }

  await Bun.write(filePath, content);

  const result = {
    file: `app/${route}.tsx`,
    component: componentName,
    params,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Created screen: app/${route}.tsx`);
    console.log(`  component: ${componentName}`);
    if (params.length > 0) {
      console.log(`  params: ${params.join(", ")}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
