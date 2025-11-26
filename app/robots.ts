export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/dashboard",
          "/app",
          "/login",
          "/register",
          "/api",
          "/settings",
        ],
      },
    ],
    sitemap: "https://byggarportalen.se/sitemap.xml",
  };
}
