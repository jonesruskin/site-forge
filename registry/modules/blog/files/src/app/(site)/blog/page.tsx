import { PostIndex } from "@/components/blog/post-index";
import { blogConfig } from "@/lib/blog/config";
import { postsPage } from "@/lib/blog/posts";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: blogConfig.title,
  description: blogConfig.description,
  path: "/blog",
});

export default async function BlogIndexPage() {
  const { posts, page, pageCount } = await postsPage(1);
  return (
    <PostIndex
      title={blogConfig.title}
      description={blogConfig.description}
      posts={posts}
      page={page}
      pageCount={pageCount}
    />
  );
}
