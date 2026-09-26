import type { MDXComponents } from "next-mdx-remote-client/rsc";
import Image from "next/image";
import type { ComponentProps } from "react";

import { NavLink } from "@/components/site/nav-link";

import { Callout } from "./callout";
import { CodeBlock } from "./code-block";

function MdxImage({ src, alt = "", width, height, ...props }: ComponentProps<"img">) {
  if (typeof src !== "string") return null;
  // Local images with known dimensions get next/image; everything else stays a plain img.
  if (width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={Number(width)}
        height={Number(height)}
        className="h-auto w-full"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- unknown dimensions in user content
  return <img src={src} alt={alt} loading="lazy" decoding="async" {...props} />;
}

/** Default element mapping for every MDX document. Add site-wide shortcodes here. */
export const mdxComponents: MDXComponents = {
  a: ({ href = "", children, ...props }) => (
    <NavLink href={href} {...props}>
      {children}
    </NavLink>
  ),
  img: MdxImage,
  pre: CodeBlock,
  table: (props) => (
    // Focusable so keyboard users can scroll wide tables.
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Table">
      <table {...props} />
    </div>
  ),
  Callout,
};
