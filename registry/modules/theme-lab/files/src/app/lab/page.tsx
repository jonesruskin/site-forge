import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ThemeLab } from "@/components/theme-lab/theme-lab";
import { parseDials } from "@/lib/theme-lab/dials";
import siteConfig from "@/site.config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Theme lab", robots: { index: false } };

export default async function LabPage() {
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && !siteConfig.features.themeLab) notFound();

  const css = await readFile(path.join(process.cwd(), "src", "styles", "theme.css"), "utf8").catch(
    () => "",
  );
  return <ThemeLab initial={parseDials(css)} canSave={isDev} />;
}
