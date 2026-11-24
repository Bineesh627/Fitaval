# Fitaval

Marketing website for **Fitaval**, a fitness community platform that helps people discover nearby gyms, join events and challenges, connect with a community and track their progress.

> Discover Fitness. Connect with Community.

## Contact

| | |
|---|---|
| Location | Malappuram, Kerala • India |
| Phone | [+91 95391 75084](tel:+919539175084) |
| Email | [Contact@fitaval.com](mailto:Contact@fitaval.com) |
| Kochi office | Taliparamba Techies Park at Rajagiri College of Social Science (Autonomous), Rajagiri Rd, Kalamassery, Kochi, Kerala 683104 |
| Kochi phone | [+91 09991 77796](tel:+9109991777796) |
| Instagram | https://www.instagram.com/fitaval.app |
| Facebook | https://www.facebook.com/p/Fitaval-61593216647087/ |
| LinkedIn | https://www.linkedin.com/company/fitaval/ |

## Tech

A static, single-page site. No build step and no dependencies.

- HTML, CSS and vanilla JavaScript
- Google Fonts (Space Grotesk, Poppins)

## Project structure

```
index.html          Page markup, meta tags and JSON-LD structured data
style.css           Styles
animations.css/js   Scroll and ticker animations
script.js           Menu, testimonials, country-code picker, form handling
assets/             Photos and graphics
favicon.svg, icon-*.png, apple-touch-icon.png, site.webmanifest   Icons / PWA info
og-image.jpg        1200x630 social share image
robots.txt, sitemap.xml, llms.txt, llms-full.txt   Search and AI discovery files
SEO-README.md       Notes on the SEO setup
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Upload the folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, or plain web hosting). The files assume the site lives at `https://fitaval.com`; if your address differs, find-and-replace it in `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt` and `llms-full.txt`.

## SEO

- Title, description, canonical, Open Graph and Twitter card tags
- Geo tags for Malappuram and Kochi, Kerala, India
- JSON-LD: Organization (with both phone numbers and locations), WebSite, WebPage and FAQPage
- FAQ section on the page, kept in sync with the FAQPage data
- `robots.txt` allowing search and AI crawlers, plus an image `sitemap.xml`
- `llms.txt` and `llms-full.txt` for AI assistants

See [SEO-README.md](SEO-README.md) for the checklist after publishing.

## Updating contact details

When the phone number or location changes, update it in all of these places:

1. `index.html`: footer, the FAQ answer "How can I contact Fitaval?", and the JSON-LD (`Organization` and the `FAQPage` answer)
2. `llms.txt` and `llms-full.txt`
3. This README
4. `<lastmod>` in `sitemap.xml`
