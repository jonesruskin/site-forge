/*
 * Pure flag evaluation: no I/O, safe on the edge, easy to unit test.
 * Precedence: personal override → environment override → allow list → rollout → default.
 */

export type FlagDefinition = {
  description?: string;
  /** Value when no rule matches. */
  default: boolean;
  /** Percentage (0–100) of subjects that get the flag, sticky per subject. */
  rollout: number;
  /** User ids or emails that always get the flag. "*@acme.com" matches a domain. */
  allow: string[];
};

export type FlagSubject = {
  /** Stable id: the user id when signed in, else the anonymous visitor id. */
  key?: string;
  email?: string | null;
};

export type FlagReason = "override" | "environment" | "allow-list" | "rollout" | "default";

export type FlagResult = { enabled: boolean; reason: FlagReason };

/** FNV-1a: fast, stable across runtimes, and uniform enough for bucketing. */
function hash(input: string) {
  let value = 0x811c9dc5;
  for (let index = 0; index < input.length; index++) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/** 0–99.99, stable for a flag + subject pair; each flag buckets independently. */
export function bucket(flag: string, subjectKey: string) {
  return (hash(`${flag}:${subjectKey}`) % 10_000) / 100;
}

function allowed(allow: string[], subject: FlagSubject) {
  const email = subject.email?.toLowerCase();
  return allow.some((entry) => {
    const rule = entry.toLowerCase();
    if (rule === subject.key?.toLowerCase()) return true;
    if (!email) return false;
    return rule.startsWith("*@") ? email.endsWith(rule.slice(1)) : rule === email;
  });
}

export function evaluateFlag(
  name: string,
  definition: FlagDefinition,
  subject: FlagSubject,
  overrides: { personal?: Record<string, boolean>; environment?: Record<string, boolean> } = {},
): FlagResult {
  const personal = overrides.personal?.[name];
  if (personal !== undefined) return { enabled: personal, reason: "override" };
  const environment = overrides.environment?.[name];
  if (environment !== undefined) return { enabled: environment, reason: "environment" };
  if (allowed(definition.allow, subject)) return { enabled: true, reason: "allow-list" };
  if (definition.rollout > 0 && subject.key && bucket(name, subject.key) < definition.rollout) {
    return { enabled: true, reason: "rollout" };
  }
  return { enabled: definition.default, reason: "default" };
}

/** Parses "a=on, b=off" into { a: true, b: false }. */
export function parseOverrides(value: string | undefined) {
  const out: Record<string, boolean> = {};
  for (const pair of value?.split(",") ?? []) {
    const [name, raw] = pair.split("=").map((part) => part.trim());
    if (name && raw) out[name] = /^(on|true|1)$/i.test(raw);
  }
  return out;
}
