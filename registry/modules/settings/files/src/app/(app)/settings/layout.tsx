import type { ReactNode } from "react";

import { SettingsTabs } from "@/components/settings/settings-tabs";
import siteConfig from "@/site.config";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <SettingsTabs links={siteConfig.nav.settings} />
      </header>
      {children}
    </div>
  );
}
