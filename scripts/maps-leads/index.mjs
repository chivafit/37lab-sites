#!/usr/bin/env node
// Captura leads no Google Maps e salva em CSV/JSON e, opcionalmente, no Supabase.
// Uso: node index.mjs --busca "dentista" --local "Juiz de Fora, MG" --qtd 30 --raio 5 [--supabase]
import { parseArgs } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';
import { searchMaps } from './lib/maps.mjs';
import { scanWebsite } from './lib/site.mjs';
import { toLead, writeFiles, supabaseFromEnv, saveToSupabase } from './lib/save.mjs';

const here = dirname(fileURLToPath(import.meta.url));
for (const f of ['.env.local', '.env']) {
  const p = resolve(here, '../..', f);
  if (existsSync(p)) process.loadEnvFile(p);
}

const { values: a } = parseArgs({
  options: {
    busca: { type: 'string', short: 'b' },
    local: { type: 'string', short: 'l' },
    qtd: { type: 'string', short: 'q', default: '20' },
    raio: { type: 'string', short: 'r', default: '5' },
    lote: { type: 'string' },
    saida: { type: 'string', short: 'o', default: resolve(here, 'saida') },
    supabase: { type: 'boolean', default: false },
    'sem-site': { type: 'boolean', default: false },
    'sem-site-proprio': { type: 'boolean', default: false },
    visivel: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h' },
  },
});

if (a.help || (!a.lote && (!a.busca || !a.local))) {
  console.log(`Captura de leads no Google Maps (37LAB)

  --busca, -b   tipo de negócio          ex.: "dentista", "fisioterapia"
  --local, -l   cidade/bairro            ex.: "Juiz de Fora, MG"
  --qtd,   -q   quantidade de leads      (padrão 20)
  --raio,  -r   raio em km do centro     (padrão 5)
  --lote ARQ    roda todas as buscas de um arquivo JSON (ex.: buscas.json)
  --saida, -o   pasta dos arquivos       (padrão scripts/maps-leads/saida)
  --supabase    insere os leads novos em professional_leads
  --sem-site-proprio  só traz quem NÃO tem site próprio (sem site, ou só Instagram/Linktree)
  --sem-site    não visita os sites (mais rápido, sem e-mail)
  --visivel     mostra o navegador
  --json        imprime o resultado em JSON no stdout (para uso por IA)`);
  process.exit(a.help ? 0 : 1);
}

// Com --json o stdout fica reservado para o resultado; o progresso vai para o stderr.
const log = a.json ? (...m) => console.error(...m) : (...m) => console.log(...m);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

function statsOf(leads) {
  return {
    total: leads.length,
    com_telefone: leads.filter(l => l.raw_data.phone).length,
    com_whatsapp: leads.filter(l => l.raw_data.whatsapp).length,
    com_email: leads.filter(l => l.raw_data.email).length,
    com_site_proprio: leads.filter(l => l.raw_data.has_own_website).length,
  };
}

// Lote: especialidades × cidades com os valores de "padrao", mais as buscas avulsas de "extras".
function readBatch(file) {
  const cfg = JSON.parse(readFileSync(resolve(process.cwd(), file), 'utf8'));
  const d = { qtd: 20, raio: 5, semSiteProprio: false, ...(cfg.padrao || {}) };
  const jobs = [];
  for (const local of cfg.cidades || []) for (const busca of cfg.especialidades || []) jobs.push({ ...d, busca, local });
  for (const x of cfg.extras || []) jobs.push({ ...d, ...x });
  const bad = jobs.find(j => !j.busca || !j.local);
  if (bad) throw new Error(`Busca sem "busca" ou "local" em ${file}: ${JSON.stringify(bad)}`);
  if (!jobs.length) throw new Error(`Nenhuma busca em ${file}. Preencha "cidades" e "especialidades" ou "extras".`);
  return jobs;
}

async function runSearch(page, request, job) {
  const limit = Math.max(1, Number(job.qtd) || 20), radiusKm = Math.max(0.5, Number(job.raio) || 5);
  const { places } = await searchMaps(page, { query: job.busca, locality: job.local, limit, radiusKm, withoutOwnSite: !!job.semSiteProprio, log });
  if (!a['sem-site']) {
    const withSite = places.filter(p => p.website);
    log(`Visitando ${withSite.length} sites/links para buscar e-mail/WhatsApp...`);
    for (const p of withSite) {
      p.site = await scanWebsite(request, p.website);
      if (p.site.emails.length || p.site.whatsapp) log(`  ✓ ${p.name}: ${[...p.site.emails, p.site.whatsapp && `wa ${p.site.whatsapp}`].filter(Boolean).join(', ')}`);
    }
  }
  return places.map(p => toLead(p, { query: job.busca, locality: job.local }));
}

