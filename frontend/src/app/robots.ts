import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/doctor",
        "/dashboard",
        "/login",
        "/consultation",
        "/consultations",
      ],
    },
    sitemap:
      "https://ai-hospital-frontend.onrender.com/sitemap.xml",
  };
}