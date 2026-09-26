import { z } from "zod";

import { Faq } from "@/components/sections/faq";
import { PageHeader } from "@/components/sections/page-header";
import { getFaqGroups } from "@/lib/faq";
import { createMetadata } from "@/lib/metadata";
import { faqJsonLd, JsonLd } from "@/lib/seo/json-ld";
import siteConfig from "@/site.config";

const config = z
  .object({ title: z.string().default("FAQ"), description: z.string().default("") })
  .parse((siteConfig as { faq?: unknown }).faq ?? {});

export const metadata = createMetadata({
  title: config.title,
  description: config.description,
  path: "/faq",
});

function Answer({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-3">
      {text.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

export default async function FaqPage() {
  const groups = await getFaqGroups();
  const all = groups.flatMap((group) => group.items);
  return (
    <>
      <JsonLd
        data={faqJsonLd(all.map((item) => ({ question: item.question, answer: item.answer })))}
      />
      <PageHeader title={config.title} description={config.description} />
      {groups.map((group, index) => (
        <Faq
          key={group.category}
          name={`faq-${index}`}
          layout="split"
          title={groups.length > 1 ? group.category : undefined}
          className="pt-0 sm:pt-0"
          items={group.items.map((item) => ({
            question: item.question,
            answer: <Answer text={item.answer} />,
          }))}
        />
      ))}
    </>
  );
}
