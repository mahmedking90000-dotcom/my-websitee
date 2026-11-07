import type { MetadataRoute } from "next";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://nova-digital-agency-woad.vercel.app"
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/portal/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email"
      ]
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString()
  };
}
