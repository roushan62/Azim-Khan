# Azim Khan — Personal Website

Portfolio website of **Azim Khan**, Chief Executive Officer of [FocusOn Interiors](https://focusoninteriors.com) (New Delhi · Gurugram).
Fully static — plain HTML, CSS and vanilla JavaScript — designed for **GitHub Pages**. No build step, no backend, no frameworks.

**Live:** https://roushan62.github.io/Azim-Khan/

## Pages

| Header | Footer |
| --- | --- |
| `index.html` — Home | `vision.html` — Vision & Philosophy |
| `about.html` — About | `leadership.html` — Leadership & Governance |
| `journey.html` — Journey (timeline) | `press.html` — Press & Media |
| `projects.html` — Legacy Projects | `speaking.html` — Speaking & Panels |
| `media/index.html` — Media (blog) | `recognition.html` — Recognition |
| `connect.html` — Connect | `sustainability.html` — CSR & Sustainability |
| | `gallery.html` — Gallery |

Also: `404.html`, `sitemap.xml`, `robots.txt`, `.nojekyll`.

## Design

Theme: **Crimson Executive** — near-black background, frosted glass cards, bright-red accents.
Fonts are self-hosted variable fonts (Fraunces + Manrope, SIL Open Font License) in `assets/fonts/`.
Everything lives in `assets/css/style.css` and `assets/js/main.js` (sliders, reveal-on-scroll, tilt/spotlight cards, lightbox, filters, mobile menu, copy-to-clipboard, mailto contact form).

## Responsive behaviour

The site is built mobile-first and verified with headless Chromium across 22 viewports
(320 → 2560 px, portrait and landscape) on every page — no horizontal scroll, no overflow,
no overlapping elements, no clipped text and 44 px minimum tap targets on touch devices.

| Breakpoint | What changes |
| --- | --- |
| `1600px+` | Wider container (1360px), longer hero measure |
| `1181–1600px` | Full desktop navigation |
| `1025–1180px` | Nav labels and brand compress so the header never wraps |
| `≤1024px` | Burger menu (full-height, scrollable, safe-area aware); hero stacks; footer 2 columns |
| `≤900px` | Split sections stack; timeline goes single-rail; reveal animations switch to vertical |
| `≤820px` | Section headers stack, project spec boxes left-align |
| `≤720px` | Full-width buttons, tighter cards, 2-column mosaic |
| `≤680px` | All grids single column |
| `≤560px` | Compact typography, wrapping buttons |
| `≤440px` | Hero chips move below the portrait, contact rows stack |
| `≤380px` | Reduced gutter (14px) |
| landscape `≤520px` tall | Compressed vertical rhythm, scrollable menu |

Also handled: `dvh` viewport units, `env(safe-area-inset-*)` for notched phones,
`@media (hover:none)` states so touch users see badges/captions that desktop reveals on hover,
`prefers-reduced-motion`, `forced-colors`, a `@supports` fallback for browsers without
`backdrop-filter`, and print styles.

## Writing a new blog post (Media)

1. Copy `media/posts/_template.html` → `media/posts/your-post-slug.html` (keep it in the same folder).
2. Edit the `<title>`, meta description, headline, date, tags, cover image and the article body (`<div class="prose">`).
   Image paths from that folder start with `../../assets/img/` — drop new images into `assets/img/`.
3. Remove the `<meta name="robots" content="noindex">` line.
4. Add a card for the post in `media/index.html` (search for `ADD NEW POSTS HERE`) and optionally on `index.html`.
5. Commit and push — GitHub Pages publishes automatically.

## Deploying

GitHub → **Settings → Pages → Build and deployment → Source: Deploy from a branch** → branch `main`, folder `/ (root)`.
The site uses relative paths only, so it works at `https://<user>.github.io/Azim-Khan/` or on a custom domain without changes.

## Content & image credits

All facts are drawn from public sources — Azim Khan's LinkedIn profile and posts, focusoninteriors.com, and press coverage (Realty+, Architecture Update, ANI/The Tribune, BW Businessworld, StartupTalky/IncBusiness, Mid-day, Homes India Magazine, SiliconIndia). Quotes are reproduced verbatim and linked to their source.
Project photography and team portraits © FocusOn Interiors (focusoninteriors.com); press photograph of Azim Khan as published by Realty+.
