import { writeFile, mkdir } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { hasOwnWebsite } from './site.mjs';

// Cópia de lib/template-router.ts (o script roda fora do Next). Mantenha em sincronia.
function normalizeCategory(value = '') { const v = value.toLowerCase(); if (/dent|odonto|ortodont|implant/.test(v)) return 'dental'; if (/fisio|pilates|osteop/.test(v)) return 'physio'; if (/psico|nutri|fono|terap|estet|enferm/.test(v)) return 'care'; if (/cl[ií]nica|laborat|hospital|centro/.test(v)) return 'clinic'; return 'medical'; }
function suggestTemplate(category, specialty = '', seed = '') { const c = normalizeCategory(`${category} ${specialty}`); if (c === 'dental') return hash(seed) % 2 === 0 ? 'dental-01' : 'dental-02'; if (c === 'physio') return 'physio-01'; if (c === 'care') return 'care-01'; if (c === 'clinic') return 'clinic-01'; return hash(seed) % 2 === 0 ? 'medical-01' : 'medical-02'; }
function hash(s) { return [...s].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0) & 0x7fffffff; }

const digits = s => String(s || '').replace(/\D/g, '');
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\b(dr|dra|doutor|doutora)\.?\s*/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Telefone BR sem o 55: celular tem 11 dígitos com 9 após o DDD (quase sempre é WhatsApp).
function phoneInfo(raw) {
  let d = digits(raw);
  if (d.length >= 12 && d.startsWith('55')) d = d.slice(2);
  d = d.replace(/^0+/, ''); // o Maps formata como 0XX...
  return { phone: d || null, mobile: d.length === 11 && d[2] === '9' };
}

// WhatsApp vindo de link wa.me no site: só vale número brasileiro (DDD + 8 ou 9 dígitos).
// Número estrangeiro costuma ser de quem fez o site; celular antigo sem o 9 ganha o 9.
// Fixo só com o 55 explícito: sem ele, 10 dígitos podem ser de outro país (ex.: 354 + 7 dígitos).
function brWhatsApp(raw) {
  let d = digits(raw);
  const hasCountry = d.length >= 12;
  if (hasCountry) { if (!d.startsWith('55')) return null; d = d.slice(2); }
  d = d.replace(/^0+/, '');
  if (d.length === 10 && /[6-9]/.test(d[2])) d = `${d.slice(0, 2)}9${d.slice(2)}`;
  if (d.length === 11 && d[2] === '9') return d;
  return hasCountry && d.length === 10 ? d : null;
}

function cityState(address, locality) {
  const m = address?.match(/,\s*([^,]+?)\s*-\s*([A-Z]{2})(?:,|\s*$)/);
  if (m) return { city: m[1].trim(), state: m[2] };
  const [city, state] = locality.split(/\s*[,-]\s*/);
  return { city: city || null, state: /^[A-Za-z]{2}$/.test(state || '') ? state.toUpperCase() : null };
}

// Nomes no Maps costumam vir com SEO: "Dra. Ana - Psicóloga | Centro • Online". Fica a 1ª parte.
const cleanName = n => { const first = n.split(/\s+[|•–—-]\s+/)[0].trim(); return first.length >= 3 ? first : n.trim(); };

export function toLead(p, { query, locality }) {
  const { phone, mobile } = phoneInfo(p.phone);
  const site = p.site || {};
  const siteWhatsapp = brWhatsApp(site.whatsapp);
  const whatsapp = siteWhatsapp || (mobile ? phone : null);
  const { city, state } = cityState(p.address, locality);
  // Muitos cadastram o Instagram como "site" no Maps.
  const igSite = p.website?.match(/instagram\.com\/([a-z0-9._]{3,30})/i)?.[1];
  const website = igSite ? null : p.website;
  const instagram = site.instagram || (igSite ? `@${igSite}` : null);
  const specialty = p.category || query;
  const category = normalizeCategory(`${query} ${p.category || ''}`);
  const source_key = `gmaps:${p.place_id || digits(p.maps_url).slice(-20)}`;
  return {
    source_key,
    name: cleanName(p.name),
    category,
    specialty,
    city,
    state,
    source_url: p.maps_url,
    suggested_template: suggestTemplate(category, specialty, cleanName(p.name)),
    raw_data: {
      source: 'google_maps', query, locality, captured_at: new Date().toISOString(),
      name: cleanName(p.name), maps_name: p.name, profession: p.category, specialty, city, state,
      address: p.address, phone, whatsapp,
      whatsapp_source: siteWhatsapp ? 'website' : whatsapp ? 'maps_mobile' : null,
      email: site.emails?.[0] || null, emails: site.emails || [],
      website, instagram, has_own_website: hasOwnWebsite(p.website),
      rating: p.rating, reviews: p.reviews,
      maps_url: p.maps_url, place_id: p.place_id,
      lat: p.coords?.lat ?? null, lng: p.coords?.lng ?? null, distance_km: p.distance_km,
    },
  };
}

