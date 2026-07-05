import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";

/**
 * robots.txt（/robots.txt）
 *
 * 公開ページはクロール許可、会員向け・管理・APIなど
 * 非公開領域はクロール対象外にします。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/profile",
        "/mypage",
        "/admin",
        "/login",
        "/register",
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
