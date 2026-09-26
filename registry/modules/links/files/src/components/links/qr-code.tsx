import { QrCodeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { qrSvg } from "@/lib/links/qr";

/** "Show QR" button: hold your phone up and let someone scan this page. */
export function QrCode({ url }: { url: string }) {
  const svg = qrSvg(url, { title: `QR code for ${url}` });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCodeIcon aria-hidden />
          QR code
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="center">
        <div
          className="bg-background text-foreground rounded-md p-2"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="text-muted-foreground mt-3 text-center text-xs break-all">
          {url.replace(/^https?:\/\//, "")}
        </p>
        <a
          href="/links/qr.svg"
          download="links-qr.svg"
          className="mt-3 block text-center text-sm font-medium underline-offset-4 hover:underline"
        >
          Download SVG
        </a>
      </PopoverContent>
    </Popover>
  );
}
