import { notFound } from "next/navigation";

import { PageHeader } from "@/components/sections/page-header";
import { Prose } from "@/components/ui/prose";
import { legalPages, legalScope } from "@/lib/legal/pages";
import { Mdx } from "@/lib/mdx/render";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const dynamicParams = false;
export const generateStaticParams = legalPages.params;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const page = await legalPages.get((await params).slug);
  if (!page) return {};
  return createMetadata({
    title: page.data.title,
    description: page.excerpt,
    path: `/legal/${page.slug}`,
  });
}

const dateFormat = new Intl.DateTimeFormat(siteConfig.locale, {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function LegalPage({ params }: Props) {
  const page = await legalPages.get((await params).slug);
  if (!page) notFound();
  return (
    <>
      <PageHeader
        title={page.data.title}
        description={`Last updated ${dateFormat.format(new Date(page.data.updated))}`}
      />
      <div className="container-page pb-24">
        <Prose>
          <Mdx source={page.body} scope={legalScope} />
        </Prose>
      </div>
    </>
  );
}