// CSV compatível com o "Importar CSV" de /admin/leads (separador ';', sem aspas:
// o parser do painel não trata campos entre aspas, então ; e quebras de linha viram vírgula/espaço).
// "categoria" vai em texto livre porque o painel a passa por normalizeCategory (que não reconhece "physio").
const CSV_COLS = [
  ['id', l => l.source_key], ['nome', l => l.name], ['categoria', l => `${l.raw_data.query} ${l.specialty || ''}`.trim()], ['especialidade', l => l.specialty],
  ['cidade', l => l.city], ['estado', l => l.state], ['endereco', l => l.raw_data.address], ['telefone', l => l.raw_data.phone],
  ['whatsapp', l => l.raw_data.whatsapp], ['email', l => l.raw_data.emails.join(' ')], ['site', l => l.raw_data.website],
  ['instagram', l => l.raw_data.instagram], ['has_own_website', l => l.raw_data.has_own_website], ['nota', l => l.raw_data.rating], ['avaliacoes', l => l.raw_data.reviews],
  ['distancia_km', l => l.raw_data.distance_km], ['maps_url', l => l.raw_data.maps_url],
];
const cell = v => String(v ?? '').replace(/;/g, ',').replace(/[\r\n]+/g, ' ').trim();

export async function writeFiles(leads, outDir, baseName) {
  await mkdir(outDir, { recursive: true });
  const csv = [CSV_COLS.map(c => c[0]).join(';'), ...leads.map(l => CSV_COLS.map(([, f]) => cell(f(l))).join(';'))].join('\n');
  const csvPath = `${outDir}/${baseName}.csv`, jsonPath = `${outDir}/${baseName}.json`;
  await writeFile(csvPath, '﻿' + csv);
  await writeFile(jsonPath, JSON.stringify(leads, null, 2));
  return { csvPath, jsonPath };
}

export function supabaseFromEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local da raiz do projeto');
  return createClient(url, key, { auth: { persistSession: false } });
}

// Insere só leads novos: nunca sobrescreve um lead existente (ele pode já ter
// enriquecimento, demo e etapa comercial). Também pula quem já entrou por CSV
// com o mesmo nome na mesma cidade.
export async function saveToSupabase(client, leads) {
  const cities = [...new Set(leads.map(l => l.city).filter(Boolean))];
  const keys = leads.map(l => l.source_key);
  const [{ data: byKey, error: e1 }, { data: byCity, error: e2 }] = await Promise.all([
    client.from('professional_leads').select('source_key').in('source_key', keys),
    cities.length ? client.from('professional_leads').select('name,city').in('city', cities) : Promise.resolve({ data: [] }),
  ]);
  if (e1 || e2) throw new Error((e1 || e2).message);
  const existingKeys = new Set((byKey || []).map(r => r.source_key));
  const existingNames = new Set((byCity || []).map(r => `${norm(r.name)}|${norm(r.city)}`));
  const fresh = leads.filter(l => !existingKeys.has(l.source_key) && !existingNames.has(`${norm(l.name)}|${norm(l.city)}`));
  if (fresh.length) {
    const { error } = await client.from('professional_leads').upsert(fresh, { onConflict: 'source_key', ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }
  return { inserted: fresh.length, skipped: leads.length - fresh.length };
}
