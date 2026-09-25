import * as p from "@clack/prompts";
import pc from "picocolors";

export const log = {
  info: (message: string) => p.log.info(message),
  step: (message: string) => p.log.step(message),
  success: (message: string) => p.log.success(message),
  warn: (message: string) => p.log.warn(message),
  error: (message: string) => p.log.error(message),
  message: (message: string) => p.log.message(message),
};

/** True when prompts can be shown. */
export function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY) && !process.env.CI;
}

export function formatList(items: string[]) {
  return items.map((item) => pc.cyan(item)).join(", ");
}

export { pc };
