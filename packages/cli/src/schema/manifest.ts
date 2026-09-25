import { z } from "zod";

/*
 * Schemas for everything in the registry. They are the contract between the
 * registry and the CLI: `scripts/validate-registry.ts` checks every manifest
 * against them, and `registry/schema/*.json` is generated from them for editor
 * autocomplete.
 */

const name = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "must be kebab-case (a-z, 0-9, -)")
  .describe("Unique kebab-case identifier.");

const semver = z.string().regex(/^\d+\.\d+\.\d+$/, "must be a semver version like 1.0.0");

const relativePath = z
  .string()
  .min(1)
  .refine(
    (p) => !p.startsWith("/") && !p.split("/").includes(".."),
    "must be a relative path inside the project",
  );

/** `"src/x.ts"` is shorthand for `{ from: "src/x.ts", to: "src/x.ts" }`. */
export const fileEntrySchema = z
  .union([relativePath, z.object({ from: relativePath, to: relativePath })])
  .transform((entry) => (typeof entry === "string" ? { from: entry, to: entry } : entry));

export type FileEntry = z.output<typeof fileEntrySchema>;

const dependencyMap = z.record(z.string(), z.string()).default({});

export const envVarSchema = z.object({
  name: z.string().regex(/^[A-Z][A-Z0-9_]*$/, "must be SCREAMING_SNAKE_CASE"),
  description: z.string().min(1),
  /** Required in production. Modules must work (degraded) in development without it. */
  required: z.boolean().default(false),
  scope: z.enum(["server", "client", "shared"]).default("server"),
  /** Value written to .env.example. Never a real secret. */
  example: z.string().default(""),
  /** How to obtain a value, e.g. a dashboard URL or a command. */
  howTo: z.string().optional(),
});

export type EnvVar = z.output<typeof envVarSchema>;

export const slotDefinitionSchema = z.object({
  /** Generated file, relative to the project root. */
  file: relativePath,
  /** Name of the exported array. */
  export: z.string().regex(/^[a-zA-Z_$][\w$]*$/),
  /** TypeScript element type of the array. */
  type: z.string().min(1),
  /** Import lines needed by `type`. */
  typeImports: z.array(z.string()).default([]),
  description: z.string().min(1),
  /**
   * Emit `[...] as const satisfies readonly Type[]` instead of annotating the
   * array, so each contribution keeps its precise type (typed plugin APIs).
   */
  inferred: z.boolean().default(false),
});

export type SlotDefinition = z.output<typeof slotDefinitionSchema>;

export const slotContributionSchema = z.object({
  slot: name,
  /** Named export to import from `from`. */
  import: z.string().regex(/^[a-zA-Z_$][\w$]*$/),
  from: relativePath,
  /** Lower runs first. Defaults to 100. */
  order: z.number().int().default(100),
});

export type SlotContribution = z.output<typeof slotContributionSchema>;

const navLocation = z.enum(["header", "footer", "legal", "dashboard", "settings", "admin"]);

export const navEntrySchema = z.object({
  location: navLocation,
  /** Footer column title (footer only). */
  group: z.string().optional(),
  label: z.string().min(1),
  href: z.string().min(1),
  icon: z.string().optional(),
});

export type NavEntry = z.output<typeof navEntrySchema>;

const remotePatternSchema = z.object({
  protocol: z.enum(["http", "https"]).optional(),
  hostname: z.string().min(1),
  pathname: z.string().optional(),
});

export const nextContributionSchema = z
  .object({
    serverExternalPackages: z.array(z.string()).default([]),
    imageRemotePatterns: z.array(remotePatternSchema).default([]),
    /** Extra CSP sources, e.g. { "script-src": ["https://plausible.io"] }. */
    csp: z.record(z.string(), z.array(z.string())).default({}),
  })
  .prefault({});

export const categorySchema = z.enum([
  "seo-ops",
  "content",
  "marketing",
  "saas",
  "portfolio",
  "commerce",
  "infrastructure",
  "developer",
]);

