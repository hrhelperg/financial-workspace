const baseUrl = "https://www.cashworkspace.com";
const publicPaths = ["/", "/fr", "/es", "/de", "/pt", "/ru"] as const;

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function GET() {
  const lastmod = new Date().toISOString();
  const urls = publicPaths
    .map((path) => {
      const loc = path === "/" ? `${baseUrl}/` : `${baseUrl}${path}`;
      const priority = path === "/" ? "0.9" : "0.8";

      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        "    <changefreq>weekly</changefreq>",
        `    <priority>${priority}</priority>`,
        "  </url>"
      ].join("\n");
    })
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>"
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
