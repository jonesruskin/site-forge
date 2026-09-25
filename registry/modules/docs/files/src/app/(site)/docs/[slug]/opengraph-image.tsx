import { docOgImage } from "@/components/docs/doc-page";
import { docParams } from "@/lib/docs/docs";
import { ogSize } from "@/lib/seo/og-image";

export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = () => docParams(1);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return docOgImage((await params).slug);
}
