# Arquitetura — v1

```
[Navegador] ──► Angular (Vercel) ──HTTPS + JWT──► API NestJS (Vercel Function) ──► PostgreSQL (Supabase)
```

## Repositório
```
sistema-inquilinos/
├── CLAUDE.md
├── docs/                 # escopo, regras, requisitos, modelo, arquitetura, decisões, cronograma
├── backend/              # NestJS + Prisma
│   ├── prisma/schema.prisma
│   └── src/
│       ├── main.ts       # bootstrap padrão (a Vercel detecta src/main.ts)
│       ├── prisma/       # PrismaService (singleton)
│       ├── auth/         # cadastro, login, JwtStrategy, JwtAuthGuard, @UsuarioAtual()
│       ├── imoveis/
│       ├── inquilinos/
│       ├── pagamentos/   # inclui GeracaoMensalService (RN-17 a RN-21)
│       ├── painel/
│       └── comum/        # utilitários de data (hoje no fuso, último dia do mês)
└── frontend/             # Angular
    └── src/app/
        ├── core/         # AuthService, interceptor do token, guard de rota
        ├── paginas/      # login, cadastro, painel, imoveis, inquilinos, inquilino-detalhe
        └── compartilhado/
```

## Backend (NestJS)
- **Autenticação:** `@nestjs/jwt` + `@nestjs/passport` (estratégia JWT). Token Bearer com
  validade de 7 dias, payload `{ sub: proprietarioId, email }`. `JwtAuthGuard` global; rotas
  públicas marcadas com `@Publico()` (apenas cadastro e login).
- **Proprietário logado:** decorator `@UsuarioAtual()` devolve `req.user.id`. Os services
  recebem `proprietarioId` como primeiro parâmetro em todos os métodos.
- **Validação:** `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
- **Proteção do login:** `@nestjs/throttler` (ex.: 5 tentativas/minuto por IP em `/auth/login`).
- **CORS:** liberado só para `FRONTEND_URL`.
- **Geração mensal:** `GeracaoMensalService.garantirMeses(proprietarioId)` é chamada no
  início de `GET /painel`, `GET /inquilinos` e `GET /inquilinos/:id`, e ao criar um inquilino.
  Usa `createMany({ skipDuplicates: true })` apoiado no `@@unique([inquilinoId, competencia])`.
  Sem cron e sem processo em segundo plano (compatível com serverless).
- **Datas:** helper único `hoje()` que devolve a data em `APP_TIMEZONE`. Nunca usar
  `new Date()` direto em regra de negócio. A lógica de datas tem testes unitários.

## API REST

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/cadastro` | cria conta (público) |
| POST | `/auth/login` | devolve `{ token, proprietario }` (público) |
| GET | `/auth/eu` | dados do proprietário logado |
| GET | `/imoveis` | lista imóveis com inquilino ativo (ou vago) |
| POST | `/imoveis` | cria imóvel |
| GET/PATCH/DELETE | `/imoveis/:id` | detalhe, edição, exclusão (RN-08) |
| GET | `/inquilinos?ativos=true\|false\|todos` | lista inquilinos |
| POST | `/inquilinos` | cria inquilino e gera meses retroativos (RN-21) |
| GET/PATCH/DELETE | `/inquilinos/:id` | detalhe com histórico, edição, exclusão (RN-13) |
| POST | `/inquilinos/:id/saida` | registra data de saída (RN-10) |
| PATCH | `/pagamentos/:id/pagar` | `{ dataPagamento }` (RN-22) |
| PATCH | `/pagamentos/:id/desfazer` | volta para aguardando (RN-23) |
| GET | `/painel` | resumo do mês atual e atrasados (RN-26) |

Respostas de pagamento incluem o campo calculado `situacao`: `PAGO`, `AGUARDANDO` ou `ATRASADO`.

## Frontend (Angular)
- Standalone components, rotas com lazy loading, Angular Material para formulários e tabelas.
- `AuthService` guarda o token no `localStorage`; um interceptor adiciona
  `Authorization: Bearer`; resposta 401 limpa o token e volta para o login.
- Telas: login, cadastro, painel (tela inicial), imóveis, inquilinos (lista e formulário),
  detalhe do inquilino (dados + histórico mês a mês com ação de marcar pago).
  Detalhamento completo em `docs/build/02-frontend.md`; contratos da API em `docs/build/01-backend.md`.
- Valores exibidos em `pt-BR` (`R$ 1.200,00`, `dd/MM/yyyy`). Layout responsivo: o
  proprietário provavelmente vai usar no celular.

## Ambientes e variáveis
| Variável | Onde | Exemplo |
|---|---|---|
| `DATABASE_URL` | backend | pooler Supabase, porta 6543, `?pgbouncer=true` |
| `DIRECT_URL` | backend | conexão direta Supabase, porta 5432 |
| `JWT_SECRET` | backend | string aleatória longa (diferente em dev e prod) |
| `FRONTEND_URL` | backend | `http://localhost:4200` / domínio Vercel do front |
| `APP_TIMEZONE` | backend | `America/Cuiaba` |
| `apiUrl` | frontend (`environment.ts`) | `http://localhost:3000` / domínio Vercel do back |

- **Supabase:** dois projetos, `inquilinos-dev` e `inquilinos-prod`.
- **Vercel:** dois projetos ligados ao mesmo repositório; Root Directory `backend/` e
  `frontend/`. O build do backend (`vercel-build`) roda `prisma migrate deploy && nest build`,
  então as migrations de produção são aplicadas a cada deploy. Variáveis só no ambiente
  Production. Passo a passo em `docs/build/03-deploy.md`.
