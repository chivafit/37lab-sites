# Captação de leads no Google Maps

Script local que busca profissionais no Google Maps e entrega cada lead no formato do painel `/admin/leads`. Ele:

1. encontra os negócios pelo tipo, cidade e raio;
2. abre cada ficha e coleta nome, endereço, telefone, site, nota e categoria;
3. visita o site e procura e-mail, WhatsApp (links `wa.me`) e Instagram;
4. salva um **CSV** (planilha) e um **JSON** e, se você pedir, insere direto em `professional_leads`.

Depois disso o fluxo segue igual: enriquecimento, demo e contato.

> Ele roda no seu computador, com um navegador real. Não roda na Vercel.
> Raspar o Google Maps viola os termos de uso do Google: use volumes moderados.
> O script já espera entre uma ficha e outra.

## Instalação (uma vez)

Precisa de Node 22 ou mais recente (exigido pelo `@supabase/supabase-js`).

```bash
cd scripts/maps-leads
npm run setup          # instala as dependências e o Chromium do Playwright
```

Para usar `--supabase`, crie o arquivo `.env.local` na **raiz** do projeto com:

```
NEXT_PUBLIC_SUPABASE_URL=https://hkndjcintuevrvgxicnl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...   # Supabase → Project Settings → API keys (secret)
```

A chave secreta fica só na sua máquina: o `.env.local` está no `.gitignore`. Nunca coloque essa chave na Vercel.

## Uso

```bash
node index.mjs --busca "dentista" --local "Juiz de Fora, MG" --qtd 30 --raio 5
node index.mjs -b "fisioterapeuta" -l "Centro, Juiz de Fora - MG" -q 50 -r 3 --supabase
node index.mjs -b "psicólogo" -l "Juiz de Fora, MG" -q 20 -r 5 --sem-site-proprio
```

### Tudo de uma vez (lote)

Edite `buscas.json` com as cidades e especialidades. Cada especialidade é buscada em cada cidade com os valores de `padrao`; `extras` recebe buscas avulsas com valores próprios:

```json
{
  "padrao": { "qtd": 20, "raio": 5, "semSiteProprio": true },
  "cidades": ["Juiz de Fora, MG"],
  "especialidades": ["dentista", "psicólogo", "fisioterapeuta", "nutricionista"],
  "extras": [{ "busca": "pediatra", "local": "Centro, Juiz de Fora - MG", "qtd": 10, "raio": 2 }]
}
```

Depois rode um único comando:

```bash
npm run lote        # roda todas as buscas e manda os leads novos direto para o painel
npm run lote:csv    # o mesmo, mas só gera o CSV (sem Supabase)
```

- **Pausa:** o lote espera de 20 a 40 segundos entre uma busca e outra, para não chamar atenção do Google.
- **Erros:** uma busca com erro não interrompe as outras, e o resumo final mostra o resultado de cada uma.
- **Arquivos:** tudo sai em um CSV e um JSON únicos (`saida/lote-<data>.csv`), sem repetir leads.
- **Chave:** sem a `SUPABASE_SERVICE_ROLE_KEY`, o `npm run lote` avisa antes de começar.

| Opção | O que faz |
|---|---|
| `--busca, -b` | tipo de negócio (`dentista`, `psicólogo`, `clínica de fisioterapia`...) |
| `--local, -l` | cidade ou bairro |
| `--qtd, -q` | quantidade de leads (padrão 20) |
| `--raio, -r` | raio em km a partir do centro do local (padrão 5); resultados fora do raio são descartados |
| `--lote ARQ` | roda todas as buscas de um arquivo JSON (veja acima) |
| `--supabase` | insere os leads **novos** em `professional_leads` |
| `--sem-site-proprio` | traz só quem **não tem site próprio**: sem site, ou só Instagram, Linktree, Doctoralia etc. São os melhores leads para a 37LAB. A busca percorre mais resultados para completar a quantidade |
| `--sem-site` | não visita os sites (mais rápido, mas sem e-mail) |
| `--visivel` | mostra o navegador, útil quando algo falha |
| `--json` | imprime o resultado em JSON no stdout (para uso por IA) |

Os arquivos ficam em `scripts/maps-leads/saida/`. O CSV pode ser importado pelo botão **Importar CSV** em `/admin/leads`, como alternativa ao `--supabase`.

### Regras de gravação

- `source_key` = `gmaps:<id do lugar no Maps>`. Rodar a mesma busca de novo não duplica leads.
- Um lead que já existe **nunca é sobrescrito**, porque ele pode já ter enriquecimento, demo e etapa comercial. O script também pula quem já entrou por CSV com o mesmo nome na mesma cidade.
- `whatsapp`: usa o número do link `wa.me` do site; se não houver, usa o telefone do Maps quando ele é celular. A origem fica em `raw_data.whatsapp_source` (`website` ou `maps_mobile`).
- Quando o "site" cadastrado no Maps é um Instagram, ele vai para o campo `instagram`.
- `raw_data.has_own_website` indica se o lead tem site próprio, mesmo sem usar `--sem-site-proprio`.
- O `raw_data` também guarda `rating`, `reviews`, `maps_url`, `lat`/`lng`, `distance_km` e `emails`.

O número de avaliações nem sempre aparece: sem login, o Google mostra uma versão limitada do Maps.

## Usando com IA

Peça ao Claude Code, por exemplo: *"gere 40 leads de nutricionistas em Juiz de Fora num raio de 4 km e mande pro Supabase"*. Ele roda:

```bash
node scripts/maps-leads/index.mjs -b "nutricionista" -l "Juiz de Fora, MG" -q 40 -r 4 --supabase --json
```

## Quando quebrar

O Google muda o HTML do Maps com frequência. Os seletores estão todos em `lib/maps.mjs`, na função `readPlace` e na lista do `collectPlaceUrls`. Rode com `--visivel` para ver o que mudou.
