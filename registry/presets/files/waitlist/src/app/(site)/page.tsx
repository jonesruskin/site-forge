import { BellRingIcon, GiftIcon, UsersIcon } from "lucide-react";

import { Faq } from "@/components/sections/faq";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { getFaqs } from "@/lib/faq";
import siteConfig from "@/site.config";

/*
 * Pre-launch page: one promise, one form. People who join get a referral link
 * that moves them up the list (see /waitlist/<code>). Export sign-ups at
 * /api/waitlist/export with WAITLIST_ADMIN_TOKEN.
 */
export default async function HomePage() {
  const faqs = await getFaqs();

  return (
    <>
      <section className="container-page flex min-h-[70dvh] flex-col items-center justify-center gap-6 py-24 text-center">
        <p className="text-eyebrow text-muted-foreground">Coming soon</p>
        <h1 className="text-display max-w-3xl">{siteConfig.name}</h1>
        <p className="text-lead text-muted-foreground max-w-xl">{siteConfig.description}</p>
        <WaitlistForm className="mt-4 w-full max-w-md" />
        <p className="text-muted-foreground text-sm">
          Early members get in first, and move up by inviting friends.
        </p>
      </section>
      <FeatureGrid
        tone="muted"
        title="Why join early"
        features={[
          {
            icon: <BellRingIcon />,
            title: "First access",
            description: "Invitations go out in the order of the list.",
          },
          {
            icon: <UsersIcon />,
            title: "Skip ahead",
            description: "Each friend who joins with your link moves you up.",
          },
          {
            icon: <GiftIcon />,
            title: "Founding perks",
            description: "Describe what early members get: a discount, a feature, a say.",
          },
        ]}
      />
      {faqs.length > 0 && <Faq title="Questions" items={faqs.slice(0, 5)} />}
    </>
  );
}
