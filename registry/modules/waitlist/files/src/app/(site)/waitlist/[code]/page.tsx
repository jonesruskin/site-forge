import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CopyLink } from "@/components/waitlist/copy-link";
import { absoluteUrl } from "@/lib/url";
import { waitlistConfig } from "@/lib/waitlist/config";
import { findByCode, positionOf, waitlistSize } from "@/lib/waitlist/waitlist";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your place in line",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ welcome?: string }> };

export default async function WaitlistStatusPage({ params, searchParams }: Props) {
  const { code } = await params;
  const entry = await findByCode(code);
  if (!entry) notFound();
  const [position, total, { welcome }] = await Promise.all([
    positionOf(entry),
    waitlistSize(),
    searchParams,
  ]);
  const shareUrl = absoluteUrl(`/waitlist?ref=${entry.referralCode}`);
  const shareText = encodeURIComponent(`${waitlistConfig.shareText} ${shareUrl}`);

  return (
    <section className="container-page flex min-h-[70dvh] flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="text-eyebrow text-muted-foreground">
        {welcome ? "You're on the list" : "Your place in line"}
      </p>
      <p className="font-display text-7xl font-semibold tracking-tight tabular-nums sm:text-8xl">
        #{position}
      </p>
      <p className="text-muted-foreground">
        of {total.toLocaleString()} {total === 1 ? "person" : "people"}
        {entry.referrals > 0 &&
          ` · ${entry.referrals} ${entry.referrals === 1 ? "friend" : "friends"} invited`}
      </p>
      <div className="mt-6 flex w-full flex-col items-center gap-3">
        <p className="text-sm font-medium">Invite friends to move up</p>
        <CopyLink url={shareUrl} />
        <ul className="text-muted-foreground flex gap-4 text-sm">
          <li>
            <a
              className="hover:text-foreground underline-offset-4 hover:underline"
              href={`https://x.com/intent/post?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share on X
            </a>
          </li>
          <li>
            <a
              className="hover:text-foreground underline-offset-4 hover:underline"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              className="hover:text-foreground underline-offset-4 hover:underline"
              href={`mailto:?subject=${encodeURIComponent(waitlistConfig.title)}&body=${shareText}`}
            >
              Email
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
