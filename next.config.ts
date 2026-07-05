import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** X-Powered-By ヘッダーを非表示（情報漏洩防止） */
  poweredByHeader: false,
  /**
   * workerd 向けエントリを正しく解決するため外部化（OpenNext 公式）
   * https://opennext.js.org/cloudflare/howtos/workerd
   */
  serverExternalPackages: ["@prisma/client", ".prisma/client", "jose"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
