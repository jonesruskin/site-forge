/** Minimal color math for WCAG contrast checks on computed OKLCH/RGB colors. */

type Rgb = [number, number, number];

function oklchToLinearRgb(l: number, c: number, hDegrees: number): Rgb {
  const h = (hDegrees * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return [
    clamp(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    clamp(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    clamp(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  ];
}

function srgbToLinear(value: number) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** Parses a computed color string (oklch(), rgb(), color(srgb …)) to linear RGB. */
export function parseColor(input: string): Rgb | null {
  const text = input.trim();
  const numbers = (text.match(/-?[\d.]+(?:e-?\d+)?%?/g) ?? []).map((n) =>
    n.endsWith("%") ? Number.parseFloat(n) / 100 : Number.parseFloat(n),
  );
  if (text.startsWith("oklch(") && numbers.length >= 3) {
    return oklchToLinearRgb(numbers[0]!, numbers[1]!, numbers[2]!);
  }
  if (text.startsWith("rgb") && numbers.length >= 3) {
    return [
      srgbToLinear(numbers[0]! / 255),
      srgbToLinear(numbers[1]! / 255),
      srgbToLinear(numbers[2]! / 255),
    ];
  }
  if (text.startsWith("color(srgb") && numbers.length >= 3) {
    return [srgbToLinear(numbers[0]!), srgbToLinear(numbers[1]!), srgbToLinear(numbers[2]!)];
  }
  return null;
}

function luminance([r, g, b]: Rgb) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string) {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  const [light, dark] = [luminance(fg), luminance(bg)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}
