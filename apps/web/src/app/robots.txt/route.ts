export function GET() {
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
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
