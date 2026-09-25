import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

/**
 * Fonts are self-hosted by next/font (no layout shift, no runtime requests).
 * Each font exposes a CSS variable that theme.css maps onto a typeface role:
 *   --typeface-body / --typeface-display / --typeface-mono
 *
 * To change fonts, swap these imports (e.g. `next/font/google`) and point the
 * roles in theme.css at the new variables. See docs/theming.md.
 */
export const fontVariables = [GeistSans.variable, GeistMono.variable].join(" ");
