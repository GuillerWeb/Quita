# Etapa 2 — Frontend (Angular + Angular Material)
 
Consome a API descrita em `01-backend.md`. Prioridade: simples, claro e bom no celular.
O usuário típico é um proprietário pouco técnico que hoje usa caderno ou Excel.
 
## Design de referência: `docs/Designs/`
O visual do sistema foi modelado no Stitch e está em `docs/Designs/`. **Essa pasta é a fonte
da verdade visual**: cores, fontes, espaçamentos, layout das telas, logo e componentes.
 
**Quem decide o quê:**
- **Visual** (aparência, disposição, textos de tela): vale o que está em `docs/Designs/`.
- **Comportamento** (campos, validações, rotas, regras, chamadas à API): vale este documento
  e `01-backend.md`. Se um design mostrar um campo, botão ou dado que a API não oferece, ou
  algo da lista "Fora do escopo" do `CLAUDE.md`, não implemente; registre a diferença em
  `docs/decisoes.md`.
- **Telas sem design** (por exemplo, formulários de imóvel ou inquilino, se não existirem na
  pasta): construa seguindo o mesmo estilo das telas desenhadas, reaproveitando os mesmos
  componentes e tokens.
**Como usar a pasta:**
- O Stitch exporta, em geral, uma imagem (`.png`) e um código (`.html`, com Tailwind) por
  tela. Use a **imagem como referência visual** e o **HTML para extrair valores exatos**:
  cores, fontes, tamanhos, espaçamentos, raios e textos.
- **Não copie o HTML/Tailwind para o projeto** e não instale Tailwind. Reimplemente as telas
  em componentes Angular com SCSS e Angular Material customizado.
- Se a pasta tiver arquivos de logo (SVG/PNG), use-os em `frontend/src/assets/`. Se a logo
  existir só como imagem de tela, recrie-a em SVG fiel ao desenho.
- Ao comparar o resultado com o design, abra a tela no navegador (360px e 1280px) e ajuste
  até ficar fiel. Diferenças pequenas por limitação do Material são aceitáveis; registre-as.
## F0 — Levantamento do design (antes de codar)
1. Liste todos os arquivos de `docs/Designs/` e crie `docs/Designs/MAPA.md` relacionando cada
   tela desenhada à rota do sistema (ex.: `login.png` → `/login`) e anotando as telas
   que **não** têm design.
2. Extraia os tokens visuais (cores com hex, famílias de fonte e pesos, escala de tamanhos,
   espaçamentos, raios, bordas) e registre-os no próprio `MAPA.md`.
3. Liste os componentes que se repetem entre as telas (ex.: régua de meses, selo de
   situação, linha de inquilino, barra de progresso do mês, menu lateral) para virarem
   componentes compartilhados em `src/app/compartilhado/`.
4. Commit: "Mapeia designs do Stitch".
## F1 — Base e tema
- Standalone components, rotas com `loadComponent`, signals para estado local.
- `provideHttpClient(withInterceptors([...]))`, `provideAnimationsAsync()`.
- Localização: `registerLocaleData(localePt)`, `LOCALE_ID: 'pt-BR'`,
  `DEFAULT_CURRENCY_CODE: 'BRL'`. Valores com `currency`, datas com `date:'dd/MM/yyyy'`;
  converter a string da API com `Number()` só para exibir.
- `environment.ts` → `apiUrl: 'http://localhost:3000'`; `environment.prod.ts` →
  `apiUrl: 'URL_DA_API'` (placeholder trocado na etapa 3). Configurar o `fileReplacements`
  do build de produção, se o CLI não fizer.
- **Tema:** tokens do `MAPA.md` viram variáveis CSS em `src/styles/_tokens.scss` e um tema
  customizado do Angular Material (cores, tipografia, raios), para que os componentes do
  Material fiquem com a cara do design. Fontes carregadas do Google Fonts no `index.html`.
- Componentes compartilhados levantados no F0 (régua de meses, selo de situação etc.),
  cada um com entradas tipadas e sem dependência de API.
## F2 — Autenticação
- `AuthService`: `cadastrar`, `entrar`, `sair`, signal `proprietario`, token no
  `localStorage` (chave `inquilinos.token`, leitura em try/catch).
