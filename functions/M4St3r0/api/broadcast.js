/**
 * Cloudflare Pages Function — same-origin broadcast proxy for the admin panel.
 * Route: /M4St3r0/api/broadcast   (inherits the existing Cloudflare Access rule on /M4St3r0*)
 *
 * WHY: the old admin panel hardcoded BOT_SHARED_SECRET (the key-minting secret!) in the page.
 * This proxy keeps the secret server-side. The browser calls this endpoint with NO secret;
 * this function adds it and forwards to the bot Worker.
 *
 * SETUP (one time):
 *   1. Cloudflare Pages → your project → Settings → Environment variables →
 *      add  BOT_SHARED_SECRET = <the same value the bot Worker uses>  (Production + Preview).
 *      (Optional) BOT_WORKER_URL = https://hongguo-bot.aly201514.workers.dev
 *   2. Confirm the Access application covers /M4St3r0*  (it already does) — that gates this path too.
 */
export async function onRequestPost({ request, env }) {
  // Fail closed: only requests that came THROUGH Cloudflare Access carry this header, and on an
  // Access-gated path Cloudflare sets/strips it itself (clients can't spoof it). If it's missing,
  // the path isn't actually gated — refuse rather than broadcast in the open.
  if (!request.headers.get("Cf-Access-Jwt-Assertion")) {
    return json({ error: "not authenticated (this path must be behind Cloudflare Access)" }, 403);
  }
  const secret = env.BOT_SHARED_SECRET;
  if (!secret) return json({ error: "server not configured: set BOT_SHARED_SECRET in Pages env vars" }, 500);

  let body = {};
  try { body = await request.json(); } catch (_) {}
  const payload = {};
  if (body.text) payload.text = String(body.text);
  if (body.chat_id) payload.chat_id = String(body.chat_id); // single-recipient / test send

  const worker = (env.BOT_WORKER_URL || "https://hongguo-bot.aly201514.workers.dev").replace(/\/+$/, "");
  try {
    const r = await fetch(worker + "/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Broadcast-Secret": secret },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    // Pass the upstream status + content-type through so failures (e.g. the Worker's
    // "forbidden" on a secret mismatch) surface clearly instead of looking like JSON.
    return new Response(text, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "text/plain" } });
  } catch (e) {
    return json({ error: "upstream failed: " + String(e) }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json" } });
}
