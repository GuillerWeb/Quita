# Mapa dos designs (Stitch) → telas do sistema

Fonte da verdade visual: as imagens `screen.png`. O `code.html` serve só para extrair valores.
O guia `modern_ledger/DESIGN.md` descreve o sistema, mas **as telas usam uma paleta um pouco
diferente** (fundo azulado `#f2fbff` em vez do "osso" `#F5F6F3`). Vale o que está nas telas.

## Telas desenhadas

| Pasta | Rota | Observações |
|---|---|---|
| `quita_login` | `/login` | Duas colunas: apresentação com régua de exemplo à esquerda, formulário à direita. |
| `quita_cadastro` | `/cadastro` | Mesmo layout do login; mostra erro de campo (e-mail já cadastrado). |
| `quita_painel_desktop` | `/` (painel) | Recebido de esperado + barra de progresso, pendências com régua, a vencer, vagos. |
| `quita_im_veis_estado_vazio` | `/imoveis` (vazio) | Estado vazio com régua "folha em branco" e botão Cadastrar imóvel. |
| `quita_inquilinos` | `/inquilinos` | Cartões de indicadores, tabela com avatar, imóvel, aluguel/vencimento, situação. |
| `quita_detalhe_do_inquilino` | `/inquilinos/:id` | Cabeçalho com contato e ações, régua anual, histórico em tabela, diálogo de quitação. |

## Telas sem design (seguir o estilo das desenhadas)
- `/imoveis` com itens (lista) — usar a tabela de `quita_inquilinos`.
- `/imoveis/novo`, `/imoveis/:id/editar` — formulário em painel branco, campos do login/cadastro.
- `/inquilinos/novo`, `/inquilinos/:id/editar` — idem.
- Diálogos de registrar saída e de confirmação (excluir, desfazer) — estilo do diálogo de quitação.
- Versão mobile de todas as telas (nenhuma foi desenhada): menu vira `mat-sidenav`; tabelas
  viram listas de cartões; layout de login vira uma coluna (apresentação escondida).

## Tokens visuais

### Cores (das telas)
| Token | Hex | Uso |
|---|---|---|
| `fundo` | `#f2fbff` | Fundo da página (canvas) |
| `superficie` | `#ffffff` | Cartões, painéis, menu lateral |
| `superficie-baixa` | `#e8f6fd` | Campos de formulário, chips neutros, faixas de legenda |
| `superficie-media` | `#e2f0f7` | Cabeçalho de tabela, botão secundário |
| `superficie-alta` | `#dceaf1` | Trilho da barra de progresso, hover de botão secundário |
| `texto` | `#101d22` | Texto principal e números |
| `texto-suave` | `#404945` | Texto secundário |
| `contorno` | `#707974` | Ícones neutros |
| `divisoria` | `#c0c9c3` (≈ `#DDE2DD` no guia) | Linhas finas de 1px |
| `primaria` | `#2e5e4e` | Botões, item ativo do menu, "Pago", logo |
| `primaria-escura` | `#144637` | Hover de botão primário, valores recebidos |
| `primaria-clara` | `#baeed9` | Fundo do selo "Pago" / "Em dia" |
| `aguardando` | `#795900` (texto) / `#c79a2e` (preenchimento) | "Aguardando", "vence em" |
| `aguardando-claro` | `#ffdf9f` | Fundo do selo "Aguardando" |
| `atrasado` | `#9d2b38` (≈ `#A3303C`) | "Atrasado", valores devidos |
| `atrasado-claro` | `#ffdada` | Fundo do selo "Atrasado", avatar de devedor |
| `erro` | `#ba1a1a` / fundo `#ffdad6` | Erros de formulário |
| `futuro` | `#f2fbff` com borda `#c0c9c3` | Mês futuro/sem registro na régua |
| `sombreamento-modal` | `rgba(16, 29, 34, 0.4)` | Fundo do diálogo |

### Tipografia
- **Space Grotesk** (500/600/700, `tabular-nums`): títulos e números.
  - `display` 36/44 700 −0.02em · `titulo-lg` 28/36 600 · `titulo-lg-mobile` 22/28 600
  - `titulo-md` 20/28 600 · `titulo-sm` 16/24 600 · `numero-destaque` 32/40 700 · `numero-tabela` 15/20 600
- **Atkinson Hyperlegible Next** (400/600/700): corpo, campos, rótulos.
  - `corpo-lg` 16/24 · `corpo-md` 14/20 · `corpo-sm` 12/16 · `rotulo-md` 13/18 600 · `rotulo-sm` 11/14 600 +0.04em (maiúsculas)
- **Schibsted Grotesk** 700: só no texto da logo.
- Ícones: **Material Symbols Outlined**.

### Espaçamento, raios e bordas
- Escala: 4 · 8 · 16 · 24 · 40 px (`xs`, `sm`, `md`, `lg`, `xl`); margem da página 32 px
  (16 px no celular); largura máxima do conteúdo 1280 px; menu lateral 320 px.
- Raios: 4 px (régua, selos) · 8 px (botões, campos) · 12 px (cartões, painéis) · 16 px (diálogo) · 999 px (chips, avatar).
- Bordas: 1 px sólida na cor `divisoria`. Sem sombras (só um contorno leve nos cartões).
- Campos: altura 48 px no login/cadastro, fundo `superficie-baixa`, sem borda; foco com borda `primaria`.
- Linhas de tabela: 56–90 px, divisória inferior de 1 px, hover com fundo `fundo`.

## Componentes repetidos → `src/app/compartilhado/`
| Componente | Onde aparece |
|---|---|
| `logo` (3 quadrados + "quita", SVG) | login, cadastro, menu lateral |
| `regua-meses` (quadrados 24–44 px com ✓ / ! / relógio / vazio + inicial do mês) | login, cadastro, painel, inquilinos, detalhe, estado vazio |
| `selo-situacao` (ponto + texto: Pago, Aguardando, Atrasado, Em dia, N meses atrasado) | painel, inquilinos, detalhe |
| `avatar` (iniciais em círculo; vermelho claro para devedor) | painel, inquilinos, detalhe |
| `chip-contador` ("2 pendências", "3 programados", "5 ativos") | painel, inquilinos, imóveis |
| `estado-vazio` (régua em branco + texto + botão) | imóveis, e reaproveitado nas outras listas |
| Layout interno (menu lateral com "Menu principal", cartão do usuário com sair, barra superior) | todas as telas internas |
| Diálogo (cabeçalho com ícone, resumo em faixa clara, ações à direita) | quitação; base para saída e confirmações |

## O que os designs mostram e a v1 não faz (não implementar)
- Painel: "Filtro do mês", "Novo lançamento", "Exercício 2024", "Vigência ativa",
  "Resumo do Livro-Caixa" (contratos, reconciliação, taxa de ocupação), "Exportar extrato",
  "Gerar recibos", botão de enviar lembrete (avião de papel).
- Login/cadastro: "Esqueceu a senha?", "Lembrar de mim", aceite de Termos/Política,
  "Simular quitação".
- Inquilinos: "Exportar", busca, filtros "Em dia / Em atraso", paginação, cartões de
  pontualidade e "Total em carteira", lembretes por WhatsApp, histórico de 6 meses por linha
  (a API de lista não traz os meses).
- Detalhe: "Total quitado", "Pontualidade", "Depósito caução", termos de contrato, dados do
  imóvel (quartos, metragem, IPTU), "Exportar PDF", recibos, forma de pagamento e
  observação no diálogo de quitação, horário do pagamento.
- Imóveis vazio: cartões de "Juros e multas" e "Recibos timbrados".
