import type { NextConfig } from "next";

import { moduleNextConfig, nextPlugins } from "./src/generated/next";
import { securityHeaders } from "./src/lib/security-headers";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: moduleNextConfig.serverExternalPackages,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: moduleNextConfig.imageRemotePatterns,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(moduleNextConfig.csp) }];
  },
};

export default nextPlugins.reduce((acc, plugin) => plugin(acc), config);
