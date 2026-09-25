import type { ReactNode } from "react";

/** Any React Email template; PreviewProps provides sample data for the gallery. */
export type EmailTemplate = ((props: never) => ReactNode) & { PreviewProps?: unknown };

export function templateName(template: EmailTemplate) {
  return (template as { name?: string }).name || "Template";
}

/** "TeamInviteEmail" → "Team invite". */
export function templateTitle(template: EmailTemplate) {
  return templateName(template)
    .replace(/Email$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/ (\w)/g, (_, c: string) => ` ${c.toLowerCase()}`);
}
