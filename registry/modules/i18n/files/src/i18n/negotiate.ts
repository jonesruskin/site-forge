/**
 * Picks the best supported locale for an Accept-Language header:
 * "es-MX,es;q=0.9,en;q=0.8" with ["en", "es"] → "es". Exact tags beat base languages.
 */
export function negotiateLocale(
  header: string | null | undefined,
  locales: string[],
  fallback: string,
) {
  if (!header) return fallback;
  const wanted = header
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((item) => item.tag && item.tag !== "*" && item.q > 0)
    .sort((a, b) => b.q - a.q);

  const lower = locales.map((locale) => locale.toLowerCase());
  for (const { tag } of wanted) {
    const exact = lower.indexOf(tag);
    if (exact !== -1) return locales[exact]!;
    const base = tag.split("-")[0]!;
    const match = lower.findIndex((locale) => locale === base || locale.split("-")[0] === base);
    if (match !== -1) return locales[match]!;
  }
  return fallback;
}
