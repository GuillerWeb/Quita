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

## D-15 — Detalhes da API decididos na construção do backend (01/11/2026)
- `:id` que não é UUID responde **404** com a mensagem do recurso (não 400), para não
  distinguir "id inválido" de "registro de outra conta" (RN-04).
- Mensagens de validação em português, inclusive campo não permitido
  (`forbidNonWhitelisted`): "O campo X não é permitido".
- Campos de texto opcionais enviados como `""` ou `null` limpam o valor.
- `POST /inquilinos` e `POST /inquilinos/:id/saida` devolvem o detalhe do inquilino
  (mesmo formato de `GET /inquilinos/:id`).
- Desfazer um mês que não está pago → 409. Saída com data futura é aceita (os meses
  continuam sendo gerados até a data de saída).
- Itens de `aVencer` no painel trazem também `nome` (inquilino) e `imovel` (nome),
  necessários para a tela.
- `trust proxy` ligado no Express, para o limite de login usar o IP real atrás da Vercel.

## D-16 — Decisões da construção do frontend (07/11/2026)
- **Paleta das telas, não do guia:** o `DESIGN.md` do Stitch fala em fundo "osso" `#F5F6F3`,
  mas as telas usam `#f2fbff`. Seguimos as telas (fonte da verdade visual). Ver `docs/Designs/MAPA.md`.
- **Sem `@angular/animations`:** o Angular Material 21 não depende mais dele, então
  `provideAnimationsAsync()` não foi usado.
- **Campos "preenchidos" do Material** com o rótulo acima do campo (como no design), em vez
  do rótulo flutuante.
- **Datas:** adaptador próprio do datepicker para ler `dd/mm/aaaa` (o nativo lê no formato
  americano). "Hoje" no navegador é só o valor padrão dos campos; quem valida é a API (fuso de Cuiabá).
- **Valor do aluguel:** o usuário digita `1.200,50`; convertemos para `"1200.50"` com
  strings/centavos, sem float.
- **O que os designs mostram e ficou de fora** (fora do escopo ou sem dado na API): filtro do
  mês, novo lançamento, exercício, resumo do livro-caixa, exportar, recibos, lembretes por
  WhatsApp, busca, filtros "em dia/em atraso", paginação, pontualidade, caução, termos de
  contrato, forma de pagamento e observação na quitação, "esqueceu a senha", "lembrar de mim",
  termos de uso. Lista completa em `docs/Designs/MAPA.md`.
- **Adaptações:**
  - painel: o botão principal virou "Novo inquilino"; nas pendências, a régua mostra só os
    meses atrasados (a API do painel não traz o histórico completo). Cada mês da régua é
    clicável, e o botão marca o mais antigo;
  - lista de inquilinos: sem a régua de 6 meses por linha (a lista da API não traz os meses);
    os indicadores são "ativos", "em atraso" e "aluguéis por mês";
  - detalhe: a régua mostra os últimos 12 meses (e não o ano civil); o cabeçalho não tem
    breadcrumb de contrato nem ID.
- **Sem versão mobile no design:** no celular, o menu vira gaveta (`mat-sidenav`), as
  tabelas viram cartões e a coluna de apresentação do login some.

## D-17 — RLS habilitado em todas as tabelas, sem políticas (07/11/2026)
- **Motivo:** o Security Advisor do Supabase acusava "RLS Disabled in Public". Com o RLS
  desligado, a Data API do Supabase (roles `anon`/`authenticated`) poderia ler e alterar as
  tabelas com a chave pública do projeto.
- **Como:** a migration `habilita_rls` faz `ENABLE ROW LEVEL SECURITY` em `Proprietario`,
  `Imovel`, `Inquilino`, `Pagamento` e `_prisma_migrations`, **sem políticas**: a Data API
  fica sem acesso. O backend usa só o Prisma com o usuário `postgres`, dono das tabelas, que
  não passa pelo RLS (não usamos `FORCE ROW LEVEL SECURITY`).
- **Regra:** toda tabela nova habilita o RLS na própria migration que a cria (regra 11 do
  `CLAUDE.md`). Para `_prisma_migrations` usa-se `ALTER TABLE IF EXISTS`, porque a shadow
  database do `prisma migrate dev` não tem essa tabela.

