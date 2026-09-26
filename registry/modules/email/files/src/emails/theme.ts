/**
 * Raw style values for emails. Email clients can't read CSS variables, so this
 * file mirrors the site's tokens as literal values. Update it when you change
 * theme.css. It is the only place in the email module with literal colors.
 */
export const emailTheme = {
  page: "#f5f5f5",
  surface: "#ffffff",
  foreground: "#171717",
  muted: "#6b6b6b",
  border: "#e5e5e5",
  primary: "#171717",
  primaryForeground: "#fafafa",
  radius: "8px",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji"',
  monoFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
} as const;
