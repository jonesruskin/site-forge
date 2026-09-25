"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      role="alert"
      className="container-page flex min-h-[60dvh] flex-col items-start justify-center py-24"
    >
      <p className="text-eyebrow text-muted-foreground">500</p>
      <h1 className="mt-3 text-heading">Something went wrong.</h1>
      <p className="mt-4 max-w-prose text-muted-foreground">
        An unexpected error occurred. Try again, and if it keeps happening, let us know.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </section>
  );
}