- Interceptor: adiciona `Authorization: Bearer`; em `401` limpa o token e vai para `/login`.
- `authGuard` nas rotas internas; quem já está logado e abre `/login` vai para `/`.
- Telas `/login` e `/cadastro` **conforme o design**, com validação e mensagens em
  português nos campos, botão com estado de carregamento e mensagem de erro da API.
## F3 — Layout interno (template)
- Estrutura **conforme o design** (menu, cabeçalho, área de conteúdo), com os itens
  **Painel**, **Imóveis**, **Inquilinos** e **Sair**. No celular (< 768px), seguir a versão
  mobile do design; se não houver, o menu vira um `mat-sidenav` aberto pelo ícone de menu.
- Snackbar para confirmações ("Pagamento registrado") e erros, no estilo do design.
- Ações destrutivas (excluir, registrar saída, desfazer pagamento) pedem confirmação em
  `MatDialog`, nunca `window.confirm`.
- Estados vazios com orientação e botão de ação (usar o estado vazio do design, se houver).
## F4 — Painel (`/`, tela inicial)
Layout e forma de apresentar os totais **conforme o design**. Conteúdo obrigatório:
- Totais do mês atual: **esperado**, **recebido** e **aguardando**.
- **Atrasados:** um item por inquilino com nome, imóvel, meses em atraso e valor devido;
  cada mês atrasado tem a ação **Marcar como pago**. Sem atrasados, mostrar
  "Nenhum pagamento atrasado".
- **A vencer este mês:** pagamentos do mês ainda não vencidos, com data e **Marcar como pago**.
- **Imóveis vagos:** lista curta com link para cadastrar inquilino naquele imóvel.
- Marcar como pago abre um diálogo com a data (padrão hoje, sem datas futuras) e recarrega
  o painel.
## F5 — Imóveis
- `/imoveis`: lista com nome, endereço e inquilino atual ou o selo **Vago**; botão
  **Novo imóvel**. Imóvel vago tem a ação **Cadastrar inquilino**.
- `/imoveis/novo` e `/imoveis/:id/editar`: formulário com nome e endereço. Na edição,
  botão **Excluir** (a API recusa se houver histórico; mostrar a mensagem).
## F6 — Inquilinos
- `/inquilinos`: lista com nome, imóvel, valor, dia de vencimento e selo de atraso;
  alternância **Ativos / Inativos**; botão **Novo inquilino**.
- `/inquilinos/novo` (aceita `?imovelId=` para vir preenchido): seletor só com imóveis
  vagos; nome; valor (campo numérico com prefixo R$, enviado como string `"1200.00"`); dia de
  vencimento (1–31); data de entrada (datepicker); telefone, e-mail, CPF e observações
  opcionais. Sem imóvel vago, orientar a cadastrar um imóvel primeiro.
- Aviso no formulário: "Se a data de entrada for antiga, os meses anteriores serão criados
  para você marcar o que já foi pago."
- `/inquilinos/:id/editar`: mesmos campos, sem imóvel e sem data de entrada.
## F7 — Detalhe do inquilino (`/inquilinos/:id`)
Layout **conforme o design**. Conteúdo obrigatório:
- Cabeçalho: nome, imóvel, valor, vencimento todo dia X, contato e o status ativo/inativo.
- Resumo: meses em atraso e valor devido.
- **Histórico:** mês (`out/2026`), vencimento, valor, situação **com cor e com texto**
  (Pago, Aguardando, Atrasado), data de pagamento e ação **Marcar como pago** ou **Desfazer**.
  No celular, seguir a versão mobile do design (lista em vez de tabela, se não houver).
- Ações: **Editar**, **Registrar saída** (diálogo com data) e **Excluir** (só aparece sem
  meses pagos).
## Acessibilidade e qualidade
- Situação nunca indicada só por cor: sempre com texto.
- Contraste adequado, foco visível e `aria-label` nos botões só com ícone.
- Sem animações decorativas além das que estiverem no design.
- Testar nas larguras de 360px e 1280px, comparando lado a lado com as telas de
  `docs/Designs/`.
**Pronto quando:** `npm run build` gera o build de produção sem erros, todo o fluxo dos
critérios de aceite 1 a 5 (`docs/requisitos.md`) funciona no navegador com a API local e as
telas desenhadas estão fiéis ao design (diferenças registradas em `docs/decisoes.md`).