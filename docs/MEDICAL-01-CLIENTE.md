# 37LAB — Medical 01

## Como criar um novo cliente

O layout é compartilhado. Os dados de cada profissional ficam centralizados em `lib/professionals.ts`.

### 1. Criar o cadastro

Duplique um objeto dentro de `professionals` e altere:

- `slug`: URL exclusiva do cliente
- `name`: nome completo
- `shortName`: nome exibido na marca
- `profession`: profissão
- `specialty`: especialidade
- `registration`: CRM/CRO/registro
- `clinic`: clínica ou consultório
- `address`: endereço
- `phone`: telefone formatado
- `whatsapp`: somente números com DDI + DDD
- `instagram`: URL completa, quando houver
- `city` e `state`

### 2. Conteúdo editorial

Personalize:

- `eyebrow`
- `heroTitle`
- `heroEmphasis`
- `bio`
- `aboutTitle`
- `aboutText`
- `quote`
- `careLabel`
- `services`
- `faqs`

### 3. Imagens

Criar a pasta:

`public/clients/<slug>/`

Sugestão de arquivos:

- `professional.jpg` — retrato profissional
- `clinic.jpg` — consultório/clínica

No cadastro:

```ts
professionalImage:'/clients/<slug>/professional.jpg',
clinicImage:'/clients/<slug>/clinic.jpg',
```

### 4. Identidade

O objeto `theme` já está preparado para armazenar as cores do cliente. A evolução seguinte do template pode conectar essas propriedades diretamente às CSS variables do Medical 01.

### 5. SEO

Preencher `seo.title` e `seo.description` com nome, especialidade e cidade do profissional.

### 6. Publicação

Fluxo recomendado:

1. criar cadastro;
2. adicionar imagens;
3. revisar textos e informações profissionais;
4. testar WhatsApp e mapa;
5. revisar desktop e mobile;
6. alterar `status` de `demo` para `active`;
7. configurar domínio;
8. liberar indexação somente na versão definitiva.

## Princípio do produto

Não duplicar o componente visual para cada cliente. O Medical 01 deve permanecer como um template único alimentado pelos dados de `lib/professionals.ts`. Assim, melhorias futuras no template podem beneficiar todos os sites que usam o mesmo produto.