# Etapa 3 — Publicação (Supabase + Vercel)

O Claude não tem acesso ao Supabase nem à Vercel. Ele prepara o código e entrega ao usuário
o passo a passo abaixo, um bloco por vez, esperando a confirmação de cada um. Os nomes
dos menus podem variar um pouco conforme a versão dos painéis.

## Antes (Claude)
- Confirmar no `backend/package.json`: `postinstall` com `prisma generate` e
  `vercel-build` com `prisma migrate deploy && nest build`. A Vercel roda o `vercel-build`
  no deploy, então as migrations de produção são aplicadas sozinhas.
- Confirmar que o frontend compila em produção e anotar a pasta de saída
  (normalmente `dist/frontend/browser`).
- Se o Angular usar rotas sem hash, criar `frontend/vercel.json` com rewrite de todas as
  rotas para `/index.html`, para que recarregar `/inquilinos/123` não dê 404.
- Commit e push.

## Passo 1 — Banco de produção (usuário, no Supabase)
1. Criar o projeto **`inquilinos-prod`** (guardar a senha do banco).
2. Em **Connect**, copiar a string do *Transaction pooler* (6543, com `?pgbouncer=true`)
   e a do *Session pooler* ou conexão direta (5432).

## Passo 2 — API na Vercel (usuário)
1. **Add New → Project**, importar o repositório do GitHub.
2. **Root Directory:** `backend`. Framework detectado: NestJS.
3. **Environment Variables**, marcadas apenas para **Production**:
   - `DATABASE_URL` = pooler do `inquilinos-prod`
   - `DIRECT_URL` = conexão direta do `inquilinos-prod`
   - `JWT_SECRET` = string nova e aleatória (o Claude gera e mostra)
   - `APP_TIMEZONE` = `America/Cuiaba`
   - `FRONTEND_URL` = `http://localhost:4200` (temporário, trocado no passo 4)
4. **Deploy.** Ao terminar, copiar a URL (ex.: `https://inquilinos-api.vercel.app`) e
   passar ao Claude.

## Passo 3 — Front na Vercel (Claude + usuário)
1. Claude: troca `URL_DA_API` em `environment.prod.ts` pela URL da API, faz commit e push.
2. Usuário: **Add New → Project**, mesmo repositório, **Root Directory:** `frontend`,
   framework Angular, pasta de saída informada pelo Claude.
3. **Deploy.** Copiar a URL do front (ex.: `https://inquilinos.vercel.app`).

## Passo 4 — Ligar os dois (usuário)
1. No projeto da API: **Settings → Environment Variables**, trocar `FRONTEND_URL` pela URL
   do front (sem barra no final).
2. **Deployments → Redeploy** do último deploy da API.

## Passo 5 — Conferência (usuário, com roteiro do Claude)
Executar no endereço público os critérios de aceite 1 a 5 de `docs/requisitos.md`, usando
duas contas de teste. Se algo falhar, copiar a mensagem do navegador ou os logs do deploy
(**Deployments → Logs** na Vercel) e colar para o Claude.

## Observações
- Variáveis apenas em **Production** evitam que deploys de *preview* rodem migrations no
  banco de produção.
- O plano gratuito da Vercel (Hobby) é para uso não comercial; revisar antes de cobrar
  pelo sistema. No plano gratuito do Supabase, projetos parados podem ser pausados.
- Mudanças futuras no banco: o Claude cria a migration em dev (`prisma migrate dev`),
  faz commit e push; o deploy da API aplica em produção.
