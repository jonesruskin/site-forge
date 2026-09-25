import type { MetadataRoute } from "next";
import { z } from "zod";

import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

/** "2024", "2024-03" or "2024-03-15". */
type PartialDate = string;

export type ResumeRole = {
  organization: string;
  position: string;
  url?: string;
  location?: string;
  start: PartialDate;
  /** Omit while it's your current role. */
  end?: PartialDate;
  summary?: string;
  highlights?: string[];
};

export type Resume = {
  /** Headline under your name, e.g. "Product designer". */
  label: string;
  location?: string;
  summary?: string;
  work: ResumeRole[];
  education?: {
    institution: string;
    area?: string;
    studyType?: string;
    start?: PartialDate;
    end?: PartialDate;
  }[];
  skills?: { name: string; keywords: string[] }[];
  languages?: { language: string; fluency?: string }[];
  awards?: { title: string; date?: PartialDate; awarder?: string }[];
};

export const aboutConfig = z
  .object({
    title: z.string().default("About"),
    /** Portrait image path; empty for none. */
    portrait: z.string().default(""),
    portraitAlt: z.string().default(""),
  })
  .parse((siteConfig as { about?: unknown }).about ?? {});

const monthFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2024-03" → "Mar 2024", "2024" → "2024". */
export function formatPartialDate(value: PartialDate) {
  return /^\d{4}$/.test(value)
    ? value
    : monthFormat.format(new Date(`${value.slice(0, 7)}-01T00:00:00Z`));
}

export function formatRange(start?: PartialDate, end?: PartialDate) {
  if (!start) return end ? formatPartialDate(end) : "";
  return `${formatPartialDate(start)} – ${end ? formatPartialDate(end) : "Present"}`;
}

/** The résumé in the JSON Resume 1.0 schema (https://jsonresume.org/schema). */
export function toJsonResume(resume: Resume) {
  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: siteConfig.author.name,
      label: resume.label,
      ...(siteConfig.author.email && { email: siteConfig.author.email }),
      url: siteConfig.author.url ?? siteConfig.url,
      summary: resume.summary,
      ...(resume.location && { location: { address: resume.location } }),
      profiles: siteConfig.socials.map((social) => ({
        network: social.platform,
        url: social.href,
      })),
    },
    work: resume.work.map((role) => ({
      name: role.organization,
      position: role.position,
      url: role.url,
      location: role.location,
      startDate: role.start,
      endDate: role.end,
      summary: role.summary,
      highlights: role.highlights ?? [],
    })),
    education: (resume.education ?? []).map((item) => ({
      institution: item.institution,
      area: item.area,
      studyType: item.studyType,
      startDate: item.start,
      endDate: item.end,
    })),
    skills: resume.skills ?? [],
    languages: resume.languages ?? [],
    awards: resume.awards ?? [],
    meta: { canonical: absoluteUrl("/resume.json"), version: "v1.0.0" },
  };
}

export async function aboutSitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/resume"), changeFrequency: "monthly", priority: 0.5 },
  ];
}
