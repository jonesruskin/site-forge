import siteConfig from "@/site.config";

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/**
 * A self-contained 503 page. It can't rely on the app (that's what's down), so
 * it uses system fonts and the browser's own light/dark colors.
 */
export function maintenancePage({
  title,
  message,
  until,
}: {
  title: string;
  message: string;
  until?: Date;
}) {
  const back = until
    ? `<p class="muted">Expected back by <time datetime="${until.toISOString()}">${until.toUTCString().replace(" GMT", " UTC")}</time>.</p>`
    : "";
  return `<!doctype html>
<html lang="${escape(siteConfig.locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escape(title)} · ${escape(siteConfig.name)}</title>
<style>
  :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
  body { margin: 0; min-height: 100dvh; display: grid; place-items: center; background: Canvas; color: CanvasText; }
  main { max-width: 32rem; padding: 2rem; }
  h1 { font-size: clamp(1.75rem, 5vw, 2.5rem); line-height: 1.1; margin: 0.5rem 0 1rem; letter-spacing: -0.02em; }
  p { line-height: 1.6; margin: 0 0 0.75rem; }
  .muted { opacity: 0.7; font-size: 0.9rem; }
</style>
</head>
<body>
<main>
<p class="muted">${escape(siteConfig.name)}</p>
<h1>${escape(title)}</h1>
<p>${escape(message)}</p>
${back}
</main>
</body>
</html>`;
}