export const moduleManifestSchema = z.object({
  $schema: z.string().optional(),
  name,
  version: semver,
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  category: categorySchema,
  /** Modules this one imports from. The ONLY modules it may import from. */
  requires: z.array(name).default([]),
  conflicts: z.array(name).default([]),
  /** UI primitives (registry/ui) the module's components use. */
  ui: z.array(name).default([]),
  /** Sections (registry/sections) the module's pages render. */
  sections: z.array(name).default([]),
  files: z.array(fileEntrySchema).min(1),
  dependencies: dependencyMap,
  devDependencies: dependencyMap,
  env: z.array(envVarSchema).default([]),
  /** Zod env fragment exporting `<camelName>Env`. Required when `env` is non-empty. */
  envFile: relativePath.optional(),
  /** Drizzle schema files (relative imports only). Aggregated into src/generated/db-schema.ts. */
  dbSchema: z.array(relativePath).default([]),
  /** Slots this module owns; other modules can contribute to them. */
  slots: z.record(name, slotDefinitionSchema).default({}),
  contributes: z
    .object({
      slots: z.array(slotContributionSchema).default([]),
      next: nextContributionSchema,
      nav: z.array(navEntrySchema).default([]),
      /** Top-level site.config.ts blocks, added when missing. */
      siteConfig: z.record(z.string(), z.unknown()).default({}),
      /** Static feature switches added to site.config.ts `features`. */
      features: z.record(z.string(), z.boolean()).default({}),
      scripts: z.record(z.string(), z.string()).default({}),
      gitignore: z.array(z.string()).default([]),
      /** Dependencies whose install scripts pnpm must be allowed to run. */
      allowBuilds: z.array(z.string()).default([]),
    })
    .prefault({}),
  /** Routes this module adds (documentation + `site list`). */
  routes: z.array(z.string()).default([]),
  postInstall: z.array(z.string()).default([]),
});

export type ModuleManifest = z.output<typeof moduleManifestSchema>;

export const uiManifestSchema = z.object({
  $schema: z.string().optional(),
  name,
  version: semver,
  description: z.string().min(1).max(200),
  /** Other primitives this one composes. */
  ui: z.array(name).default([]),
  files: z.array(fileEntrySchema).min(1),
  dependencies: dependencyMap,
});

export type UiManifest = z.output<typeof uiManifestSchema>;

export const sectionManifestSchema = z.object({
  $schema: z.string().optional(),
  name,
  version: semver,
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  group: z.string().min(1),
  ui: z.array(name).default([]),
  /** Other sections this one composes. */
  sections: z.array(name).default([]),
  files: z.array(fileEntrySchema).min(1),
  dependencies: dependencyMap,
});

export type SectionManifest = z.output<typeof sectionManifestSchema>;

export const presetSchema = z.object({
  $schema: z.string().optional(),
  name,
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  modules: z.array(name).default([]),
  sections: z.array(name).default([]),
  ui: z.array(name).default([]),
  theme: name.default("neutral"),
  /** Pages copied from registry/presets/files/<preset>/ (overwrite starter files). */
  files: z.array(fileEntrySchema).default([]),
  /** site.config.ts values (nav, features …) merged on top of module contributions. */
  siteConfig: z.record(z.string(), z.unknown()).default({}),
});

export type Preset = z.output<typeof presetSchema>;

/** A Google font family; weights are needed only for non-variable families. */
const fontSchema = z
  .union([z.string(), z.object({ family: z.string(), weight: z.array(z.string()).optional() })])
  .transform((font) => (typeof font === "string" ? { family: font } : font));

export type FontSpec = z.output<typeof fontSchema>;

export const themeManifestSchema = z.object({
  $schema: z.string().optional(),
  name,
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  /** next/font/google families mapped onto typeface roles. Omit a role to keep Geist. */
  fonts: z
    .object({
      body: fontSchema.optional(),
      display: fontSchema.optional(),
      mono: fontSchema.optional(),
    })
    .default({}),
});

export type ThemeManifest = z.output<typeof themeManifestSchema>;

export const coreManifestSchema = z.object({
  $schema: z.string().optional(),
  version: semver,
  starter: relativePath,
  /** Starter paths never copied into projects. */
  ignore: z.array(z.string()).default([]),
  /** Dependencies whose install scripts pnpm must be allowed to run. */
  allowBuilds: z.array(z.string()).default([]),
  /** Env vars used by the starter itself (src/env/core.ts). */
  env: z.array(envVarSchema).default([]),
  slots: z.record(name, slotDefinitionSchema),
});

export type CoreManifest = z.output<typeof coreManifestSchema>;

/** `.site/manifest.json` inside a generated project. */
export const projectManifestSchema = z.object({
  $schema: z.string().optional(),
  version: z.literal(1),
  registry: z.object({
    /** "github:<owner>/<repo>" or "local". */
    source: z.string(),
    ref: z.string(),
    commit: z.string().nullable(),
    version: z.string(),
  }),
  cli: z.string(),
  /** Snapshot of the starter's slots and env, so generation works offline. */
  core: coreManifestSchema.pick({ version: true, slots: true, env: true, allowBuilds: true }),
  preset: z.string().nullable(),
  theme: z.string(),
  /** Snapshots let `site sync/remove/doctor` work offline. */
  modules: z.record(z.string(), moduleManifestSchema),
  ui: z.record(z.string(), uiManifestSchema),
  sections: z.record(z.string(), sectionManifestSchema),
  /** sha256 of every registry file at install time, to detect local edits. */
  files: z.record(z.string(), z.object({ owner: z.string(), hash: z.string() })),
});

export type ProjectManifest = z.output<typeof projectManifestSchema>;
