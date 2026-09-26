import { Button } from "@/components/ui/button";
import { oauthProviders } from "@/env/auth";
import { socialSignInAction } from "@/lib/auth/actions";

const labels = { google: "Continue with Google", github: "Continue with GitHub" } as const;

/** One form per configured provider: works without JavaScript. Renders nothing if none are set up. */
export function SocialButtons({ next }: { next?: string }) {
  const providers = (Object.keys(oauthProviders) as (keyof typeof oauthProviders)[]).filter(
    (p) => oauthProviders[p],
  );
  if (providers.length === 0) return null;
  return (
    <div className="grid gap-2">
      {providers.map((provider) => (
        <form key={provider} action={socialSignInAction}>
          <input type="hidden" name="provider" value={provider} />
          {next && <input type="hidden" name="next" value={next} />}
          <Button type="submit" variant="outline" className="w-full">
            {labels[provider]}
          </Button>
        </form>
      ))}
    </div>
  );
}

export function hasSocialProviders() {
  return Object.values(oauthProviders).some(Boolean);
}
