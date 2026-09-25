export function camelCase(value: string) {
  return value.replace(/[-_\s]+(.)?/g, (_, char: string | undefined) =>
    char ? char.toUpperCase() : "",
  );
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCase(value: string) {
  return value.replace(
    /(^|[-_\s])(\w)/g,
    (_, sep: string, char: string) => `${sep ? " " : ""}${char.toUpperCase()}`,
  );
}

/** Levenshtein distance, used for "did you mean" suggestions. */
export function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length]!;
}

export function suggest(value: string, candidates: string[]) {
  const best = candidates
    .map((candidate) => ({ candidate, score: distance(value, candidate) }))
    .filter(({ score }) => score <= Math.max(2, Math.floor(value.length / 3)))
    .sort((a, b) => a.score - b.score)[0];
  return best?.candidate;
}
