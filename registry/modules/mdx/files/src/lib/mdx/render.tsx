import { MDXRemote, type MDXComponents } from "next-mdx-remote-client/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { createCssVariablesTheme } from "shiki";

import { mdxComponents } from "@/components/mdx/mdx-components";

/** Colors come from CSS variables that CodeBlock maps onto theme tokens. */
const codeTheme = createCssVariablesTheme({
  name: "tokens",
  variablePrefix: "--shiki-",
  fontStyle: true,
});

type MdxProps = {
  source: string;
  /** Extra or overriding components for this document. */
  components?: MDXComponents;
  /** Values available as `{name}` inside the MDX. */
  scope?: Record<string, unknown>;
};

/** Renders MDX on the server. No MDX runtime ships to the browser. */
export function Mdx({ source, components, scope }: MdxProps) {
  return (
    <MDXRemote
      source={source}
      components={{ ...mdxComponents, ...components }}
      options={{
        scope,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              { behavior: "wrap", properties: { className: ["no-underline"] } },
            ],
            [
              rehypePrettyCode,
              { theme: codeTheme, keepBackground: false, defaultLang: "plaintext" },
            ],
          ],
        },
      }}
      onError={({ error }) => {
        throw error;
      }}
    />
  );
}
