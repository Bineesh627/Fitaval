# Fitaval – SEO / AEO / GEO setup

**Before you publish:** the files assume the site lives at `https://fitaval.com`.
If your real address is different, find-and-replace `https://fitaval.com` in:
`index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`.

| File | What it is for |
|---|---|
| `index.html` `<head>` | Title, description, canonical, Open Graph, Twitter card, geo tags, icons |
| JSON-LD in `index.html` | Organization, WebSite, WebPage and FAQPage data (SEO + rich results + AI answers) |
| FAQ section (`#faq`) | Short question/answer pairs for answer engines (AEO); text matches the FAQPage data |
| `robots.txt` | Allows search engines and AI crawlers, points to the sitemap |
| `sitemap.xml` | Page and image sitemap |
| `llms.txt`, `llms-full.txt` | Plain-text summary for AI assistants (GEO) |
| `site.webmanifest`, `favicon.svg`, `icon-*.png`, `apple-touch-icon.png` | Icons / installable-app info |
| `og-image.jpg` | 1200x630 share image for WhatsApp, Facebook, LinkedIn, X |

## After publishing
1. Add the site to Google Search Console and Bing Webmaster Tools, then submit `/sitemap.xml`.
2. Test structured data at https://search.google.com/test/rich-results
3. Test the share card at https://www.opengraph.xyz
4. Keep the FAQ text and the FAQPage JSON-LD in sync when you edit either.
5. Update `<lastmod>` in `sitemap.xml` when content changes.
