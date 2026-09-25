import { JsonLd, organizationJsonLd, websiteJsonLd } from "./json-ld";

/** Organization + WebSite structured data, rendered once per page via the body-end slot. */
export function SiteJsonLd() {
  return <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />;
}
