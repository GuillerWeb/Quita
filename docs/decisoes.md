# Registro de decisões

Formato: decisão · motivo · alternativas descartadas. Decisões novas entram no fim, com data.

## D-01 — Back-end em NestJS (30/10/2026)
O desenvolvedor quer aprender um framework moderno junto com o projeto; Nest compartilha
TypeScript, módulos, injeção de dependência e decorators com o Angular.
*Descartado:* Spring Boot (plano inicial).

## D-02 — PostgreSQL no Supabase, em dev e em produção (30/10/2026)
Dados relacionais (proprietário → imóvel → inquilino → pagamento) e valores monetários pedem
banco relacional. Supabase evita manter servidor/VPS e traz backup e SSL.
Dois projetos separados (dev e prod).
*Descartado:* Postgres em Docker numa VPS (custo e manutenção); NoSQL.
*Nota:* o Supabase é usado só como banco. Auth e API automática do Supabase não são usados,
porque o objetivo é aprender a construir isso no Nest.

## D-03 — Front e back na Vercel (30/10/2026)
A Vercel faz deploy de NestJS sem configuração, como uma Vercel Function, e hospeda o Angular.
Consequências: usar o pooler do Supabase; sem processos em segundo plano.
*Atenção:* o plano gratuito (Hobby) é para uso não comercial. Rever antes de cobrar clientes.

## D-04 — Apenas o proprietário é usuário; vários proprietários (30/10/2026)
Cada proprietário cria sua conta e vê só os próprios dados. Inquilinos não têm acesso.

## D-05 — Pagamento é só registro: pago ou aguardando (30/10/2026)
Sem cobrança, Pix ou boleto na v1. "Atrasado" é calculado, não é um terceiro status.

## D-06 — Histórico mensal com geração ao acessar (30/10/2026)
Um registro por inquilino e mês. Os meses que faltam são criados quando o proprietário
acessa o sistema.
*Descartado:* criar o mês seguinte só ao pagar o atual (esconde dívida acumulada de
inadimplentes); cron diário (mais configuração sem ganho na v1).

## D-07 — Sem entidade de contrato na v1 (30/10/2026)
Valor e dia de vencimento ficam no inquilino; cada mês copia os valores da época.
*Custo aceito:* sem histórico formal de reajustes.

## D-08 — Um inquilino ativo por imóvel (30/10/2026)
Regra de negócio do proprietário: cada espaço é de um inquilino; quartos viram imóveis.

## D-09 — Monorepo simples + Prisma + JWT próprio (31/10/2026)
Um repositório com `backend/` e `frontend/`, um `CLAUDE.md` e um `docs/`, para chat e
Claude Code compartilharem o mesmo contexto. Prisma pelo schema legível e migrations
simples. Login com JWT no Nest para aprender o framework.
*Descartado:* dois repositórios com TypeORM (contexto dividido); Nx (curva de aprendizado
consome o prazo).

## D-10 — Token JWT no localStorage, validade de 7 dias (31/10/2026)
Front e back ficam em domínios diferentes na Vercel, o que complica cookies entre sites.
Bearer token é o caminho mais simples. *Custo aceito:* exposição a XSS, mitigada por não
usar `innerHTML` com dados do usuário. Rever se o sistema for comercializado.

## D-11 — Modo rápido: o Claude Code constrói tudo (31/10/2026)
O objetivo passou a ser publicar o quanto antes. O Claude Code escreve todo o código seguindo
`docs/build/`; o dono acompanha por cima e faz só os passos no Supabase e na Vercel.
Consequências: o cronograma deixou de ser semanal; recuperação de senha, editar perfil,
editar valor de um mês e filtro de pagamentos foram para a v2; testes automatizados
(principalmente os de isolamento) passaram a ser obrigatórios, porque substituem a revisão
linha a linha. A stack (D-01 e D-09) foi mantida para não refazer o planejamento.

## D-12 — Migrations de produção aplicadas no build da Vercel (31/10/2026)
O script `vercel-build` roda `prisma migrate deploy && nest build`, e as variáveis do banco
existem só no ambiente Production. Assim o usuário não precisa rodar comandos contra o banco
de produção. *Custo aceito:* uma migration com erro bloqueia o deploy (o que, no fim, é o
comportamento desejado).

## D-13 — Angular 21 (LTS) em vez do 22 (01/11/2026)
O Angular CLI 22 exige Node ≥ 24.15 e a máquina de desenvolvimento tem Node 24.2.
O Angular 21 é LTS e funciona com o Node instalado. *Alternativa:* atualizar o Node e migrar
com `ng update` quando for conveniente.

## D-14 — Prisma 7 com driver adapter (01/11/2026)
A versão instalada é a 7: URLs ficam em `prisma.config.ts` (CLI/migrations usam `DIRECT_URL`)
e o client usa `@prisma/adapter-pg` com `DATABASE_URL` (pooler). Gerador `prisma-client`
com saída em `src/generated/prisma` (não versionado; gerado no `postinstall`).
`dotenv` adicionado porque o Prisma 7 não carrega o `.env` sozinho.
