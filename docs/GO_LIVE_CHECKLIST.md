# 37LAB Sites — Go-live

## Concluído
- 7 templates responsivos
- Supabase professionals/services/FAQs/images
- Storage de imagens
- Gerador de novo cliente
- Leitura dinâmica por slug
- Gestão de clientes
- Editor de dados, conteúdo, SEO e imagens
- Editor de serviços e FAQ com ordenação
- Allowlist administrativa via `admin_users`
- Cadastro de domínio personalizado e resolução por hostname

## Antes do primeiro cliente real
1. Criar o primeiro usuário em Supabase Auth.
2. Inserir seu `auth.users.id` em `public.admin_users`.
3. Desativar novos cadastros públicos no Supabase Auth após criar o administrador.
4. Validar um ciclo completo: criar > editar > upload > publicar > despublicar.
5. Validar desktop, tablet e mobile nos 7 templates.

## Domínio de cliente
1. Cadastrar hostname no painel do cliente.
2. Adicionar hostname no projeto Vercel.
3. Configurar DNS conforme instruções da Vercel.
4. Após Vercel/DNS válidos, alterar `professional_domains.status` para `active`.

## Produção
- Não armazenar service role no browser.
- Publishable key pode ficar em `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Manter RLS habilitado.
- Revisar SEO, Open Graph, WhatsApp, endereço e imagens antes de publicar cada cliente.
