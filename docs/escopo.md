# Escopo — v1

## Problema
Proprietários com vários imóveis de aluguel controlam inquilinos e pagamentos em agendas,
anotações e planilhas de Excel. Isso é fácil de esquecer, difícil de consultar e não mostra
com clareza quem está devendo e desde quando.

## Objetivo
Uma aplicação web em que o proprietário abre o sistema e sabe na hora:
- quais imóveis tem e quem mora em cada um;
- quem já pagou o mês, quem está aguardando e quem está atrasado;
- o histórico de pagamentos de cada inquilino, mês a mês.

O proprietário não precisa lembrar de criar nada: os meses de cobrança aparecem sozinhos.

## Usuário
Somente o **proprietário**. Ele cria a própria conta com e-mail e senha.
Inquilinos são apenas registros cadastrados pelo proprietário e **não têm nenhum acesso**.

## Sucesso
- O proprietário consegue abandonar a planilha/agenda para controlar aluguéis.
- Nenhum proprietário consegue ver dados de outro, em nenhuma circunstância.
- Sistema publicado na web **o mais rápido possível** (ver `cronograma.md`).

## Dentro da v1
- Cadastro de conta e login (e-mail e senha).
- Cadastro, edição e listagem de imóveis.
- Cadastro, edição e listagem de inquilinos (um por imóvel), com valor e dia de vencimento.
- Registro de saída do inquilino (mantém histórico, libera o imóvel).
- Geração automática dos registros mensais de pagamento.
- Marcar mês como pago (com data) e desfazer.
- Histórico de pagamentos por inquilino.
- Painel com a situação do mês atual, os atrasados, os pagamentos a vencer e os imóveis vagos.
- Exclusão de imóvel ou inquilino cadastrado por engano (com as travas das regras).

## Fora da v1 (não-objetivos)
- Acesso de inquilinos ao sistema.
- Cobrança: Pix, boleto, cartão, gateway de pagamento.
- Envio de lembretes por e-mail, SMS ou WhatsApp.
- Anexar comprovantes ou contratos.
- Relatórios, gráficos e exportação.
- Reajuste de aluguel com histórico de contrato.
- Mais de um inquilino por imóvel (quartos divididos).
- Recuperação de senha por e-mail, editar perfil e trocar senha.
- Editar o valor de um mês específico e filtrar pagamentos por mês (candidatos à v2).

## Antiobjetivos (seria um fracasso mesmo funcionando)
- Um proprietário enxergar qualquer dado de outro.
- Dívida de inquilino inadimplente ficar escondida (meses que não aparecem).
- Ser mais trabalhoso de usar do que a planilha que substitui.
- Perder histórico de pagamentos por uma exclusão acidental.
