import { DocPage, docMetadata } from "@/components/docs/doc-page";
import { docParams } from "@/lib/docs/docs";

export const dynamicParams = false;
export const generateStaticParams = () => docParams(1);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return docMetadata((await params).slug);
}

export default async function DocsTopLevelPage({ params }: Props) {
  return <DocPage slug={(await params).slug} />;
}
