import type { Resume } from "@/lib/about/resume";

/**
 * Your résumé as data. It renders on /about and /resume and is published as
 * JSON Resume (https://jsonresume.org) at /resume.json. Replace the examples.
 */
export const resume: Resume = {
  label: "Product designer & engineer",
  location: "Lisbon, Portugal",
  summary:
    "Ten years turning fuzzy problems into shipped products, from first sketch to production code.",
  work: [
    {
      organization: "Example Studio",
      position: "Principal product engineer",
      url: "https://example.com",
      start: "2023-02",
      summary: "Lead a small team building tools for field researchers.",
      highlights: [
        "Shipped an offline-first sync engine used by 40k people",
        "Mentored four engineers",
      ],
    },
    {
      organization: "Sample Co.",
      position: "Product designer",
      start: "2019-06",
      end: "2023-01",
      summary: "Owned design for the core editing experience.",
      highlights: ["Redesigned onboarding: activation up 23%"],
    },
  ],
  education: [
    {
      institution: "Placeholder University",
      area: "Interaction design",
      studyType: "MA",
      end: "2016",
    },
  ],
  skills: [
    { name: "Design", keywords: ["Product strategy", "Prototyping", "Design systems"] },
    { name: "Engineering", keywords: ["TypeScript", "React", "Postgres"] },
  ],
  languages: [
    { language: "English", fluency: "Native" },
    { language: "Portuguese", fluency: "Professional" },
  ],
};
