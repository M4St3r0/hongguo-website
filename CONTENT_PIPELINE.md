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

## App version — why it must always live in this repo, never only on production

Cloudflare Pages deploys **only** from what's committed to this repo's `main` branch. There is no
other source of truth. That means:

- **Never treat a "live" change as durable unless it's also committed here.** If the current app
  version, a changelog entry, or any homepage copy is updated on the live site through any channel
  other than a push to this repo, the *next* deploy — including this daily content run — will
  silently overwrite it back to whatever `main` still says. That is not this pipeline "reverting"
  anything on purpose; it is just redeploying stale repo content over a change that was never
  actually saved to source control. The fix is always the same: make the change here, commit it,
  push it — once it's in `main` there's nothing left to revert.
- **The installer link never goes stale on its own.** Every download button points at
  `.../releases/latest/download/HongguoDownloader-Setup.exe`, which GitHub always resolves to the
  newest release automatically — no repo change needed for the `.exe` itself.
- **But the text/screenshots describing "the current version" are hardcoded and do need updating**
  whenever a new app version ships. That currently means: the `"softwareVersion"` JSON-LD field in
  `site/index.html`, `site/zh/index.html`, `site/chinese-video-downloader/index.html`,
  `site/hongguoduanju-downloader/index.html`, and `site/ai-drama-downloader/index.html`; the latest
  entry in the `#whatsnew` changelog section of `site/index.html` (move the previous "latest" into
  the `.rel-history` list below it); and any Features-section copy that names a specific version.
  If you become aware a new version has shipped (release notes are provided to you, or the version
  referenced in the repo doesn't match the latest GitHub release), update these as part of that
  day's run rather than leaving them stale — don't wait to be asked.
- This daily content job does not otherwise touch homepage version text, so under normal operation
  there is nothing to revert. Drift only happens when a release ships and the repo isn't updated to
  match — see above.

## The 24,000+ drama catalog — what's confirmed, and how to talk about it

As of **v1.0.0.48** (already reflected in `site/index.html`'s `#whatsnew` section, `site/whatsnew/index.html`,
and every `softwareVersion` JSON-LD field across the site), the app's **Catalogue** tab lets users
browse, search, sort, and filter **24,000+ verified dramas** directly — this is confirmed directly
in the app UI and in the site's own changelog copy, so it's safe to state plainly in new content,
not just implied. (v1.0.0.48 also rebuilt the home screen around a **live 红果 leaderboard** — the
platform's real-time top charts, switchable by **All / Live-action / Animated / AI** — sitting in a
simpler two-tab **Leaderboard / Catalogue** home; the old Recommended / Hot / New toggle from
v1.0.0.42 is gone.)

**Use this fact going forward** — it's a genuine, newsworthy improvement worth promoting:
- Lead with it in new guides/comparisons where it's relevant (e.g. "browse 24,000+ dramas without
  leaving the app," "search Hongguo's catalogue of 24,000+ short-dramas and AI dramas," or "check
  the live 红果 leaderboard for what's trending right now").
- Comparison posts can now cite it directly in the "at a glance" table or copy — it's a real
  differentiator against apps with in-app-only, non-downloadable libraries.
- Keep it to **"24,000+"** — don't state a more precise number (it changes), and don't imply every
  single one of those 24,000+ titles has been individually verified as still downloadable at watch
  time; titles do occasionally get pulled (see the in-app "Unavailable (已下架)" flagging).
- If you're citing an older post's own text (e.g. quoting a v1.0.0.42-era changelog entry that
  correctly said "20,000+" *at the time*), leave that historical figure alone — only use "24,000+"
  in new content describing the *current* catalog.

**Important — this is separate from `catalog/explorer.json.gz`.** That file is a much smaller,
fixed **snapshot** (~2,244 oversea titles, captured 26 August 2026) used only so this pipeline can
pick specific, real, individually-verifiable titles for drama-spotlight and genre-roundup posts —
it is *not* a mirror of the app's live 24,000+-title catalog and hasn't been refreshed since. Keep
using it exactly as before for picking spotlight/roundup titles (everything in it is real and
accurate for those specific dramas), but never describe it as "the catalog" or use its size as a
stand-in for the 24,000+ figure — those are two different things. If this snapshot runs low on
unused titles, flag it to the human maintainer rather than trying to source a new one yourself.

## Real screenshots &amp; video in blog posts

The repo has genuine screenshots and one demo video of the actual running app — use them in posts
that are actually *about* the tool (how-to guides, comparisons, feature/update recaps, trust/FAQ,
walkthroughs). Drama-spotlight posts stay text-plus-`app-hero.jpg`-for-OG as already documented above;
they're about a specific drama, not the app UI, so don't force a screenshot into them.

- **Available real assets** (do not fabricate a new one — if a post needs to illustrate something
  with no matching real screenshot, describe it in text instead):
  - `/img/app-grid-light.jpg` / `-dark.jpg` — search bar + Trending wall
  - `/img/app-queue-light.jpg` / `-dark.jpg` — download queue with live progress bars
  - `/img/v31/app-library-light.jpg` / `-dark.jpg` — Library poster wall
  - `/img/v31/app-account-light.jpg` / `-dark.jpg` — Account panel
  - `/img/v31/app-home-light.jpg` / `-dark.jpg` — home/Trending screen
  - `/img/v35/app-explore-light.webp` / `-dark.webp` — Explore tab (browse the full catalogue) —
    **superseded by `v42/catalog.jpg` and now `v48/catalog.jpg`; prefer those in new posts.**
  - `/img/app-dock-dark.jpg` / `-light.jpg` — download dock
  - `/img/v42/unavailable.jpg` — a queued title instantly flagged **"Unavailable (已下架)"** with
    the in-app toast, illustrating the instant offline-title detection added in v1.0.0.42. Still
    accurate as of v1.0.0.48 (this toast wasn't touched by the v48 home redesign). One theme only
    (no `-light`/`-dark` pair) — use it as-is.
  - `/img/v42/catalog.jpg`, `/img/v42/home.jpg`, `/img/v42/library.jpg` — **superseded, v1.0.0.42-era
    screens.** `v42/home.jpg` showed the old Recommended / Hot / New / Catalog toggle, which
    v1.0.0.48 replaced outright — don't use it in new posts, it no longer matches the app. Use the
    `v48/` equivalents below instead. (`v42/catalog.jpg` and `v42/library.jpg` aren't *wrong*, just
    stale — the `v48/` versions are the current screens and both show the live 24,000+ count.)
  - `/img/v48/leaderboard.jpg` — the new home screen's **live 红果 leaderboard** tab: real-time top
    charts, switchable by All / Live-action / Animated / AI, rank badges, scores, episode counts.
    One theme only (single file already styled for both themes) — use it as-is. This is the current
    "home/hero" screenshot; prefer it over `v31/app-home` or `v42/home.jpg` in new posts.
  - `/img/v48/leaderboard-compact.jpg` — a tighter crop of the same leaderboard screen, useful where
    a narrower aspect ratio fits better. One theme only.
  - `/img/v48/catalog.jpg` — the current **Catalogue** tab: genre-tab chips, in-app search, sort and
    status filter, showing the live **24,000+**-drama count badge. One theme only — the freshest and
    most accurate catalog/browse screenshot; prefer it over `v42/catalog.jpg` and `v35/app-explore`
    in new posts going forward.
  - `/img/v48/library.jpg` — the current Library section: poster shelf, per-series Update/Play/Open
    controls, the Update settings bar (quality, speed, series count), star ratings, new-episode
    badges. One theme only — prefer it over `v42/library.jpg` and `v31/app-library` in new posts.
  - `/img/hongguo-demo.mp4` (poster `/img/hongguo-demo-frame.jpg`) — screen-recorded demo of
    search → queue → batch download in real time
- **Pick the asset that matches the section it sits in** — a download/queue section gets
  `app-queue`, a library/updating section gets `v48/library` (falls back to `v31/app-library` if
  you want the theme-swap pair instead), a search/browse/catalog section gets `v48/catalog` (the
  freshest and most accurate — prefer it over `v42/catalog.jpg` and `v35/app-explore` in new posts),
  a home/hero or trending-rankings section gets `v48/leaderboard` (or `v48/leaderboard-compact` for
  a narrower crop), and a post specifically about titles disappearing from the platform gets
  `v42/unavailable` (still current). Use the theme-swap pattern already on the homepage where a pair
  exists: both a `.shot-light`/`.shot-dark` pair, e.g.
  `<img class="shot-light" src="/img/app-queue-light.jpg" ...><img class="shot-dark" src="/img/app-queue-dark.jpg" ...>`
  wrapped in a simple `<figure>` — see `site/index.html`'s `.bigshot` figures for the exact markup
  and matching CSS classes, or keep it simpler in blog posts with simply
  `<img src="/img/app-queue-light.jpg" alt="..." style="width:100%;border-radius:14px;border:1px solid var(--line)">`
  if you'd rather not theme-swap inline in an article body.
  Match the CSS variables already loaded via `/blog/blog.css`. The `v42/` and `v48/` assets have no
  `-light`/`-dark` variant (single file, already styled for both themes) — just use one plain
  `<img>`, e.g.
  `<img src="/img/v48/catalog.jpg" width="1600" height="1000" loading="lazy" alt="..." style="width:100%;border-radius:14px;border:1px solid var(--line)">`
  (note: `v48/` images are 1600×1000; `v42/` images are 1600×1059 — use the real dimensions for
  whichever asset you pick), no `.shot-light`/`.shot-dark` wrapper needed.
- **The demo video** belongs in getting-started / walkthrough-style posts (installing, first
  download, "how to use") — embed it the same way `site/index.html`'s `#how` section does:
  `<video controls playsinline preload="metadata" poster="/img/hongguo-demo-frame.jpg"><source src="/img/hongguo-demo.mp4" type="video/mp4"></video>`.
  Don't force it into every post — one relevant embed per batch is plenty.
- This applies going forward to newly published posts. Retrofitting already-published posts with
  images/video is a separate, explicitly-requested task, not something to do automatically as part
  of a normal daily run.

## Guardrails

- **Never** claim Hongguo Downloader is affiliated with 红果, or with any competitor app named in a
  comparison post — it's explicitly independent everywhere on the site.
- **Never** claim or imply the tool works with a catalog other than 红果 (Hongguo) oversea.
- Keep the "personal use only / legal gray area" framing (see the existing
  `site/blog/is-hongguo-downloader-safe/index.html`) in any post that touches downloading/legality —
  don't drift into language that reads as promoting redistribution or piracy.
- Do not touch `site/M4St3r0/` (the Access-gated admin panel) or `functions/` — out of scope for
  this job.
- **Never fabricate a screenshot.** Only use the real, already-supplied assets listed above. If a
  new feature genuinely has no matching screenshot in the repo, say so in text — don't mock one up
  and present it as a real capture of the app.
- If something about the app's features or pricing seems uncertain, check an existing post on the
  same topic rather than guessing — the site already documents the freemium model (2 free
  series/day), Windows 10/11 only, no login, ~88 MB installer, etc.
