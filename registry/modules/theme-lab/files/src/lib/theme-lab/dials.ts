/** Every dial in theme.css, with the ranges the lab offers. */
export const DIALS = [
  {
    name: "hue",
    label: "Hue",
    min: 0,
    max: 360,
    step: 1,
    unit: "",
    help: "The hue every surface leans toward.",
  },
  {
    name: "tint",
    label: "Tint",
    min: 0,
    max: 0.04,
    step: 0.001,
    unit: "",
    help: "How much neutrals pick up the hue.",
  },
  {
    name: "accent",
    label: "Accent chroma",
    min: 0,
    max: 0.3,
    step: 0.005,
    unit: "",
    help: "0 is monochrome ink.",
  },
  {
    name: "accent-hue",
    label: "Accent hue",
    min: 0,
    max: 360,
    step: 1,
    unit: "",
    help: "Primary color hue.",
  },
  {
    name: "accent-lightness",
    label: "Accent lightness",
    min: 0.15,
    max: 0.8,
    step: 0.01,
    unit: "",
    help: "Inky to bright.",
  },
  {
    name: "radius",
    label: "Radius",
    min: 0,
    max: 1.5,
    step: 0.05,
    unit: "rem",
    help: "Every rounded-* derives from it.",
  },
  {
    name: "density",
    label: "Density",
    min: 0.8,
    max: 1.25,
    step: 0.01,
    unit: "",
    help: "Scales all spacing.",
  },
  {
    name: "shadow",
    label: "Shadow",
    min: 0,
    max: 2.5,
    step: 0.05,
    unit: "",
    help: "Flat to dramatic.",
  },
  {
    name: "motion",
    label: "Motion",
    min: 0,
    max: 2,
    step: 0.05,
    unit: "",
    help: "Transition speed multiplier.",
  },
  {
    name: "type-scale",
    label: "Type scale",
    min: 0.8,
    max: 1.3,
    step: 0.01,
    unit: "",
    help: "Display and heading sizes.",
  },
  {
    name: "measure",
    label: "Measure",
    min: 52,
    max: 96,
    step: 1,
    unit: "rem",
    help: "Max content width.",
  },
] as const;

export type DialName = (typeof DIALS)[number]["name"];
/** Values as written in CSS. `accent-hue` may be "var(--dial-hue)" (follows hue). */
export type DialValues = Record<DialName, string>;

export const FOLLOW_HUE = "var(--dial-hue)";

/** Reads `--dial-*: value;` pairs from theme.css text. */
export function parseDials(css: string): DialValues {
  const values = {} as DialValues;
  for (const dial of DIALS) {
    const match = new RegExp(`--dial-${dial.name}:\\s*([^;]+);`).exec(css);
    values[dial.name] = match?.[1]?.trim() ?? String(dial.min);
  }
  return values;
}

/** Replaces dial values in theme.css text, keeping comments and formatting. */
export function writeDials(css: string, values: Partial<DialValues>) {
  let next = css;
  for (const [name, value] of Object.entries(values)) {
    next = next.replace(new RegExp(`(--dial-${name}:\\s*)([^;]+)(;)`), `$1${value}$3`);
  }
  return next;
}

export function numeric(value: string) {
  return Number.parseFloat(value);
}
