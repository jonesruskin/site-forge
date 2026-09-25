import { render } from "@react-email/render";
import { createElement, type ComponentType } from "react";

import { emailTemplates } from "@/generated/email-templates";
import { outboxEnabled } from "@/lib/email/send";
import { templateName } from "@/lib/transactional/templates";

export const dynamic = "force-dynamic";

/** Renders one template as HTML for the gallery iframes. */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!outboxEnabled) return new Response("Not found", { status: 404 });
  const { name } = await params;
  const template = emailTemplates.find((candidate) => templateName(candidate) === name);
  if (!template) return new Response("Not found", { status: 404 });
  const element = createElement(template as unknown as ComponentType<object>, (template.PreviewProps ?? {}) as object);
  return new Response(await render(element), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
