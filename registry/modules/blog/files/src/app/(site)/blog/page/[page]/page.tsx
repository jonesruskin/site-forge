import { notFound, redirect } from "next/navigation";

import { PostIndex } from "@/components/blog/post-index";
import { blogConfig } from "@/lib/blog/config";
import { posts, postsPage } from "@/lib/blog/posts";
import { createMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  const count = Math.ceil((await posts.all()).length / blogConfig.postsPerPage);
  // Page 1 lives at /blog; Next needs at least one param, so an unused "2" keeps the route valid.
  return Array.from({ length: Math.max(1, count - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return createMetadata({
    title: `${blogConfig.title} · Page ${page}`,
    path: `/blog/page/${page}`,
  });
}

export default async function BlogPage({ params }: { params: Promise<{ page: string }> }) {
  const page = Number((await params).page);
  if (page === 1) redirect("/blog");
  const result = await postsPage(page);
  if (!Number.isInteger(page) || page < 1 || page > result.pageCount) notFound();
  return <PostIndex title={blogConfig.title} description={blogConfig.description} {...result} />;
}
