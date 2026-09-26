import { z } from "zod";

import siteConfig from "@/site.config";

export const uploadsConfig = z
  .object({
    maxSizeMb: z.number().positive().max(5_000).default(25),
    /** MIME types or wildcards ("image/*"). */
    accept: z
      .array(z.string().regex(/^[\w.+-]+\/(\*|[\w.+-]+)$/))
      .min(1)
      .default(["image/*", "application/pdf"]),
    maxFilesPerUser: z.number().int().positive().default(200),
  })
  .parse((siteConfig as { uploads?: unknown }).uploads ?? {});

export const maxBytes = uploadsConfig.maxSizeMb * 1024 * 1024;

export function isAccepted(contentType: string, accept = uploadsConfig.accept) {
  const type = contentType.toLowerCase();
  return accept.some((pattern) =>
    pattern.endsWith("/*") ? type.startsWith(pattern.slice(0, -1)) : type === pattern.toLowerCase(),
  );
}

/** Types browsers may render inline. Everything else downloads (SVG and HTML can run script). */
export function isInlineSafe(contentType: string) {
  return /^(image\/(png|jpe?g|gif|webp|avif)|application\/pdf|video\/(mp4|webm)|audio\/(mpeg|ogg|wav)|text\/plain)$/i.test(
    contentType,
  );
}
