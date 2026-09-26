import { docOgImage } from "@/components/docs/doc-page";
import { ogSize } from "@/lib/seo/og-image";

export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return docOgImage("");
}
