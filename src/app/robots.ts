// src/app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://assist.ag-technologies.tech";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/onboarding"],
        disallow: ["/", "/admin/", "/dashboard/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}