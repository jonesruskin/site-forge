import { ImageResponse } from "next/og";

import siteConfig from "@/site.config";

import { ogTheme as t } from "./og-theme";

export const ogSize = { width: 1200, height: 630 };

type OgImageInput = {
  title: string;
  /** Small label above the title, e.g. "Blog" or a date. */
  eyebrow?: string;
  description?: string;
};

/**
 * The shared social card. Use it from any `opengraph-image.tsx`:
 *
 *   export default async function Image({ params }) {
 *     const post = await getPost((await params).slug);
 *     return renderOgImage({ eyebrow: "Blog", title: post.title });
 *   }
 */
export function renderOgImage({ title, eyebrow, description }: OgImageInput) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: t.background,
        color: t.foreground,
        borderBottom: `12px solid ${t.accent}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>
        {siteConfig.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {eyebrow && (
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: t.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 56 : 72,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>
        {description && (
          <div style={{ display: "flex", fontSize: 30, color: t.muted, lineHeight: 1.35 }}>
            {description.length > 140 ? `${description.slice(0, 137)}…` : description}
          </div>
        )}
      </div>
      <div style={{ display: "flex", fontSize: 24, color: t.muted }}>
        {siteConfig.url.replace(/^https?:\/\//, "")}
      </div>
    </div>,
    ogSize,
  );
}