## D-18 — Início da cobrança escolhido no cadastro do inquilino (07/11/2026)
- **Pedido do dono do projeto:** na maioria dos aluguéis o primeiro pagamento é no mês
  seguinte à entrada, mas proprietários com contratos em andamento precisam cobrar já no
  mês da entrada. A RN-18 passou a ter as duas opções, com `MES_SEGUINTE` como padrão.
- **Salvo no inquilino** (`inicioCobranca`), porque a geração mensal recalcula os meses a
  cada acesso; não é editável depois, pelo mesmo motivo da data de entrada (RN-11).
- **Inquilinos já cadastrados** ficaram com `MES_DA_ENTRADA` na migration `inicio_cobranca`,
  a regra com que os meses deles foram gerados.
- **Prévia no formulário:** o cadastro mostra "Primeiro vencimento: dd/mm/aaaa", calculado no
  frontend só para exibição; quem gera os meses continua sendo a API.

## D-19 — Node 24 fixado no backend (`engines`)
O `@nestjs/throttler` é CommonJS e faz `require()` do `@nestjs/common` 12, que é só ESM.
Isso só funciona em Node com `require(esm)` estável (Node 24, o usado em dev). Na Vercel,
o runtime padrão quebrava com `ERR_REQUIRE_ESM`; `"engines": { "node": "24.x" }` no
`backend/package.json` fixa a mesma versão em produção.

## D-20 — Limitador de login próprio no lugar do `@nestjs/throttler`
Mesmo com Node 24 (D-19), a função na Vercel continuou caindo com `ERR_REQUIRE_ESM`: o
carregador de módulos da Vercel não aceita `require()` de ESM. O `@nestjs/throttler` era o
único pacote CommonJS que carregava o Nest 12 (só ESM). Foi trocado por
`LimiteTentativasGuard` (`src/auth/limite-tentativas.guard.ts`): 5 tentativas/minuto por IP
e rota, em memória — mesmo comportamento que o throttler tinha (memória por instância).
Antes de adicionar dependência CommonJS que importe `@nestjs/*`, testar com
`node --no-experimental-require-module dist/main.js`.

## D-21 — Sem `await` no topo do `main.ts` e conexão com o banco sob demanda
Na Vercel, a função ficava sem responder (nem rota inexistente, sem log): o `await bootstrap()`
no topo do módulo segurava o carregamento até o `listen()`, que a Vercel só libera depois do
carregamento. `main.ts` chama `bootstrap()` sem `await`. Além disso, o `PrismaService` não
conecta mais no início (conecta na primeira consulta, com timeouts de 10–15 s) e registra no
log o host:porta do `DATABASE_URL` (sem senha). API de produção: https://quita-one.vercel.app.

## D-22 — Verificação do e-mail no cadastro (MX no backend, sugestão no frontend)
Para reduzir contas criadas com e-mail digitado errado (o proprietário não teria como
recuperar a conta, já que não há recuperação de senha na v1):
- **Backend** (`VerificadorEmailService`, chamado em `AuthService.cadastrar` depois da checagem
  de e-mail duplicado): consulta `dns.promises.resolveMx(domínio)` com timeout de 3 s.
  - `ENOTFOUND` (domínio não existe), `ENODATA` (sem MX), lista vazia ou "Null MX"
    (RFC 7505, `exchange` vazio — ex.: `example.com`) → **400** "O domínio do e-mail não parece
    existir. Confira se digitou corretamente."
  - Timeout ou qualquer outro erro de DNS/rede (`ETIMEOUT`, `ESERVFAIL`, `ECONNREFUSED`…) →
    **aceita** o cadastro e registra um aviso no log. A falha é nossa, não de quem se cadastra.
  - Não se aplica ao login nem a e-mails de inquilinos.
- **Frontend** (`core/sugestao-email.ts`): ao sair do campo de e-mail do cadastro, sugere a
  correção para gmail.com, hotmail.com, outlook.com, yahoo.com.br e icloud.com
  ("Você quis dizer fulano@gmail.com?"); um clique aceita. **Não bloqueia o envio.**
  - Sugere quando o nome do provedor está certo e o final errado (`gmail.con`, `gmail.com.br`)
    ou quando o domínio está a até 2 letras de distância (1 em domínios curtos), contando troca
    de letras vizinhas (`gmial`).
  - Domínios reais parecidos não ganham sugestão: `hotmail.com.br`, `outlook.com.br`,
    `yahoo.com`, `ymail.com`, `email.com`, `mail.com`, `live.com` etc.
  - O 400 de domínio aparece no próprio campo de e-mail, como o "já cadastrado".
