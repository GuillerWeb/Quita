# Cronograma — v1 (modo rápido)

**Meta:** publicar o quanto antes. O Claude Code escreve todo o código; o usuário acompanha
por cima e faz os passos manuais no Supabase e na Vercel.

| Sessão | O que sai | Ação do usuário | Estimativa |
|---|---|---|---|
| 1 | Estrutura + backend completo com testes (`build/00` e `build/01`) | Criar `inquilinos-dev` no Supabase, colar as strings de conexão e criar o repositório no GitHub, se o Claude pedir | 1 sessão longa |
| 2 | Frontend completo funcionando local (`build/02`) | Abrir no navegador e testar o fluxo | 1 sessão |
| 3 | Sistema no ar (`build/03`) | Criar `inquilinos-prod` e os dois projetos na Vercel (~30–60 min) | 1 sessão curta |

Com sessões em dias seguidos, a v1 pode estar no ar em poucos dias. O ritmo real depende de
quantos ajustes aparecerem nos testes.

## Ordem de corte, se algo travar
1. Seção "Imóveis vagos" e "A vencer" do painel (o essencial do painel são totais e atrasados).
2. Exclusão de imóvel e de inquilino (registrar saída já cobre o uso normal).
Nunca cortar: isolamento por proprietário, geração mensal, marcar pago e painel de atrasados.

## Candidatos à v2
Recuperação de senha por e-mail, editar perfil e senha, editar valor de um mês, filtro de
pagamentos por mês, lembretes de vencimento, comprovantes, relatórios/exportação, contrato
com reajuste, plano pago (revisar planos da Vercel e do Supabase).
