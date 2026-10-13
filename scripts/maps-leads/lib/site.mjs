// Visita o site do estabelecimento e extrai e-mails, WhatsApp e Instagram.
// Usa o APIRequestContext do Playwright (mesmo proxy/UA do navegador, sem renderizar JS).

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const JUNK_EMAIL = /\.(png|jpe?g|gif|webp|svg|css|js)$|@(sentry|wixpress|linktr|example|domain|email|seudominio|sentry-next)\.|^(nome|seu|your|user)@/i;
const CONTACT_LINK = /contato|contact|fale|sobre|about|atendimento|agend/i;
const digits = s => String(s || '').replace(/\D/g, '');

function decodeEntities(html) {
  return html.replace(/&#64;|&commat;/gi, '@').replace(/&#46;|&period;/gi, '.').replace(/&amp;/gi, '&');
}

export function extractContacts(html) {
  const text = decodeEntities(html);
  const emails = [...new Set((text.match(EMAIL_RE) || []).map(e => e.toLowerCase().replace(/^mailto:/, '')))]
    .filter(e => !JUNK_EMAIL.test(e));
  const wa = text.match(/(?:wa\.me\/|api\.whatsapp\.com\/send\/?\?phone=|whatsapp:\/\/send\?phone=)\+?(\d{10,13})/i)?.[1] || null;
  const ig = text.match(/instagram\.com\/([a-z0-9._]{3,30})/i)?.[1];
  const instagram = ig && !/^(p|reel|explore|accounts|stories|tv)$/i.test(ig) ? `@${ig}` : null;
  return { emails, whatsapp: wa, instagram };
}

function contactLinks(html, base) {
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi)) {
    if (!CONTACT_LINK.test(m[1] + ' ' + m[2])) continue;
    try {
      const u = new URL(m[1], base);
      if (u.hostname === new URL(base).hostname && /^https?:$/.test(u.protocol)) out.add(u.href);
    } catch {}
  }
  return [...out].slice(0, 2);
}

async function get(request, url) {
  try {
    const r = await request.get(url, { timeout: 12000, maxRedirects: 5, failOnStatusCode: false });
    if (!r.ok() || !/text\/html/i.test(r.headers()['content-type'] || '')) return '';
    return (await r.text()).slice(0, 1_500_000);
  } catch { return ''; }
}

export async function scanWebsite(request, website) {
  // Agregadores e redes sociais não são o site do profissional.
  if (!website || /(instagram\.com|facebook\.com|doctoralia\.|wa\.me|whatsapp\.com|google\.)/i.test(website)) {
    return { emails: [], whatsapp: digits(website?.match(/wa\.me\/(\d+)/)?.[1]) || null, instagram: null, pages: [] };
  }
  const home = await get(request, website);
  if (!home) return { emails: [], whatsapp: null, instagram: null, pages: [] };
  const pages = [website], found = [extractContacts(home)];
  for (const url of contactLinks(home, website)) {
    const html = await get(request, url);
    if (html) { pages.push(url); found.push(extractContacts(html)); }
  }
  return {
    emails: [...new Set(found.flatMap(f => f.emails))].slice(0, 5),
    whatsapp: found.find(f => f.whatsapp)?.whatsapp || null,
    instagram: found.find(f => f.instagram)?.instagram || null,
    pages,
  };
}
