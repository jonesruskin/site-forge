import { notFound } from "next/navigation";

import { PageHeader } from "@/components/sections/page-header";
import { Prose } from "@/components/ui/prose";
import { Mdx } from "@/lib/mdx/render";
import { createMetadata } from "@/lib/metadata";
import { formatNowDate, nowConfig, nowEntries } from "@/lib/now/now";

type Props = { params: Promise<{ date: string }> };

/** Archived entries only; the newest lives at /now. */
export async function generateStaticParams() {
  return (await nowEntries.all()).slice(1).map((entry) => ({ date: entry.slug }));
}

export async function generateMetadata({ params }: Props) {
  const entry = await nowEntries.get((await params).date);
  if (!entry) return {};
  return createMetadata({
    title: `${nowConfig.title}: ${formatNowDate(entry.data.date)}`,
    description: entry.excerpt,
    path: `/now/${entry.slug}`,
    image: false,
  });
}

export default async function NowArchivePage({ params }: Props) {
  const entry = await nowEntries.get((await params).date);
  if (!entry) notFound();
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: nowConfig.title, href: "/now" },
          { label: formatNowDate(entry.data.date) },
        ]}
        eyebrow="Archive"
        title={formatNowDate(entry.data.date)}
        description={entry.data.location}
      />
      <div className="container-page pb-24">
        <Prose>
          <Mdx source={entry.body} />
        </Prose>
      </div>
    </>
  );
}
