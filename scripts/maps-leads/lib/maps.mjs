// Coleta no Google Maps via navegador real (Playwright).
// Os seletores do Maps mudam com frequência: os mais estáveis são os data-item-id
// (address, phone:tel:..., authority) e o padrão !3d<lat>!4d<lng> da URL do lugar.

import { hasOwnWebsite } from './site.mjs';

const MAPS = 'https://www.google.com/maps';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const jitter = (min, max) => sleep(min + Math.random() * (max - min));

export function distanceKm(a, b) {
  const R = 6371, rad = x => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Zoom em que metade da largura da tela (~640px) cobre o raio pedido.
function zoomFor(radiusKm, lat) {
  const metersPerPx = (radiusKm * 1000) / 640;
  const z = Math.log2((156543.03 * Math.cos((lat * Math.PI) / 180)) / metersPerPx);
  return Math.max(10, Math.min(18, Math.round(z)));
}

const coordsFromUrl = url => {
  const m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null;
};
// Identificador estável do lugar (feature id "0x...:0x..."), usado para deduplicar.
const placeIdFromUrl = url => url.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i)?.[1] || null;

async function acceptConsent(page) {
  if (!/consent\.google/.test(page.url())) return;
  const btn = page.locator('button:has-text("Aceitar tudo"), button:has-text("Accept all")').first();
  if (await btn.count()) { await btn.click(); await page.waitForLoadState('domcontentloaded'); }
}

export async function geocode(page, locality) {
  await page.goto(`${MAPS}/search/${encodeURIComponent(locality)}?hl=pt-BR`, { waitUntil: 'domcontentloaded' });
  await acceptConsent(page);
  // O Maps reescreve a URL com @lat,lng quando centraliza na localidade.
  for (let i = 0; i < 30; i++) {
    const c = coordsFromUrl(page.url());
    if (c) return c;
    await sleep(500);
  }
  throw new Error(`Não consegui localizar "${locality}" no Google Maps`);
}

async function collectPlaceUrls(page, max, log) {
  const feed = page.locator('div[role="feed"]');
  try { await feed.waitFor({ timeout: 15000 }); } catch {
    // Busca com um único resultado abre direto a ficha do lugar.
    return page.url().includes('/maps/place/') ? [page.url()] : [];
  }
  let last = -1, stalled = 0;
  while (true) {
    const urls = await page.$$eval('div[role="feed"] a[href*="/maps/place/"]', as => [...new Set(as.map(a => a.href))]);
    if (urls.length >= max) return urls.slice(0, max);
    const ended = await page.locator('text=/chegou ao final da lista|reached the end of the list/i').count();
    if (ended) return urls;
    stalled = urls.length === last ? stalled + 1 : 0;
    if (stalled >= 6) return urls;
    last = urls.length;
    log(`  ${urls.length} resultados na lista...`);
    await feed.evaluate(el => el.scrollBy(0, el.scrollHeight));
    await jitter(1200, 2200);
  }
}

async function readPlace(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('h1').first().waitFor({ state: 'attached', timeout: 15000 });
  await sleep(800);
  const data = await page.evaluate(() => {
    const txt = el => el?.textContent?.trim() || null;
    const aria = sel => document.querySelector(sel)?.getAttribute('aria-label') || null;
    const ratingBox = document.querySelector('div.F7nice');
    // O 1º aria-label é o das estrelas ("5,0 estrelas"); o de avaliações diz "123 avaliações".
    const reviewsLabel = [...(ratingBox?.querySelectorAll('[aria-label]') || [])].map(e => e.getAttribute('aria-label')).find(l => /avalia|review|coment/i.test(l))
      || ratingBox?.textContent?.match(/\(([\d.]+)\)/)?.[1] || '';
    const phoneId = document.querySelector('[data-item-id^="phone:tel:"]')?.getAttribute('data-item-id') || '';
    return {
      name: txt(document.querySelector('h1')),
      category: txt(document.querySelector('button.DkEaL')) || txt(document.querySelector('[jsaction*="category"]')),
      rating: txt(ratingBox?.querySelector('span[aria-hidden="true"]')),
      reviews: reviewsLabel.replace(/\D/g, '') || null,
      address: (aria('[data-item-id="address"]') || '').replace(/^Endereço:\s*|^Address:\s*/i, '').trim() || null,
      phone: phoneId.replace('phone:tel:', '') || null,
      website: document.querySelector('a[data-item-id="authority"]')?.href || null,
    };
  });
  const finalUrl = page.url();
  return {
    ...data,
    rating: data.rating ? Number(data.rating.replace(',', '.')) || null : null,
    reviews: data.reviews ? Number(data.reviews) : null,
    maps_url: finalUrl,
    place_id: placeIdFromUrl(url) || placeIdFromUrl(finalUrl),
    coords: coordsFromUrl(finalUrl) || coordsFromUrl(url),
  };
}

// withoutOwnSite: só aceita quem não tem site próprio (sem site, ou só Instagram/Linktree/etc.).
export async function searchMaps(page, { query, locality, limit, radiusKm, withoutOwnSite = false, log = console.log }) {
  log(`Localizando "${locality}"...`);
  const center = await geocode(page, locality);
  const zoom = zoomFor(radiusKm, center.lat);
  log(`Centro ${center.lat.toFixed(4)},${center.lng.toFixed(4)} · raio ${radiusKm} km (zoom ${zoom})`);

  await page.goto(`${MAPS}/search/${encodeURIComponent(query)}/@${center.lat},${center.lng},${zoom}z?hl=pt-BR`, { waitUntil: 'domcontentloaded' });
  await acceptConsent(page);
  // Busca mais que o limite: parte dos resultados cai fora do raio e, com withoutOwnSite,
  // a maioria tem site próprio. O Maps não lista muito mais que ~120 por busca.
  const listSize = withoutOwnSite ? limit * 4 + 10 : Math.ceil(limit * 1.5) + 5;
  const urls = await collectPlaceUrls(page, listSize, log);
  log(`${urls.length} lugares encontrados. Abrindo fichas...`);

  const places = [], seen = new Set();
  for (const url of urls) {
    if (places.length >= limit) break;
    try {
      const p = await readPlace(page, url);
      const key = p.place_id || p.maps_url;
      if (!p.name || seen.has(key)) continue;
      seen.add(key);
      p.distance_km = p.coords ? Number(distanceKm(center, p.coords).toFixed(2)) : null;
      if (p.distance_km != null && p.distance_km > radiusKm) { log(`  - ${p.name} (${p.distance_km} km, fora do raio)`); continue; }
      if (withoutOwnSite && hasOwnWebsite(p.website)) { log(`  - ${p.name} (já tem site)`); continue; }
      places.push(p);
      log(`  ✓ ${places.length}/${limit} ${p.name}${p.phone ? ` · ${p.phone}` : ''}${hasOwnWebsite(p.website) ? ' · site' : p.website ? ' · link' : ''}`);
    } catch (e) {
      log(`  ! falha ao ler ${url.slice(0, 80)}...: ${e.message.split('\n')[0]}`);
    }
    await jitter(700, 1600);
  }
  if (places.length < limit) log(`Só ${places.length} de ${limit} atenderam aos filtros nesta busca. Tente aumentar o raio ou variar o termo.`);
  return { center, places };
}
