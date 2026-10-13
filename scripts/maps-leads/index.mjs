#!/usr/bin/env node
// Captura leads no Google Maps e salva em CSV/JSON e, opcionalmente, no Supabase.
// Uso: node index.mjs --busca "dentista" --local "Juiz de Fora, MG" --qtd 30 --raio 5 [--supabase]
import { parseArgs } from 'node:util';
import { existsSync } from 'node:fs';
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
    saida: { type: 'string', short: 'o', default: resolve(here, 'saida') },
    supabase: { type: 'boolean', default: false },
    'sem-site': { type: 'boolean', default: false },
    visivel: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h' },
  },
});

if (a.help || !a.busca || !a.local) {
  console.log(`Captura de leads no Google Maps (37LAB)

  --busca, -b   tipo de negócio          ex.: "dentista", "fisioterapia"
  --local, -l   cidade/bairro            ex.: "Juiz de Fora, MG"
  --qtd,   -q   quantidade de leads      (padrão 20)
  --raio,  -r   raio em km do centro     (padrão 5)
  --saida, -o   pasta dos arquivos       (padrão scripts/maps-leads/saida)
  --supabase    insere os leads novos em professional_leads
  --sem-site    não visita os sites (mais rápido, sem e-mail)
  --visivel     mostra o navegador
  --json        imprime o resultado em JSON no stdout (para uso por IA)`);
  process.exit(a.help ? 0 : 1);
}

const limit = Math.max(1, Number(a.qtd) || 20), radiusKm = Math.max(0.5, Number(a.raio) || 5);
// Com --json o stdout fica reservado para o resultado; o progresso vai para o stderr.
const log = a.json ? (...m) => console.error(...m) : (...m) => console.log(...m);

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  headless: !a.visivel,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  ...(proxy ? { proxy: { server: proxy } } : {}),
});
const context = await browser.newContext({ locale: 'pt-BR', viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

let exitCode = 0;
try {
  const { places } = await searchMaps(page, { query: a.busca, locality: a.local, limit, radiusKm, log });

  if (!a['sem-site']) {
    const withSite = places.filter(p => p.website);
    log(`Visitando ${withSite.length} sites para buscar e-mail/WhatsApp...`);
    for (const p of withSite) {
      p.site = await scanWebsite(context.request, p.website);
      if (p.site.emails.length || p.site.whatsapp) log(`  ✓ ${p.name}: ${[...p.site.emails, p.site.whatsapp && `wa ${p.site.whatsapp}`].filter(Boolean).join(', ')}`);
    }
  }

  const leads = places.map(p => toLead(p, { query: a.busca, locality: a.local }));
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const slug = `${a.busca}-${a.local}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const { csvPath, jsonPath } = await writeFiles(leads, a.saida, `${slug}-${stamp}`);

  const stats = {
    total: leads.length,
    com_telefone: leads.filter(l => l.raw_data.phone).length,
    com_whatsapp: leads.filter(l => l.raw_data.whatsapp).length,
    com_email: leads.filter(l => l.raw_data.email).length,
    com_site: leads.filter(l => l.raw_data.website).length,
  };
  let supabase = null;
  if (a.supabase) supabase = await saveToSupabase(supabaseFromEnv(), leads);

  log(`\n${stats.total} leads · ${stats.com_telefone} telefone · ${stats.com_whatsapp} WhatsApp · ${stats.com_email} e-mail · ${stats.com_site} site`);
  log(`CSV:  ${csvPath}\nJSON: ${jsonPath}`);
  if (supabase) log(`Supabase: ${supabase.inserted} novos em professional_leads, ${supabase.skipped} já existiam`);
  else log('Para enviar ao painel: rode de novo com --supabase ou importe o CSV em /admin/leads.');
  if (a.json) console.log(JSON.stringify({ stats, csvPath, jsonPath, supabase, leads }, null, 2));
} catch (e) {
  console.error(`Erro: ${e.message}`);
  exitCode = 1;
} finally {
  await browser.close();
}
process.exit(exitCode);
