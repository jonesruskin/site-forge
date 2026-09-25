import type { Metadata } from "next";

import siteConfig from "@/site.config";

import { absoluteUrl } from "./url";

type MetadataInput = {
  /** Page title; the site template (`seo.titleTemplate`) is applied automatically. */
  title?: string;
  description?: string;
  /** Path of the page, used for the canonical URL and og:url. */
  path?: string;
  /** Path or absolute URL of a social image. Defaults to `seo.ogImage`. */
  image?: string;
  /** Adds noindex/nofollow — for private, thin or duplicate pages. */
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

/** Root metadata, applied once in the root layout. */
export function rootMetadata(): Metadata {
  const image = siteConfig.seo.ogImage ? absoluteUrl(siteConfig.seo.ogImage) : undefined;
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: siteConfig.name, template: siteConfig.seo.titleTemplate },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    keywords: siteConfig.seo.keywords,
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    creator: siteConfig.author.name,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: siteConfig.url,
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: "summary_large_image",
      ...(siteConfig.seo.twitterHandle && { creator: siteConfig.seo.twitterHandle }),
      ...(image && { images: [image] }),
    },
    alternates: { canonical: "/" },
  };
}

/** Per-page metadata with sensible canonical, Open Graph and Twitter defaults. */
export function createMetadata(input: MetadataInput = {}): Metadata {
  const { title, description = siteConfig.description, path, noIndex, type = "website" } = input;
  const imageSrc = input.image ?? siteConfig.seo.ogImage;
  const images = imageSrc ? [{ url: absoluteUrl(imageSrc) }] : undefined;

  return {
    ...(title && { title }),
    description,
    ...(path && { alternates: { canonical: path } }),
    openGraph: {
      type,
      title: title ?? siteConfig.name,
      description,
      ...(path && { url: absoluteUrl(path) }),
      ...(images && { images }),
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
      ...(input.authors && { authors: input.authors }),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? siteConfig.name,
      description,
      ...(images && { images: images.map((image) => image.url) }),
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}
