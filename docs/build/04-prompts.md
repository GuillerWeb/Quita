# Prompts para colar no Claude Code

Abra o Claude Code na pasta raiz do projeto (onde está o `CLAUDE.md`) e use um prompt por
sessão. Se a sessão ficar longa, use `/clear` e o prompt da próxima etapa: o contexto está
todo nos arquivos.

## Sessão 1 — Preparação e backend
> Leia o CLAUDE.md e docs/build/00-como-construir.md. Execute a Etapa 0 e me peça as
> strings de conexão do Supabase quando precisar. Depois execute toda a Etapa 1
> (docs/build/01-backend.md), do B1 ao B9, com um commit por passo. Só pare para me pedir o
> que só eu posso fazer. No fim, me mostre o resultado dos testes.

## Sessão 2 — Frontend
> Leia o CLAUDE.md e docs/build/02-frontend.md. Execute toda a Etapa 2, do F1 ao F7, com um
> commit por passo. Rode o backend e o frontend localmente e confira o fluxo dos critérios de
> aceite 1 a 5 de docs/requisitos.md. No fim, me diga como abrir e testar no navegador.

## Sessão 3 — Publicação
> Leia o CLAUDE.md e docs/build/03-deploy.md. Faça a parte "Antes", depois me guie pelos
> passos 1 a 5, um de cada vez, esperando eu confirmar cada um.

## Quando algo der errado
> Deu este erro: [cole a mensagem ou o log]. Descubra a causa, corrija, rode os testes e
> faça commit.
