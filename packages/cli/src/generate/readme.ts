import type { ModuleManifest, ProjectManifest } from "../schema/manifest";
import { runScript } from "../utils/package-manager";

const START = "<!-- site-forge:modules:start -->";
const END = "<!-- site-forge:modules:end -->";

export function modulesTable(modules: ModuleManifest[]) {
  if (modules.length === 0) {
    return `${START}\nNo modules yet. Add one with \`pnpm site add <module>\`.\n${END}`;
  }
  const rows = modules.map(
    (m) =>
      `| [\`${m.name}\`](.site/modules/${m.name}.md) | ${m.description} | ${m.routes.map((r) => `\`${r}\``).join(" ")} |`,
  );
  return `${START}\n| Module | What it does | Routes |\n| --- | --- | --- |\n${rows.join("\n")}\n${END}`;
}

export function generateReadme(input: {
  name: string;
  description: string;
  packageManager: string;
  manifest: ProjectManifest;
  modules: ModuleManifest[];
}) {
  const run = runScript(input.packageManager);
  return `# ${input.name}

${input.description}

Created with [site-forge](https://github.com/jonesruskin/site-forge)${input.manifest.preset ? ` (preset: \`${input.manifest.preset}\`)` : ""}. All of the code in this repository is yours to change: nothing is hidden in a package.

## Quick start

\`\`\`sh
${input.packageManager} install
cp .env.example .env.local   # optional in development: modules fall back to local behavior
${run} dev
\`\`\`

| Command | What it does |
| --- | --- |
| \`${run} dev\` | Start the dev server |
| \`${run} build\` | Production build |
| \`${run} typecheck\` | Generate route types and type-check |
| \`${run} lint\` | ESLint |
| \`${run} site doctor\` | Check env vars, dependencies and module requirements |

## Modules

${modulesTable(input.modules)}

## Make it yours

- **Look**: everything visual lives in \`src/styles/theme.css\`. Turn the dials at the top first (hue, tint, accent, radius, density, shadow, motion). With the \`theme-lab\` module, open \`/lab\` in development to tune them live.
- **Content & navigation**: \`site.config.ts\` is the single source of truth for name, URLs, navigation, SEO defaults, feature flags and module settings.
- **Environment**: \`.env.example\` lists every variable with a description. \`${run} site doctor\` tells you what's missing.

## Grow the site

\`\`\`sh
${run} site list              # modules, sections, presets and themes
${run} site add blog newsletter
${run} site add section:pricing
${run} site theme editorial   # or tweak dials: ${run} site theme --hue 25 --accent 0.18
${run} site diff blog         # compare your copy with the registry
${run} site remove newsletter
\`\`\`
`;
}

/** Replaces the modules table in an existing README, if the markers are still there. */
export function updateReadme(readme: string, modules: ModuleManifest[]) {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start === -1 || end === -1) return readme;
  return `${readme.slice(0, start)}${modulesTable(modules)}${readme.slice(end + END.length)}`;
}
