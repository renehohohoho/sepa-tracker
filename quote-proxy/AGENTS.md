# quote-proxy

A single Vercel function, kept in the sepa-tracker repo, that forwards Yahoo Finance v8 chart requests for the sepa-tracker and tw-sepa-tracker pages. Yahoo sends no CORS headers, so those pages cannot call it from the browser.

## Endpoint

`GET /api/chart?symbol=AAPL&range=1y` → the raw Yahoo chart JSON (daily interval).

- `symbol`: validated against a strict pattern (`AAPL`, `2330.TW`, `6488.TWO`, `^TWII`).
- `range`: one of `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`.
- Only requests whose `Origin` is `https://renehohohoho.github.io` or localhost are served; everything else gets 403. Add new origins to `ALLOWED_ORIGINS` in `api/chart.js`.
- Successful responses are CDN-cached for 60 s.

## Deploy

No build step and no dependencies. Deploy the directory to the Vercel project `sepa-quote-proxy` as a production deployment (`vercel deploy --prod` from this directory, or through the Vercel dashboard / MCP).

The trackers hard-code the production URL in their `CHART_PROXY` constant. If the project's domain changes, update both `index.html` files.

Keep `CLAUDE.md` and `AGENTS.md` in sync.
