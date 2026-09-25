import { notFound } from "next/navigation";

import { PostIndex } from "@/components/blog/post-index";
import { blogConfig } from "@/lib/blog/config";
import { allTags, posts, tagSlug } from "@/lib/blog/posts";
import { createMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  const tags = await allTags();
  return tags.length ? tags.map((tag) => ({ tag: tag.slug })) : [{ tag: "all" }];
}

async function findTag(slug: string) {
  return (await allTags()).find((tag) => tag.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const tag = await findTag((await params).tag);
  if (!tag) return {};
  return createMetadata({ title: `Posts tagged “${tag.name}”`, path: `/blog/tags/${tag.slug}` });
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const tag = await findTag((await params).tag);
  if (!tag) notFound();
  const tagged = (await posts.all()).filter((post) =>
    post.data.tags.some((t) => tagSlug(t) === tag.slug),
  );
  return (
    <PostIndex title={`${blogConfig.title}: ${tag.name}`} posts={tagged} activeTag={tag.slug} />
  );
}
