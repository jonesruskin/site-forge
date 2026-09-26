import path from "node:path";

import type { Theme } from "../registry/registry";
import type { FontSpec } from "../schema/manifest";
import { writeText } from "../utils/fs";

type Role = "body" | "display" | "mono";

const GEIST: Record<Role, { import: string; from: string; variable: string } | null> = {
  body: { import: "GeistSans", from: "geist/font/sans", variable: "--font-geist-sans" },
  display: null,
  mono: { import: "GeistMono", from: "geist/font/mono", variable: "--font-geist-mono" },
};

function importName(family: string) {
  return family.replace(/[^A-Za-z0-9]+/g, "_");
}

/**
 * Generates src/lib/fonts.ts for a theme. Roles without a font keep Geist, so
 * the variables referenced by the theme's CSS always exist.
 */
export function generateFontsFile(fonts: Theme["fonts"]) {
  const googleImports = new Set<string>();
  const declarations: string[] = [];
  const variables: string[] = [];
  const geistImports: string[] = [];

  (["body", "display", "mono"] as const).forEach((role) => {
    const font: FontSpec | undefined = fonts[role];
    if (font) {
      const name = importName(font.family);
      googleImports.add(name);
      const weight = font.weight ? `, weight: ${JSON.stringify(font.weight)}` : "";
      declarations.push(
        `const ${role} = ${name}({ subsets: ["latin"], variable: "--font-${role}-face", display: "swap"${weight} });`,
      );
      variables.push(`${role}.variable`);
    } else if (GEIST[role]) {
      const geist = GEIST[role]!;
      geistImports.push(`import { ${geist.import} } from "${geist.from}";`);
      variables.push(`${geist.import}.variable`);
    }
  });

  const imports = [
    ...geistImports,
    ...(googleImports.size
      ? [`import { ${[...googleImports].sort().join(", ")} } from "next/font/google";`]
      : []),
  ].sort();

  return `${imports.join("\n")}

/**
 * Fonts are self-hosted by next/font (no layout shift, no runtime requests).
 * Each exposes a CSS variable that theme.css maps onto a typeface role:
 * --typeface-body / --typeface-display / --typeface-mono. See docs/theming.md.
 */
${declarations.join("\n")}${declarations.length ? "\n\n" : ""}export const fontVariables = [${variables.join(", ")}].join(" ");
`;
}

export async function applyTheme(projectDir: string, theme: Theme) {
  await writeText(path.join(projectDir, "src/styles/theme.css"), theme.css);
  await writeText(path.join(projectDir, "src/lib/fonts.ts"), generateFontsFile(theme.fonts));
}
