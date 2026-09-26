import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Sign-in links for the marketing header. Deliberately static so pages stay
 * cacheable; /sign-in redirects signed-in visitors straight to the app.
 */
export function AuthHeaderActions() {
  return (
    <div className="mr-1 hidden items-center gap-1 sm:flex">
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/sign-up">Get started</Link>
      </Button>
    </div>
  );
}
