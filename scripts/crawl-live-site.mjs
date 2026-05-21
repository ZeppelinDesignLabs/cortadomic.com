/**
 * Shallow crawl of live cortadomic.com to collect internal paths.
 * Usage: node scripts/crawl-live-site.mjs
 */
const ORIGIN = 'https://cortadomic.com';
const SEED_PATHS = [
  '/',
  '/sitemap.xml',
  '/page-sitemap.xml',
  '/home/',
  '/applications/',
  '/spec-and-documents/',
  '/specifications-and-documentation/',
  '/video-audio/',
  '/dealers/',
  '/contact/',
  '/compare/',
  '/products/cortado-mkiii/',
  '/products/cortado-xe/',
  '/cortado-mkiii/',
  '/cortado-xe/',
  '/mkiii/',
  '/xe/',
];

const seen = new Set();
const queue = [...SEED_PATHS];
const results = new Map();

function normalizePath(url) {
  try {
    const u = new URL(url, ORIGIN);
    if (!u.hostname.replace(/^www\./, '').endsWith('cortadomic.com')) return null;
    let path = u.pathname;
    if (!path.endsWith('/')) path += '/';
    return path;
  } catch {
    return null;
  }
}

function extractLinks(html, base) {
  const links = new Set();
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    links.add(m[1]);
  }
  return [...links];
}

async function fetchPath(path) {
  const url = `${ORIGIN}${path}`;
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'cortadomic-migration-audit/1.0' },
    });
    const finalPath = normalizePath(res.url) ?? path;
    const html = res.headers.get('content-type')?.includes('text/html')
      ? await res.text()
      : '';
    return { path, finalPath, status: res.status, html, redirected: finalPath !== path };
  } catch (err) {
    return { path, finalPath: path, status: 0, html: '', error: String(err) };
  }
}

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);

  const result = await fetchPath(path);
  results.set(path, result);

  if (result.html) {
    for (const href of extractLinks(result.html, path)) {
      const p = normalizePath(href);
      if (p && !seen.has(p) && !p.startsWith('/wp-') && !p.includes('/wp-content/')) {
        queue.push(p);
      }
    }
  }
}

const paths = [...results.keys()].sort();
console.log(JSON.stringify({
  origin: ORIGIN,
  crawledAt: new Date().toISOString(),
  pathCount: paths.length,
  paths: paths.map((p) => {
    const r = results.get(p);
    return {
      path: p,
      status: r.status,
      finalPath: r.finalPath,
      redirected: r.redirected,
      error: r.error ?? null,
    };
  }),
}, null, 2));
