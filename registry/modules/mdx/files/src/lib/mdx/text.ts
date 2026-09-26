import GithubSlugger from "github-slugger";

export type Heading = { depth: 2 | 3; text: string; id: string };

/** Strips Markdown syntax to plain text (for excerpts and search indexes). */
export function plainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^import .*$|^export .*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~>#|]/g, "")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** First paragraph, trimmed to ~160 characters at a word boundary. */
export function excerpt(markdown: string, length = 160) {
  const paragraph =
    markdown
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .find((block) => block && !/^(#|```|import |export |<|!\[|[-*] |\d+\. |>)/.test(block)) ?? "";
  const text = plainText(paragraph);
  if (text.length <= length) return text;
  return `${text.slice(0, text.lastIndexOf(" ", length))}…`;
}

export function readingMinutes(markdown: string) {
  const words = plainText(markdown).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** h2/h3 headings with the same ids rehype-slug generates. */
export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = plainText(match[2]!);
    headings.push({ depth: match[1]!.length as 2 | 3, text, id: slugger.slug(text) });
  }
  return headings;
}
