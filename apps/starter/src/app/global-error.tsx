"use client";

import "./globals.css";

/** Last-resort boundary for errors thrown by the root layout itself. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main
          role="alert"
          className="container-page flex min-h-dvh flex-col items-start justify-center py-24"
        >
          <h1 className="text-heading">Something went wrong.</h1>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
