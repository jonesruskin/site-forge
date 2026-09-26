import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { createMetadata } from "@/lib/metadata";
import { waitlistConfig } from "@/lib/waitlist/config";

export const metadata = createMetadata({
  title: waitlistConfig.title,
  description: waitlistConfig.description,
  path: "/waitlist",
});

export default function WaitlistPage() {
  return (
    <section className="container-page flex min-h-[70dvh] flex-col items-center justify-center gap-6 py-24 text-center">
      <h1 className="text-display max-w-3xl">{waitlistConfig.title}</h1>
      {waitlistConfig.description && (
        <p className="text-lead text-muted-foreground max-w-xl">{waitlistConfig.description}</p>
      )}
      <WaitlistForm className="mt-4 w-full max-w-md" />
    </section>
  );
}
