import { docOgImage } from "@/components/docs/doc-page";
import { docParams } from "@/lib/docs/docs";
import { ogSize } from "@/lib/seo/og-image";

export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => docParams(2);

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const { slug, page } = await params;
  return docOgImage(`${slug}/${page}`);
}
