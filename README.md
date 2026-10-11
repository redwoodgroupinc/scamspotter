# ScamSpotter.net

**Spot the Scam. Stay Safe.**

ScamSpotter is a free, privacy-first website that helps people in the United States, United Kingdom, Canada and Australia recognise the warning signs of scams. It offers five working checkers and a library of sourced scam prevention guides.

- **Scam Message Checker:** texts, WhatsApp and social media messages
- **Email Scam Checker:** email text plus an optional sender address
- **Job Scam Checker:** job adverts, recruiter messages and offers
- **Website Safety Guide:** structural checks on a web address (never visits it)
- **Phone Scam Message Checker:** voicemail transcripts and what a caller said

All analysis runs **in the visitor's browser** using a transparent, rule-based engine. There is no database, no AI API, no account system and no server-side processing of user text. The site works without any paid service.

---

## Contents

1. [Tech stack](#tech-stack)
2. [Getting started](#getting-started)
3. [Scripts](#scripts)
4. [Environment variables](#environment-variables)
5. [Project structure](#project-structure)
6. [How the detection engine works](#how-the-detection-engine-works)
7. [Publishing content](#publishing-content)
8. [Testing](#testing)
9. [Deploying to Cloudflare](#deploying-to-cloudflare) (recommended)
10. [Alternative: deploying to Vercel](#alternative-deploying-to-vercel)
11. [Google Search Console and the sitemap](#google-search-console-and-the-sitemap)
12. [Google AdSense](#google-adsense)
13. [Privacy and security](#privacy-and-security)
14. [Launch checklist](#launch-checklist)
15. [Known limitations](#known-limitations)

---

## Tech stack

| Area                     | Choice                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| Framework                | Next.js 16 (App Router, static prerendering)                                                 |
| Language                 | TypeScript 5.9 (strict)                                                                      |
| UI                       | React 19, Tailwind CSS 4, `@tailwindcss/typography`, Lucide icons                            |
| Content                  | Markdown files with YAML front matter (`content/guides`), TypeScript data files (`src/data`) |
| Markdown rendering       | `react-markdown` + `remark-gfm` (raw HTML disabled)                                          |
| Font                     | Inter (self-hosted, SIL Open Font License; see `src/fonts`)                                  |
| Unit and component tests | Vitest 5, Testing Library, jsdom                                                             |
| End-to-end tests         | Playwright                                                                                   |
| Hosting                  | Cloudflare Workers static assets (static export); Vercel or any Node host also works         |

Requires **Node.js 20.9 or later** to build; Wrangler (Cloudflare's CLI) needs **Node.js 22 or later** (`.nvmrc` pins Node 22).

## Getting started

```bash
git clone https://github.com/redwoodgroupinc/scamspotter.git
cd scamspotter
npm install
cp .env.example .env.local   # optional: every variable is optional
npm run dev                  # http://localhost:3000
```

Production build, locally:

```bash
npm run build
npm start                    # http://localhost:3000
```

## Scripts

| Command                           | What it does                                             |
| --------------------------------- | -------------------------------------------------------- |
| `npm run dev`                     | Start the development server                             |
| `npm run build`                   | Production build (also type-checks)                      |
| `npm start`                       | Serve the production build                               |
| `npm run lint`                    | ESLint (Next.js core-web-vitals + TypeScript rules)      |
| `npm run typecheck`               | `tsc --noEmit` across app and tests                      |
| `npm test`                        | Unit and component tests (Vitest)                        |
| `npm run test:e2e`                | End-to-end tests (Playwright; run `npm run build` first) |
| `npm run build:cloudflare`        | Static export to `./out` plus Cloudflare `_headers`      |
| `npm run preview:cloudflare`      | Serve `./out` locally in Cloudflare's runtime (Wrangler) |
| `npm run deploy:cloudflare`       | Build and deploy to Cloudflare from your machine         |
| `npm run test:e2e:cloudflare`     | End-to-end tests against the Cloudflare build            |
| `npm run format` / `format:check` | Prettier                                                 |
| `npm run check`                   | Lint, typecheck, unit tests and build in one go          |

## Environment variables

All variables are **optional** and **public** (they are inlined into the client bundle, so never put secrets in them). Set them in `.env.local` for local development, as **build variables** in Cloudflare (**Worker → Settings → Build → Variables and secrets**), or in **Vercel → Project → Settings → Environment Variables**. They are read at build time, so changes take effect on the next build.

| Variable                               | Purpose                                                                      | Default                                          |
| -------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`                 | Canonical origin for canonical tags, sitemap, robots.txt and Open Graph URLs | `https://scamspotter.net`                        |
| `NEXT_PUBLIC_CONTACT_EMAIL`            | Address shown on the Contact page. Use a mailbox you actually monitor        | none (the page says no address is published yet) |
| `NEXT_PUBLIC_ADSENSE_CLIENT`           | AdSense publisher ID, format `ca-pub-` + digits                              | none (no ads, no ad script)                      |
| `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE`     | Ad unit ID for guides and country pages                                      | none                                             |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOOL`        | Ad unit ID for checker pages                                                 | none                                             |
| `NEXT_PUBLIC_ADSENSE_SLOT_HOME`        | Optional ad unit ID for the homepage (falls back to the article slot)        | none                                             |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console HTML-tag token (only the `content` value)                     | none                                             |

Invalid values are ignored rather than half-applied: a malformed publisher ID leaves ads fully disabled.

## Project structure

```
content/guides/            Markdown guides (front matter validated at build time)
src/
  app/                     Routes (App Router)
    page.tsx               Homepage with the message checker
    message-checker/ email-checker/ job-scam-checker/
    website-safety-guide/ phone-scam-checker/
    guides/ guides/[slug]/ Guide index and article template
    scam-prevention/ scam-prevention/[country]/
    about/ contact/ privacy-policy/ terms/ disclaimer/ editorial-policy/ how-it-works/
    sitemap.ts robots.ts manifest.ts ads.txt/ opengraph-image.png icon.svg
  components/
    ads/                   AdSenseScript (loads once) and AdSlot (renders nothing unless configured)
    checker/               TextChecker, UrlChecker, result panels, rule table, tool page layout
    content/               Markdown renderer, source lists, reporting options, cards
    layout/                Header, mobile menu, footer, breadcrumbs (with BreadcrumbList JSON-LD)
    seo/ ui/
  data/
    sources.ts             Registry of verified official sources (single source of truth for citations)
    countries.ts           US, UK, Canada and Australia content
  lib/
    detection/             The rule-based engine (see below)
    content/guides.ts      File-based content loader and validator
    ads/config.ts          AdSense config parsing and ads.txt
    security/headers.ts    CSP and security headers
    site.ts seo.ts format.ts
tests/
  unit/                    Engine, URL, scoring, content, navigation, ads, headers, components
  e2e/                     Playwright: every page, navigation, checker flows, SEO, privacy
```

## How the detection engine works

The engine lives in `src/lib/detection` and is pure TypeScript with no network access.

1. **Validation:** empty input and input over 10,000 characters (2,048 for URLs) return a clear error instead of throwing.
2. **Normalisation (`normalize.ts`):** removes zero-width and bidirectional control characters, applies Unicode NFKC (so stylised letters become plain text), records words that mix Latin with Cyrillic or Greek, and estimates whether the text is English.
3. **Rules (`rules.ts`):** each rule has an id, title, category, severity, group, the tools it applies to, bounded regular expressions and a plain-English explanation. Some rules skip matches preceded by a negation in the same clause ("we will never ask for your code").
4. **Links (`url-analysis.ts`):** web addresses are extracted from the text and checked structurally: lookalike spellings, brand names on unrelated domains, raw IPs, `@` tricks, punycode, shorteners, risky file downloads and more. Addresses are never fetched.
5. **Sender (`sender-analysis.ts`):** the optional email sender is checked as text only.
6. **Scoring (`scoring.ts`):** severities weigh weak 1, moderate 2, strong 3, critical 4. Only the strongest finding in each group counts. Small documented combination bonuses apply (`COMBINATION_RULES` in `engine.ts`). **Low** is 0 to 2, **Medium** 3 to 6, **High** 7 or more from at least two groups, so no single rule can produce High.
7. **Output:** risk level, score, findings with evidence snippets, analysed links, recommendations and notices. Results are rendered as React text nodes; user input is never rendered as HTML or turned into clickable links.

Every rule and threshold is shown publicly on `/how-it-works`, generated from the same code.

**Adding or changing a rule:** edit `rules.ts`, then add tests in `tests/unit/engine.test.ts` for at least one suspicious example and one legitimate message that must stay Low. The example messages shown on the site (`examples.ts`) are tested too, so a rule change that alters their result fails the test suite.

## Publishing content

### Guides

Create `content/guides/<slug>.md`:

```markdown
---
title: How to Spot a Fake Charity Appeal
description: 70-170 character meta description used in search results.
summary: One or two sentences shown on cards and under the title.
category: Charity
published: 2026-11-01
updated: 2026-11-01
relatedTools: [message, email] # message | email | job | website | phone
relatedGuides: [what-to-do-after-a-suspicious-message]
sources: [ftc-avoid-scam, scamwatch] # ids from src/data/sources.ts
---

Body in Markdown. Use ## for sections (they become the table of contents).
Do not add a # heading (the title is the page's h1) or raw HTML.
```

The build fails if front matter is missing or invalid, a source id doesn't exist, or a related guide doesn't exist. Tests also fail if a guide links to an external URL that isn't in the source registry, or to an internal page that doesn't exist. The guide automatically appears in the guide index, the sitemap, related-guide lists and the homepage.

### Sources

`src/data/sources.ts` is the single list of external sources. Before adding one, open the page and confirm it says what you will cite it for. Update `SOURCES_LAST_VERIFIED` when you re-check the list. Official reporting routes change (for example, the UK's Action Fraud was replaced by Report Fraud in December 2025), so **re-verify sources at least every six months.**

### Editorial rules

Don't invent statistics, quotes, testimonials, ratings, credentials or "current" warnings. Label any example messages as illustrative and use reserved `.example` domains in them.

## Testing

```bash
npm test                 # 190+ unit and component tests
npm run build
npm run test:e2e         # ~90 Playwright tests on desktop and mobile Chromium

npm run build:cloudflare
npm run test:e2e:cloudflare   # the same tests against Wrangler serving ./out
```

Unit tests cover empty, oversized, Unicode, non-English and adversarial input; legitimate messages that must stay Low; phishing, job, phone and email scams; malformed and suspicious URLs; risk-score boundaries; safe rendering of HTML/script input; AdSense configuration; security headers; content integrity; and navigation coverage.

End-to-end tests start `next start` on port 3100, visit every page (status, single `h1`, metadata, canonical URL, no console errors), exercise keyboard-only checker flows, the mobile menu, copy/clear, confirm the URL checker never requests the submitted address, confirm no third-party requests or ad scripts load by default, and check headers, robots.txt, the sitemap and structured data.

If Playwright can't find a browser, run `npx playwright install chromium`, or point it at an existing Chromium with `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome`.

## Deploying to Cloudflare

Every page is prerendered, so ScamSpotter deploys to Cloudflare as a **static site on Workers static assets**. No Worker code runs. Cloudflare serves the files in `./out` directly, and static asset requests are free. `wrangler.jsonc` holds the configuration.

`npm run build:cloudflare` (`scripts/build-cloudflare.mts`):

1. runs `next build` with `STATIC_EXPORT=1`, which switches Next.js to `output: "export"`;
2. writes `out/_headers` with the same security headers the Node server sends, a one-year immutable cache for `/_next/static/*`, and `X-Robots-Tag: noindex` for every `*.workers.dev` address so only your custom domain is indexed;
3. publishes `/ads.txt` only when a valid AdSense publisher ID is set.

Unknown URLs get the custom 404 page with a real `404` status, and `/about.html` and `/about/` redirect to `/about`.

### Option A: connect the GitHub repository (recommended)

Cloudflare then rebuilds and redeploys automatically on every push.

1. In the Cloudflare dashboard, go to **Workers & Pages → Create application → Import a repository** and authorise GitHub if asked.
2. Select **`redwoodgroupinc/scamspotter`**.
3. Configure the project:
   - **Project/Worker name:** `scamspotter` (it must match `name` in `wrangler.jsonc`)
   - **Production branch:** the branch you want live (for example `main`, or the current development branch until `main` exists)
   - **Build command:** `npm run build:cloudflare` (`npm run build` also works: inside Cloudflare's build environment it automatically produces the same static output)
   - **Deploy command:** `npx wrangler deploy` (the default)
   - **Root directory:** leave empty
   - **Build variables:** optional, for example `NEXT_PUBLIC_CONTACT_EMAIL`. Add the AdSense variables here after approval. These are build-time values, not runtime variables.
4. Select **Save and Deploy**. The site appears at `https://scamspotter.<your-subdomain>.workers.dev` (marked `noindex`).

Workers Builds reads `.nvmrc`, so builds use Node.js 22.

### Option B: deploy from your computer

```bash
npx wrangler login            # opens a browser to authorise Wrangler
npm run deploy:cloudflare     # builds ./out and runs wrangler deploy
```

For CI without a browser login, set `CLOUDFLARE_API_TOKEN` (a token with the "Edit Cloudflare Workers" template) and `CLOUDFLARE_ACCOUNT_ID`.

### Connect ScamSpotter.net

1. **Add the domain to Cloudflare.** In the dashboard, select **Add a domain**, enter `scamspotter.net`, choose the Free plan, and change the nameservers at your registrar to the two Cloudflare shows you. (If you buy the domain through Cloudflare Registrar, this happens automatically.) Wait until the zone shows as **Active**.
2. **Attach the domain to the Worker.** Go to **Workers & Pages → scamspotter → Settings → Domains & Routes → Add → Custom Domain** and enter `scamspotter.net`. Cloudflare creates the DNS record and TLS certificate. Custom domains can't be created on a hostname that already has a CNAME record, so delete any old record for the apex first.
3. **Redirect www to the apex domain.** Add a proxied DNS `A` record for `www` pointing to `192.0.2.0` (a placeholder, because the request never reaches it), then create a redirect rule from `www.scamspotter.net` to `https://scamspotter.net` that preserves the path and query string (**Rules → Redirect Rules**, which includes a "Redirect from WWW to root" template).
4. **Turn on Always Use HTTPS** under **SSL/TLS → Edge Certificates**.
5. Keep `NEXT_PUBLIC_SITE_URL` unset (it defaults to `https://scamspotter.net`). If you want to test on `workers.dev` before the domain is live, the canonical tags still point to scamspotter.net, which is what you want for launch.
6. Check that `https://scamspotter.net/robots.txt`, `https://scamspotter.net/sitemap.xml` and a missing page (which should return the 404 page) all behave correctly.

## Alternative: deploying to Vercel

The same code also runs on Vercel (or any Node host using `next start`), where `next.config.ts` sends the security headers directly.

1. In Vercel, choose **Add New → Project** and import the repository. Keep the detected Next.js defaults (`npm run build`).
2. Deploy. Preview deployments automatically send `X-Robots-Tag: noindex` and a disallow-all robots.txt.
3. To use the domain, add `scamspotter.net` and `www.scamspotter.net` under **Project → Settings → Domains**, set `www` to redirect to the apex, and create the DNS records Vercel shows at your DNS provider.

## Google Search Console and the sitemap

1. Go to Google Search Console and add a **Domain property** for `scamspotter.net`.
2. Verify ownership with the **DNS TXT record** Google provides (recommended). Alternatively use a URL-prefix property with the **HTML tag** method: copy only the `content` value into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and redeploy.
3. Open **Sitemaps** and submit `https://scamspotter.net/sitemap.xml`.
4. Use **URL Inspection** on the homepage and a guide to request indexing.
5. Over the following weeks, review **Pages** (indexing) and **Core Web Vitals** reports.

Indexing and rankings are never guaranteed. Sustainable traffic comes from genuinely useful, accurate pages, so prioritise adding well-sourced guides over adding many thin ones.

## Google AdSense

AdSense is the only planned monetisation. The site ships **with ads switched off**: no AdSense script, no ad containers and no ad cookies until you configure a publisher ID.

### Before applying

- Deploy on the real domain with the guides, About, Contact (with a working `NEXT_PUBLIC_CONTACT_EMAIL`), Privacy Policy, Terms and Disclaimer pages live.
- Approval is never guaranteed. Google assesses content quality, originality and policy compliance.

### Applying and site verification

1. Sign up at AdSense with your domain.
2. AdSense gives you a publisher ID (`ca-pub-…`). Add it as `NEXT_PUBLIC_ADSENSE_CLIENT` and redeploy. The site then:
   - loads the AdSense library once, site-wide;
   - adds the `google-adsense-account` meta tag (one of Google's site-verification methods);
   - serves `/ads.txt` with the correct line for your publisher ID;
   - widens the Content-Security-Policy to allow Google's HTTPS ad resources;
   - updates the Privacy Policy's advertising section automatically.
3. Complete verification and the site review in AdSense.

### After approval

1. In AdSense, create **display ad units** (responsive). Create one for articles and one for tools (optionally one for the homepage).
2. Copy each unit's `data-ad-slot` number into `NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE`, `NEXT_PUBLIC_ADSENSE_SLOT_TOOL` and optionally `NEXT_PUBLIC_ADSENSE_SLOT_HOME`. Redeploy.
3. In **AdSense → Privacy & messaging**, set up Google's consent message for visitors in the UK, EEA and Switzerland (required for personalised ads there).
4. Optionally disable Auto ads if you only want the placed units.

### Placement rules built into the site

- Ad units appear after the explanatory content on checker pages, after the article body on guides and country pages, and between sections on the homepage, never next to inputs, result buttons or navigation.
- Units are labelled "Advertisement", and unconfigured units render nothing at all.
- Never click your own ads, ask anyone to click them, or use any service that generates traffic or clicks. Doing so violates AdSense policies.

## Privacy and security

- User text is analysed in the browser and never sent to the server, stored or logged. The checker buttons stay disabled until the page is hydrated, so a click can't fall back to a form submission that would put text into a URL.
- Pasted content is rendered only as React text. Markdown is rendered with raw HTML disabled. JSON-LD is built from constants only, with `<` escaped.
- The URL checker never fetches, resolves or follows user-supplied URLs (no SSRF surface). `javascript:`, `data:` and other non-web schemes are rejected with an explanation.
- Security headers on every route: strict Content-Security-Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS and `Cross-Origin-Opener-Policy`. See `src/lib/security/headers.ts` (sent by `next.config.ts` on Node hosts, and written to `out/_headers` for Cloudflare).
- No analytics, tracking scripts, cookies or local storage are used by the site itself. Fonts are self-hosted.
- If you later add server-side processing, analytics or a contact form, update the Privacy Policy and review security first.

## Launch checklist

- [ ] `npm run check`, `npm run test:e2e` and (after `npm run build:cloudflare`) `npm run test:e2e:cloudflare` pass
- [ ] Deployed to Cloudflare and `scamspotter.net` connected with HTTPS; `www` redirects to the apex domain; Always Use HTTPS on
- [ ] `NEXT_PUBLIC_SITE_URL` is `https://scamspotter.net` (or unset)
- [ ] `NEXT_PUBLIC_CONTACT_EMAIL` set to a monitored mailbox; Contact page shows it
- [ ] Read every guide, country page and policy page; confirm you're comfortable publishing them under your name
- [ ] Re-verify the links in `src/data/sources.ts` and update `SOURCES_LAST_VERIFIED`
- [ ] Have the Privacy Policy and Terms reviewed for your jurisdiction
- [ ] Search Console property verified and sitemap submitted
- [ ] Spot-check pages on a phone and with keyboard-only navigation
- [ ] After AdSense approval: publisher ID and slot IDs configured, `/ads.txt` returns your line, consent message enabled, Privacy Policy shows the advertising section
- [ ] Schedule a content review (sources, reporting routes, phone numbers) at least every six months

## Known limitations

- The checkers use English-language rules; other languages get a notice and only link checks apply fully.
- Pattern matching can miss new or unusually worded scams and can flag genuine messages, especially real security alerts.
- The brand list used for lookalike detection is short and hand-maintained, and domain parsing uses a simplified public-suffix list rather than the full Public Suffix List.
- The URL checker doesn't follow redirects, resolve shortened links, inspect page content or query reputation services (by design, for privacy and to avoid server-side request risks).
- The Email Checker can't read headers (SPF, DKIM, DMARC) or attachments; the Phone Checker can't identify callers or verify numbers.
- The Content-Security-Policy allows inline scripts because Next.js uses them for hydration on statically generated pages; user content is never rendered as HTML.
- When AdSense is enabled the CSP is intentionally broader (HTTPS scripts, frames and images) to accommodate Google's ad delivery.
- On Cloudflare, Next.js prefetch requests for the dynamic guide and country pages request data files whose names contain `$`; Cloudflare answers with one redirect to the percent-encoded name before serving them. Pages load normally; this only adds a redirect to background prefetches.

## Licence

All rights reserved by the site owner. The bundled Inter font is licensed under the SIL Open Font License (`src/fonts/Inter-OFL-LICENSE.txt`).
