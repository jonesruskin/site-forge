import type messages from "../../messages/en.json";

/** English is the source of truth: keys missing there are type errors everywhere. */
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
  }
}