let jobs;
try {
  jobs = a.lote
    ? readBatch(a.lote)
    : [{ busca: a.busca, local: a.local, qtd: a.qtd, raio: a.raio, semSiteProprio: a['sem-site-proprio'] }];
} catch (e) {
  console.error(`Erro: ${e.message}`);
  process.exit(1);
}

// Valida a chave antes de abrir o navegador, para não perder uma captação inteira.
let db = null;
if (a.supabase) {
  try { db = supabaseFromEnv(); } catch (e) { console.error(`Erro: ${e.message}`); process.exit(1); }
}

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  headless: !a.visivel,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  ...(proxy ? { proxy: { server: proxy } } : {}),
});
const context = await browser.newContext({ locale: 'pt-BR', viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

let exitCode = 0;
const all = new Map(), summary = [];
try {
  for (const [i, job] of jobs.entries()) {
    if (jobs.length > 1) log(`\n=== [${i + 1}/${jobs.length}] ${job.busca} · ${job.local} ===`);
    try {
      const leads = await runSearch(page, context.request, job);
      // Entra no CSV/JSON antes de gravar: se o Supabase falhar, a captação não se perde.
      for (const l of leads) all.set(l.source_key, l);
      let saved = null, dbError = null;
      if (db) {
        try { saved = await saveToSupabase(db, leads); } catch (e) { dbError = e.message.split('\n')[0]; exitCode = 1; }
      }
      summary.push({ ...job, ...statsOf(leads), novos: saved?.inserted ?? null, existentes: saved?.skipped ?? null, erro_supabase: dbError });
      log(`${leads.length} leads${saved ? ` · ${saved.inserted} novos no Supabase, ${saved.skipped} já existiam` : ''}${dbError ? ` · ! falha ao gravar no Supabase: ${dbError} (os leads estão no CSV)` : ''}`);
    } catch (e) {
      // No lote, uma busca com erro (ex.: bloqueio do Google) não derruba as outras.
      exitCode = 1;
      summary.push({ ...job, erro: e.message.split('\n')[0] });
      log(`! Erro nesta busca: ${e.message.split('\n')[0]}`);
    }
    // Pausa entre buscas para não chamar atenção do Google.
    if (i < jobs.length - 1) await sleep(20000 + Math.random() * 20000);
  }

  const leads = [...all.values()];
  const name = a.lote ? `lote-${stamp}` : `${slugify(`${jobs[0].busca}-${jobs[0].local}`)}-${stamp}`;
  const { csvPath, jsonPath } = await writeFiles(leads, a.saida, name);
  const stats = statsOf(leads);

  if (jobs.length > 1) {
    log('\nResumo do lote:');
    for (const r of summary) log(r.erro ? `  ✗ ${r.busca} · ${r.local}: ${r.erro}` : `  ${r.erro_supabase ? '!' : '✓'} ${r.busca} · ${r.local}: ${r.total} leads${r.novos != null ? ` (${r.novos} novos)` : ''}${r.erro_supabase ? ` (não gravados no Supabase: ${r.erro_supabase})` : ''}`);
  }
  log(`\n${stats.total} leads · ${stats.com_telefone} telefone · ${stats.com_whatsapp} WhatsApp · ${stats.com_email} e-mail · ${stats.com_site_proprio} com site próprio`);
  log(`CSV:  ${csvPath}\nJSON: ${jsonPath}`);
  if (db) log(`Supabase: ${summary.reduce((n, r) => n + (r.novos || 0), 0)} leads novos em professional_leads`);
  if (summary.some(r => r.erro_supabase)) log('Algumas buscas não foram gravadas no Supabase: importe o CSV acima em /admin/leads ou rode de novo (leads repetidos são pulados).');
  else log('Para enviar ao painel: rode de novo com --supabase ou importe o CSV em /admin/leads.');
  if (a.json) console.log(JSON.stringify({ stats, summary, csvPath, jsonPath, leads }, null, 2));
} catch (e) {
  console.error(`Erro: ${e.message}`);
  exitCode = 1;
} finally {
  await browser.close();
}
process.exit(exitCode);
