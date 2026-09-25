import { analyticsEnv as env } from "@/env/analytics";

export type EventProps = Record<string, string | number | boolean | null | undefined>;

/** Globals the provider scripts define. */
type AnalyticsWindow = Window & {
  plausible?: ((event: string, options?: { props?: EventProps }) => void) & { q?: unknown[] };
  posthog?: {
    capture: (event: string, props?: EventProps) => void;
    opt_out_capturing?: () => void;
  };
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  umami?: { track: (event: string, props?: EventProps) => void };
};

export type Provider = {
  id: "plausible" | "posthog" | "ga4" | "umami";
  /** Cookieless providers may run before (or without) consent, depending on site.config. */
  cookieless: boolean;
  script: { src: string; attributes?: Record<string, string>; inline?: string };
  track: (w: AnalyticsWindow, event: string, props?: EventProps) => void;
};

const gaId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// Defaults are skipped when SKIP_ENV_VALIDATION is set, so repeat them here.
const posthogHost = (env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").replace(/\/$/, "");
const posthogAssets = posthogHost.replace(
  /^https:\/\/(us|eu)\.i\.posthog\.com$/,
  "https://$1-assets.i.posthog.com",
);

/** The configured provider, picked by which env var is set. */
export const provider: Provider | null = env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  ? {
      id: "plausible",
      cookieless: true,
      script: {
        src: env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js",
        attributes: { "data-domain": env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN },
        inline:
          "window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}",
      },
      track: (w, event, props) => w.plausible?.(event, props ? { props } : undefined),
    }
  : env.NEXT_PUBLIC_POSTHOG_KEY
    ? {
        id: "posthog",
        cookieless: false,
        script: {
          src: `${posthogAssets}/static/array.js`,
          inline: `!function(){window.posthog=window.posthog||[];var p=window.posthog;if(p.__loaded)return;["capture","identify","reset","opt_out_capturing"].forEach(function(m){p[m]=p[m]||function(){p.push([m].concat([].slice.call(arguments)))}});p._i=[["${env.NEXT_PUBLIC_POSTHOG_KEY}",{api_host:"${posthogHost}",capture_pageview:"history_change",person_profiles:"identified_only"},"posthog"]];}();`,
        },
        track: (w, event, props) => w.posthog?.capture(event, props),
      }
    : gaId
      ? {
          id: "ga4",
          cookieless: false,
          script: {
            src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
            inline: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${gaId}");`,
          },
          track: (w, event, props) => w.gtag?.("event", event, props),
        }
      : env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
        ? {
            id: "umami",
            cookieless: true,
            script: {
              src: env.NEXT_PUBLIC_UMAMI_SRC ?? "https://cloud.umami.is/script.js",
              attributes: { "data-website-id": env.NEXT_PUBLIC_UMAMI_WEBSITE_ID },
            },
            track: (w, event, props) => w.umami?.track(event, props),
          }
        : null;

export type { AnalyticsWindow };
