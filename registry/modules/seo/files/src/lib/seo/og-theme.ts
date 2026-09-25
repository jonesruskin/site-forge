/**
 * Raw values for generated Open Graph images. The image renderer (Satori) can't
 * read CSS variables, so mirror your theme.css here. This is the only file in
 * the seo module with literal colors.
 */
export const ogTheme = {
  background: "#fafafa",
  foreground: "#171717",
  muted: "#737373",
  border: "#e5e5e5",
  accent: "#171717",
} as const;
