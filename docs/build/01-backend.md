# Etapa 1 — Backend (NestJS + Prisma)

Base: `docs/modelo-de-dados.md`, `docs/regras-de-negocio.md`, `docs/arquitetura.md`.
Todos os erros respondem no formato padrão do Nest (`{ statusCode, message }`), com
`message` em português.

## B1 — Configuração base
- Dependências: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`,
  `passport-jwt`, `@nestjs/throttler`, `class-validator`, `class-transformer`, `bcrypt`,
  `prisma`, `@prisma/client` (e o adapter, se a versão exigir).
- `main.ts`: `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`);
  CORS com `origin: process.env.FRONTEND_URL`; `app.listen(process.env.PORT ?? 3000)`.
  Manter o `bootstrap()` padrão: a Vercel detecta `src/main.ts`.
- `ConfigModule.forRoot({ isGlobal: true })`.
- `package.json`: `"postinstall": "prisma generate"` e
  `"vercel-build": "prisma migrate deploy && nest build"` (ver `03-deploy.md`).

## B2 — Prisma e banco
- Schema exatamente como em `docs/modelo-de-dados.md`.
- `npx prisma migrate dev --name inicial`; depois, editar a migration para incluir o índice
  único parcial `inquilino_um_ativo_por_imovel` e reaplicar (ou criar uma segunda migration
  com `--create-only` só com o índice).
- `PrismaModule` global com `PrismaService` (estende `PrismaClient`, conecta em `onModuleInit`).

## B3 — Utilitários de data (`src/comum/datas.ts`)
Funções puras, sem dependência de framework, todas trabalhando com strings `YYYY-MM-DD`
ou objetos `{ ano, mes, dia }`:
- `hoje(tz = process.env.APP_TIMEZONE ?? 'America/Cuiaba')`: data de hoje no fuso, via
  `Intl.DateTimeFormat('en-CA', { timeZone: tz })`. Sem bibliotecas de data.
- `vencimentoNoMes(ano, mes, diaVencimento)`: aplica a RN-20 (dia inexistente → último dia).
- `primeiroVencimento(dataEntrada, diaVencimento)`: aplica a RN-18.
- `vencimentosAte(dataEntrada, diaVencimento, limite)`: lista de `{ competencia, dataVencimento }`
  do primeiro vencimento até o limite (RN-19).
- Conversão entre string e `Date` do Prisma sempre em UTC meia-noite, para não "voltar um dia".

**Testes unitários obrigatórios (`datas.spec.ts`):**
- dia 31 em fevereiro de ano comum e bissexto; dia 30 em fevereiro; dia 31 em abril;
- entrada antes, no dia e depois do dia de vencimento no mesmo mês;
- virada de ano (vencimentos de nov/2026 a fev/2027);
- `hoje()` às 23h30 de Cuiabá já é o dia seguinte em UTC → deve devolver o dia de Cuiabá.

## B4 — Autenticação (`auth`)
- `POST /auth/cadastro` `{ nome (1–100), email (válido), senha (8–72) }`
  → `201 { token, proprietario: { id, nome, email } }`. E-mail em minúsculas e sem espaços.
  E-mail existente → `409 "E-mail já cadastrado"`.
- `POST /auth/login` `{ email, senha }` → `200 { token, proprietario }`.
  Falha → `401 "E-mail ou senha inválidos"` (mesma mensagem para e-mail inexistente e senha errada).
- `GET /auth/eu` → `{ id, nome, email }`.
- bcrypt com custo 10. JWT com `expiresIn: '7d'`, payload `{ sub, email }`.
- `JwtAuthGuard` registrado como `APP_GUARD`; decorator `@Publico()` para cadastro e login.
- Decorator `@UsuarioAtual()` → `{ id, email }` do token.
- Throttler apenas nas rotas de auth: 5 requisições por minuto por IP.

## B5 — Imóveis (`imoveis`)
- DTO: `nome` (obrigatório, 1–100, trim), `endereco` (opcional, até 200).
- `GET /imoveis` → lista ordenada por nome:
  `[{ id, nome, endereco, inquilinoAtivo: { id, nome } | null }]`.
- `POST /imoveis`, `GET /imoveis/:id`, `PATCH /imoveis/:id`.
- `DELETE /imoveis/:id` → `204`; se já teve qualquer inquilino →
  `409 "Este imóvel tem histórico de inquilinos e não pode ser excluído"` (RN-08).
- Validar `:id` como UUID (`ParseUUIDPipe`); id de outro proprietário → `404 "Imóvel não encontrado"`.

## B6 — Inquilinos (`inquilinos`)
- `CriarInquilinoDto`: `imovelId` (UUID), `nome` (1–100), `telefone?` (até 20),
  `email?` (válido), `cpf?` (aceita com ou sem máscara, salva só os 11 dígitos),
  `observacoes?` (até 500), `valorAluguel` (string decimal > 0, até 2 casas, ex. `"1200.00"`),
  `diaVencimento` (inteiro 1–31), `dataEntrada` (`YYYY-MM-DD`).
- `POST /inquilinos`: verifica se o imóvel é do proprietário (senão 404) e está vago
  (senão `409 "Este imóvel já tem um inquilino ativo"`). Cria o inquilino e chama a geração
  mensal (RN-21), na mesma transação.
- `AtualizarInquilinoDto`: os mesmos campos, todos opcionais, **exceto** `imovelId` e
  `dataEntrada`, que não existem nesse DTO (RN-11).
- `GET /inquilinos?ativos=true|false|todos` (padrão `true`) → lista ordenada por nome com
  `imovel { id, nome }`, `valorAluguel`, `diaVencimento`, `ativo` e `mesesAtrasados`.
- `GET /inquilinos/:id` → chama a geração mensal e devolve o inquilino com `imovel`,
  `pagamentos` (competência mais recente primeiro, cada um com `situacao`) e
  `resumo: { mesesAtrasados, valorDevido }`.
- `POST /inquilinos/:id/saida` `{ dataSaida }`: precisa ser ≥ `dataEntrada`
  (`400 "A data de saída não pode ser anterior à entrada"`); inquilino já inativo → `409`.
  Remove meses `AGUARDANDO` com vencimento posterior à saída. Meses em aberto anteriores
  continuam (RN-10).
- `DELETE /inquilinos/:id` → `204`; se algum mês está `PAGO` →
  `409 "Inquilino com pagamentos registrados não pode ser excluído; registre a saída"` (RN-13).

## B7 — Pagamentos e geração mensal (`pagamentos`)
- `GeracaoMensalService.garantirMeses(proprietarioId)`:
  1. busca os inquilinos do proprietário com `dataSaida` nula **ou** posterior ao último
     mês gerado, junto com a maior `competencia` já gerada de cada um;
  2. limite = último dia do mês atual (`hoje()`) ou a `dataSaida`, o que vier primeiro;
  3. calcula com `vencimentosAte` só os meses depois do último gerado;
  4. `createMany({ data, skipDuplicates: true })` copiando `valorAluguel` e `proprietarioId`.
  É idempotente: duas chamadas seguidas não criam nada a mais.
- Chamado no início de `GET /painel`, `GET /inquilinos/:id`, `GET /inquilinos` e `POST /inquilinos`.
- `situacao` calculada em um único lugar (`calcularSituacao(pagamento, hoje)`):
  `PAGO` | `ATRASADO` (aguardando e vencimento < hoje) | `AGUARDANDO`.
- `PATCH /pagamentos/:id/pagar` `{ dataPagamento? }` (padrão: `hoje()`); data futura →
  `400 "A data de pagamento não pode ser futura"`; já pago → `409`.
- `PATCH /pagamentos/:id/desfazer` → volta a `AGUARDANDO` e limpa `dataPagamento`.
- Formato de pagamento na API:
  `{ id, inquilinoId, competencia: "2026-10", valor: "1200.00", dataVencimento, status,
  situacao, dataPagamento }`.

## B8 — Painel (`painel`)
`GET /painel` (chama `garantirMeses` antes):
```json
{
  "competencia": "2026-10",
  "hoje": "2026-10-31",
  "totais": { "esperado": "3600.00", "recebido": "2400.00", "aguardando": "1200.00" },
  "atrasados": [
    { "inquilinoId": "…", "nome": "…", "imovel": "…", "meses": 2, "valorDevido": "2400.00",
      "pagamentos": [ /* pagamentos atrasados, mais antigo primeiro */ ] }
  ],
  "aVencer": [ /* pagamentos AGUARDANDO do mês atual ainda não vencidos, por data */ ],
  "imoveisVagos": [ { "id": "…", "nome": "…" } ]
}
```
Totais consideram apenas a competência atual. Somas com `Prisma.Decimal`.

## B9 — Testes e2e obrigatórios (`test/*.e2e-spec.ts`)
Rodam contra o banco de dev. Cada teste cria contas com e-mail aleatório
(`teste-<uuid>@exemplo.com`) e remove o que criou ao final.
1. **Auth:** cadastro, e-mail duplicado (409), login certo e errado, rota protegida sem token (401).
2. **Isolamento (o mais importante):** a conta B tenta `GET`, `PATCH` e `DELETE` em imóvel,
   inquilino e pagamento da conta A, além de `POST /inquilinos` usando um imóvel da conta A
   → tudo `404`. Listagens da B não trazem nada da A.
3. **Regras:** segundo inquilino ativo no mesmo imóvel → 409; inquilino com entrada há
   3 meses gera os meses certos; `GET /inquilinos/:id` duas vezes não duplica meses; pagar e
   desfazer; saída remove os meses futuros em aberto e libera o imóvel; excluir inquilino com
   mês pago → 409.
4. Nenhuma resposta contém `senhaHash`.

**Pronto quando:** `npm test` e `npm run test:e2e` passam, `npm run build` funciona e o
fluxo do critério de aceite 1 a 5 (`docs/requisitos.md`) funciona via HTTP.
