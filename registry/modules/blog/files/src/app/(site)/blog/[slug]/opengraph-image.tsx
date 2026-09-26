import { blogConfig } from "@/lib/blog/config";
import { posts } from "@/lib/blog/posts";
import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = posts.params;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = await posts.get((await params).slug);
  return renderOgImage({
    eyebrow: blogConfig.title,
    title: post?.data.title ?? blogConfig.title,
    description: post?.excerpt,
  });
}
