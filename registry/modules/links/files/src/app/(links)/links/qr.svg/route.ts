import { linksPageUrl } from "@/lib/links/config";
import { qrSvg } from "@/lib/links/qr";

export const dynamic = "force-static";

/** Print-ready QR code pointing at /links (black on transparent). */
export function GET() {
  return new Response(qrSvg(linksPageUrl(), { title: "Scan to open my links", border: 4 }), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
