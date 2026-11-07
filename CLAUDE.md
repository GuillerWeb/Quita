# Sistema de Gestão de Inquilinos

Aplicação web para proprietários de imóveis de aluguel substituírem agendas, anotações e
planilhas de Excel. O proprietário cria uma conta (e-mail e senha), cadastra seus imóveis e
inquilinos e acompanha, mês a mês, quem já pagou, quem está aguardando e quem está atrasado.

## Modo de trabalho
**Objetivo: colocar a v1 no ar o mais rápido possível.** O Claude Code escreve todo o código;
o dono do projeto acompanha por cima e só faz as etapas manuais no Supabase e na Vercel.
- Siga `docs/build/00-como-construir.md` e execute as etapas na ordem.
- Não pare para perguntar o que os documentos já respondem. Diante de uma dúvida menor,
  escolha a opção mais simples que respeite as regras, registre-a em `docs/decisoes.md` e siga.
- Pare e peça ao usuário **somente** o que só ele pode fazer: strings de conexão do Supabase,
  criar o repositório no GitHub (se o `gh` não estiver disponível) e os passos da Vercel.
- Ao final de cada etapa: testes passando, build sem erros e commit.

## Contexto (leia antes de implementar)
@docs/escopo.md
@docs/regras-de-negocio.md
@docs/modelo-de-dados.md
@docs/arquitetura.md

Instruções de construção: `docs/build/` · Requisitos: `docs/requisitos.md` ·
Decisões: `docs/decisoes.md` · Cronograma: `docs/cronograma.md`

## Stack
- `frontend/` — Angular (versão estável atual, standalone components, signals) + Angular Material
- `backend/` — NestJS + Prisma + PostgreSQL (Supabase)
- Deploy: Vercel (dois projetos no mesmo repositório: raiz `frontend/` e raiz `backend/`)
- Banco: Supabase, um projeto para dev e outro para produção

## Comandos
```bash
# backend
cd backend
npm run start:dev                 # API local (http://localhost:3000)
npx prisma migrate dev            # cria/aplica migration em dev
npm test                          # testes unitários
npm run test:e2e                  # testes e2e (usam o banco de dev)
npm run build

# frontend
cd frontend
npm start                         # Angular local (http://localhost:4200)
npm run build
```

## Regras inegociáveis para o código
1. **Isolamento por proprietário.** O `proprietarioId` vem SEMPRE do JWT (`req.user.id`),
   nunca do body, da URL ou de query string.
2. Toda consulta de imóvel, inquilino ou pagamento filtra por `proprietarioId`.
   Nunca use `findUnique({ where: { id } })` sozinho; use `findFirst({ where: { id, proprietarioId } })`.
3. Registro que não pertence ao proprietário logado → `404 Not Found` (nunca 403).
4. Dinheiro é `Decimal` (Prisma `@db.Decimal(10, 2)`) e trafega na API como string (`"1200.00"`).
   Nunca `number`/`float` em cálculo de valores no backend.
5. Datas de vencimento e pagamento são datas sem hora (`@db.Date`) e trafegam como
   `"YYYY-MM-DD"`. "Hoje" vem do helper `hoje()`, no fuso `APP_TIMEZONE` (padrão `America/Cuiaba`).
6. Senhas com bcrypt. Nunca devolva `senhaHash` em nenhuma resposta.
7. DTOs com `class-validator`; `ValidationPipe` global com `whitelist: true`,
   `forbidNonWhitelisted: true` e `transform: true`.
8. Segredos só em variáveis de ambiente. Nunca commitar `.env`.
9. "Atrasado" não é salvo no banco: é calculado (`AGUARDANDO` + vencimento < hoje).
10. Mensagens de erro e textos de tela em português.
11. Toda tabela nova deve ter RLS habilitado na própria migration que a cria.

## Convenções
- Código, nomes de entidades e rotas em português (`inquilinos`, `imoveis`, `pagamentos`).
- Um módulo Nest por domínio: `auth`, `imoveis`, `inquilinos`, `pagamentos`, `painel`, `prisma`.
- Cada módulo: `*.controller.ts`, `*.service.ts`, `dto/`. Regra de negócio fica no service.
- Commits pequenos, mensagem em português no imperativo ("Adiciona cadastro de imóvel").

## Fora do escopo da v1 (não implementar sem pedido explícito)
Acesso de inquilinos, cobrança (Pix, boleto, gateway), envio de e-mails/WhatsApp,
recuperação de senha, editar perfil/senha, anexos de comprovante, relatórios/exportação,
reajuste de contrato, editar valor de um mês, filtro de pagamentos por mês,
múltiplos usuários por conta.
