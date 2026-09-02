import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leadjen-media-news.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/live",
          "/videos",
          "/photos",
          "/listen",
          "/search",
          "/sitemap.xml",
          "/news-sitemap.xml",
          "/rss.xml",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/*?preview=*",
          "/login",
          "/signup",
          "/account",
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/news-sitemap.xml`,
    ],
  };
}
