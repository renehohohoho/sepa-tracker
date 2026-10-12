// Yahoo Finance v8 chart 轉發。
// Yahoo 不回 CORS 標頭，瀏覽器無法直連；sepa-tracker / tw-sepa-tracker 透過這支函式取日線與報價。
// 用法：GET /api/chart?symbol=AAPL&range=1y

const ALLOWED_ORIGINS = ['https://renehohohoho.github.io'];
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const RANGES = ['5d', '1mo', '3mo', '6mo', '1y', '2y'];
const SYMBOL = /^[\^A-Z0-9][A-Z0-9.\-=]{0,14}$/;
const HOSTS = ['query2.finance.yahoo.com', 'query1.finance.yahoo.com'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Vary', 'Origin');

  // 只服務自己的 tracker，避免變成公開 proxy
  if (!ALLOWED_ORIGINS.includes(origin) && !LOCAL_ORIGIN.test(origin)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(403).json({ error: 'origin not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', origin);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const symbol = String(req.query.symbol || '').toUpperCase();
  const range = String(req.query.range || '1y');
  if (!SYMBOL.test(symbol) || !RANGES.includes(range)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).json({ error: 'bad symbol or range' });
  }

  const path = '/v8/finance/chart/' + encodeURIComponent(symbol) +
    '?interval=1d&range=' + range + '&includePrePost=false';

  let lastStatus = 502;
  for (const host of HOSTS) {
    try {
      const r = await fetch('https://' + host + path, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) {
        const body = await r.text();
        // range 固定的 URL 可被 CDN 快取，報價與 VCP 共用同一份回應
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(200).send(body);
      }
      lastStatus = r.status;
    } catch (e) {
      // 換下一個 host
    }
  }
  res.setHeader('Cache-Control', 'no-store');
  // 404 代表代號不存在，其餘一律視為上游失敗
  return res.status(lastStatus === 404 ? 404 : 502).json({ error: 'upstream failed', status: lastStatus });
};
