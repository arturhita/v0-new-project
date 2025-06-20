import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/admin/", "/chat/", "/call/", "/test-chat-flow/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: "https://mysthya.com/sitemap.xml",
  }
}
