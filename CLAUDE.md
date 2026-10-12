# sepa-tracker

Browser-based US equity position tracker for the Minervini SEPA / VCP strategy. Deployed on GitHub Pages at https://renehohohoho.github.io/sepa-tracker/.

## Layout

A single `index.html` — markup, CSS and one inline IIFE script. No build step, no dependencies, no tests. Edit the file and open it in a browser.

`quote-proxy/` is a separate Vercel function (see its own `CLAUDE.md`). It lives in this repo for version control only; GitHub Pages does not run it.

The code is written in ES5 style (`var`, `function`, promise chains) for old iOS Safari; keep new code in that style.

## Data

- **Storage**: everything lives in the browser's `localStorage` (`sepa_positions`, `sepa_tp_phase`, `sepa_trade_log`, `sepa_cfg`). Nothing is stored server-side, so data does not sync between devices. Settings → 資料備份 downloads/restores a JSON backup (the API key is excluded).
- **Quotes, daily bars, SPY MA200**: Yahoo Finance v8 chart, fetched through `CHART_PROXY` (the Vercel function in this repo's `quote-proxy/`). Yahoo sends no CORS headers, so the browser cannot call it directly. One `range=1y` request per ticker serves both the quote and the VCP analysis (`yahooChart` caches the promise for 60 s).
- **Fallback quotes**: Finnhub, only when the user has entered an API key in settings. Finnhub has no free daily-bar endpoint, so VCP needs the proxy.

Do not reintroduce public CORS proxies (corsproxy.io, allorigins) — they stopped working for anonymous use in 2026.

## Conventions

- Bump `VER` in the cache-buster script in `<head>` when shipping a change, so iOS Safari reloads from the network.
- `tw-sepa-tracker/` is a sibling fork (lots of 1000 shares, TWD, FinMind fallback). Shared logic such as `analyseVCP`, `parseYahooOHLCV`, the TP plan and the backup code should be changed in both.
- Keep `CLAUDE.md` and `AGENTS.md` in sync.
