# Como construir — roteiro para o Claude Code

Execute as etapas **na ordem**. Cada etapa tem um arquivo com o detalhamento e só termina
quando o "pronto quando" é verdade, com commit feito.

| Etapa | Arquivo | Quem faz |
|---|---|---|
| 0. Preparação | este arquivo | usuário (Supabase dev) + Claude |
| 1. Backend | `01-backend.md` | Claude |
| 2. Frontend | `02-frontend.md` | Claude |
| 3. Publicação | `03-deploy.md` | Claude prepara, usuário clica |

## Etapa 0 — Preparação

### O que o usuário faz (peça e espere)
1. No Supabase, criar o projeto **`inquilinos-dev`** e guardar a senha do banco.
2. Em **Connect**, copiar as duas strings de conexão:
   - *Transaction pooler* (porta 6543) → `DATABASE_URL` (acrescentar `?pgbouncer=true`
     se a string não trouxer).
   - *Session pooler* ou conexão direta (porta 5432) → `DIRECT_URL`.
3. Colar as duas em `backend/.env` (o Claude cria o arquivo a partir de `backend/.env.example`).

### O que o Claude faz
1. `git init` na raiz (se ainda não houver), com o `.gitignore` existente.
2. Criar `backend/` com o Nest CLI (`npx @nestjs/cli new backend --package-manager npm --skip-git`).
3. Criar `frontend/` com o Angular CLI (`npx @angular/cli new frontend --routing --style=scss
   --skip-git --ssr=false`) e adicionar o Angular Material (`ng add @angular/material`).
4. Criar `backend/.env` a partir do `.env.example`, gerar um `JWT_SECRET` aleatório
   (`openssl rand -hex 32`) e pedir ao usuário as duas strings do Supabase.
5. Se o `gh` estiver instalado e autenticado, criar o repositório privado no GitHub e fazer
   o push; senão, pedir ao usuário que crie um repositório vazio e informe a URL.
6. Commit: "Cria estrutura inicial do projeto".

**Pronto quando:** `backend/` e `frontend/` sobem com `npm run start:dev` / `npm start`,
o `.env` está preenchido e o primeiro commit está no GitHub.

## Regras de execução
- **Versões:** use as versões estáveis atuais. Antes de configurar o Prisma, veja a versão
  instalada e siga a documentação dela (a partir do Prisma 7, as URLs de conexão ficam em
  `prisma.config.ts` e o client usa driver adapter, `@prisma/adapter-pg`). O objetivo é o
  mesmo: app usa o pooler, migrations usam a conexão direta.
- **Testes são a rede de segurança**, já que o usuário não revisa o código linha a linha.
  Os testes listados em `01-backend.md` são obrigatórios.
- **Commits:** ao menos um por passo numerado (B1, B2, …, F1, F2, …).
- **Dúvidas menores:** escolha a opção mais simples, registre em `docs/decisoes.md` e siga.
- **Não adicione** nada da lista "Fora do escopo" do `CLAUDE.md`, nem bibliotecas além das
  citadas nos arquivos de build, sem necessidade real (registre o motivo se adicionar).
- Ao final de cada etapa, resuma para o usuário em poucas linhas: o que foi feito, o que
  ficou pendente e qual a próxima ação dele, se houver.
