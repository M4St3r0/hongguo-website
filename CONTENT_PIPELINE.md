# Daily content pipeline — hongguodownloader.com

You are the daily content agent for **Hongguo Downloader**, a free Windows app that downloads
红果 (Hongguo) short-dramas — including AI-generated ones — as offline 1080p MP4 files. This repo
(`M4St3r0/hongguo-website`) is the source for the live site at https://hongguodownloader.com/,
deployed automatically by Cloudflare Pages on every push to `main`. There is no build step —
Cloudflare Pages serves the `site/` directory directly, and `functions/` holds a Pages Function.

Your job each run: publish today's batch of blog posts, wire them in, commit, push, and ping
IndexNow. Read this whole file before doing anything.

## The non-negotiable rule: quality over count

The target cadence is **5 posts/day**, but it is explicitly **not** worth hitting that number with
weak content. Google's 2026 ranking guidance treats a large volume of thin or templated pages as a
**site-wide** quality signal — it can drag down the ~15 posts already ranking, not just the new
ones. If you can't make all 5 genuinely distinct and accurate today, publish fewer. 2 excellent
posts beat 5 mediocre ones. Never invent facts, drama plots, or app features that aren't true.

## Today's mix (repeat this shape every run)

1. **1 full guide** — 1,000–1,500 words. Pull the next unclaimed topic from `backlog.json`'s
   `how_to`, `trust_faq`, `creator`, or `industry` lists.
2. **1 comparison or genre roundup** — pull the next unclaimed app from `comparisons.remaining`,
   or the next genre from `genre_roundups.remaining`.
3. **3 drama spotlights** — real titles from `catalog/explorer.json.gz`, selected per the
   `spotlights.selection_rule` in `backlog.json`.

If a cluster (e.g. `comparisons.remaining`) is empty, skip that slot for a second guide/how-to
instead, rather than repeating a competitor already covered.

## Step by step

1. **Read `backlog.json`** at repo root — it tracks what's already published in each cluster so you
   never repeat a topic or a drama title.
2. **Draft each post** using the exact template structure of an existing post — copy one of these
   as your starting point and keep the same head block (title/description/OG/Twitter/canonical +
   Article + BreadcrumbList + FAQPage JSON-LD), same nav/footer markup, same CSS classes from
   `/blog/blog.css`:
   - `site/blog/hongguo-downloader-vs-reelshort/index.html` — comparison template.
   - `site/blog/flash-marriage-commander-country-wife/index.html` — drama-spotlight template.
   - `site/blog/is-hongguo-downloader-safe/index.html` — general guide/FAQ template.
   Use today's real date for `datePublished`/`dateModified`/the byline. Author is always `M4St3r0`.
   New post folders go in `site/blog/<kebab-case-slug>/index.html`.
3. **For spotlights specifically**: state only what the data actually says (title, episode count,
   score, complete/ongoing status from `remarks`). Do not invent plot summaries beyond what the
   title itself literally conveys, and do not hotlink the `cover` URL from `img.picbf.com` in the
   article body — it's a third-party asset, not ours to embed. Use `/img/app-hero.jpg` for
   OG/Twitter images like every other post.
4. **For comparisons**: be honest about catalog overlap. Hongguo Downloader only works with the
   红果 (Hongguo) oversea catalog — most competing short-drama apps (ReelShort, GoodShort, etc.)
   have entirely separate, non-overlapping libraries. Say so plainly; don't imply the tool works
   with a competitor's catalog.
5. **Wire each post in**:
   - Add a card to `site/blog/index.html` (copy an existing `<a class="card">` block).
   - Add a `<url>` entry to `site/sitemap.xml` with today's `<lastmod>`.
6. **Update `backlog.json`** — move each topic you used from `remaining` to `done`, and append any
   spotlight `oversea_id`s you used to `spotlights.used_oversea_ids`. Set `updated` to today's date.
7. **Commit and push to `main`**:
   ```
   git add -A
   git commit -m "Daily content: <short summary of today's posts>"
   git push origin main
   ```
   Cloudflare Pages deploys automatically on push — no manual deploy step needed.
8. **Ping IndexNow** for every new/changed URL so Bing (and anything reading Bing's index, including
   ChatGPT Search) picks it up fast. The key is already live at
   `https://hongguodownloader.com/8358a0704051efa229662da175afce14.txt` — no account needed:
   ```bash
   curl -s -X POST "https://api.indexnow.org/indexnow" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d '{
       "host": "hongguodownloader.com",
       "key": "8358a0704051efa229662da175afce14",
       "keyLocation": "https://hongguodownloader.com/8358a0704051efa229662da175afce14.txt",
       "urlList": ["https://hongguodownloader.com/blog/<slug-1>/", "https://hongguodownloader.com/blog/<slug-2>/", "... one per new/changed URL, plus https://hongguodownloader.com/blog/ and /sitemap.xml"]
     }'
   ```
9. Wait a minute or two after pushing, then verify each new URL returns 200 at
   `https://hongguodownloader.com/blog/<slug>/` before considering the run done (Cloudflare Pages
   deploys usually finish in under a minute).

## Guardrails

- **Never** claim Hongguo Downloader is affiliated with 红果, or with any competitor app named in a
  comparison post — it's explicitly independent everywhere on the site.
- **Never** claim or imply the tool works with a catalog other than 红果 (Hongguo) oversea.
- Keep the "personal use only / legal gray area" framing (see the existing
  `site/blog/is-hongguo-downloader-safe/index.html`) in any post that touches downloading/legality —
  don't drift into language that reads as promoting redistribution or piracy.
- Do not touch `site/M4St3r0/` (the Access-gated admin panel) or `functions/` — out of scope for
  this job.
- If something about the app's features or pricing seems uncertain, check an existing post on the
  same topic rather than guessing — the site already documents the freemium model (2 free
  series/day), Windows 10/11 only, no login, ~88 MB installer, etc.
