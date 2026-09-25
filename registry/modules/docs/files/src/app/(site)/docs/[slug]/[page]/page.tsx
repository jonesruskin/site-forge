import { DocPage, docMetadata } from "@/components/docs/doc-page";
import { docParams } from "@/lib/docs/docs";

export const dynamicParams = false;
export const generateStaticParams = () => docParams(2);

/** `slug` is the group (folder), `page` the file inside it. */
type Props = { params: Promise<{ slug: string; page: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, page } = await params;
  return docMetadata(`${slug}/${page}`);
}

export default async function DocsNestedPage({ params }: Props) {
  const { slug, page } = await params;
  return <DocPage slug={`${slug}/${page}`} />;
}
