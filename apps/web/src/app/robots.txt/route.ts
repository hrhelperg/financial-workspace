export function GET() {
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      "Disallow: /dashboard",
      "Disallow: /clients",
      "Disallow: /invoices",
      "Disallow: /documents",
      "Disallow: /settings",
      "Disallow: /templates/*/install",
      "Disallow: /*/api/",
      "Disallow: /*/dashboard",
      "Disallow: /*/clients",
      "Disallow: /*/invoices",
      "Disallow: /*/documents",
      "Disallow: /*/settings",
      "Disallow: /*/templates/*/install",
      "Sitemap: https://www.cashworkspace.com/sitemap.xml",
      ""
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    }
  );
}
