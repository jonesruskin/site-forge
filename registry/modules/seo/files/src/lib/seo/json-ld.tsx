import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

/** A schema.org node. See https://schema.org for types and properties. */
export type JsonLdNode = { "@type": string } & Record<string, unknown>;

/** Renders structured data. Escapes `<` so content can't break out of the script tag. */
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const graph = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd(extra: Record<string, unknown> = {}): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    ...(siteConfig.socials.length > 0 && { sameAs: siteConfig.socials.map((s) => s.href) }),
    ...extra,
  };
}

export function websiteJsonLd(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: siteConfig.locale,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function personJsonLd(person: {
  name: string;
  url?: string;
  jobTitle?: string;
  image?: string;
}): JsonLdNode {
  return {
    "@type": "Person",
    name: person.name,
    ...(person.url && { url: person.url }),
    ...(person.jobTitle && { jobTitle: person.jobTitle }),
    ...(person.image && { image: absoluteUrl(person.image) }),
    ...(siteConfig.socials.length > 0 && { sameAs: siteConfig.socials.map((s) => s.href) }),
  };
}

export function articleJsonLd(article: {
  title: string;
  description?: string;
  path: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  authors?: string[];
}): JsonLdNode {
  return {
    "@type": "BlogPosting",
    headline: article.title,
    ...(article.description && { description: article.description }),
    url: absoluteUrl(article.path),
    mainEntityOfPage: absoluteUrl(article.path),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    ...(article.image && { image: absoluteUrl(article.image) }),
    author: (article.authors?.length ? article.authors : [siteConfig.author.name]).map((name) => ({
      "@type": "Person",
      name,
    })),
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function productJsonLd(product: {
  name: string;
  description?: string;
  image?: string;
  path: string;
  price: number;
  currency: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
}): JsonLdNode {
  return {
    "@type": "Product",
    name: product.name,
    ...(product.description && { description: product.description }),
    ...(product.image && { image: absoluteUrl(product.image) }),
    url: absoluteUrl(product.path),
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: product.currency.toUpperCase(),
      availability: `https://schema.org/${product.availability ?? "InStock"}`,
      url: absoluteUrl(product.path),
    },
  };
}

export function softwareApplicationJsonLd(app: {
  name?: string;
  category?: string;
  price?: number;
  currency?: string;
}): JsonLdNode {
  return {
    "@type": "SoftwareApplication",
    name: app.name ?? siteConfig.name,
    applicationCategory: app.category ?? "BusinessApplication",
    operatingSystem: "Web",
    url: siteConfig.url,
    ...(app.price !== undefined && {
      offers: {
        "@type": "Offer",
        price: app.price.toFixed(2),
        priceCurrency: (app.currency ?? "USD").toUpperCase(),
      },
    }),
  };
}
