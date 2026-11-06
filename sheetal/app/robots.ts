import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://studiobysheetal.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/checkout",
        "/checkout/*",
        "/my-account",
        "/my-account/*",
        "/login",
        "/otp",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

