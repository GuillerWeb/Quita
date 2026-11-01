# Regras de negócio — v1

Cada regra tem um código (RN-xx) para ser citada em código, testes e conversas.
Regras marcadas com *(decisão de projeto)* foram propostas durante o planejamento e aceitas
como padrão; podem ser revistas.

## Conta e acesso
- **RN-01** O único usuário do sistema é o proprietário. Inquilinos não têm conta nem acesso.
- **RN-02** A conta é criada com nome, e-mail e senha. O e-mail é único e salvo em minúsculas.
- **RN-03** Senha com no mínimo 8 caracteres, armazenada apenas como hash (bcrypt).
- **RN-04** Cada proprietário enxerga e altera **somente** os próprios imóveis, inquilinos e
  pagamentos. Um registro de outro proprietário é tratado como inexistente (404).

## Imóveis
- **RN-05** Um imóvel tem nome/identificação (ex.: "Casa 2 — Rua A") e endereço opcional.
- **RN-06** Um imóvel tem **no máximo um inquilino ativo** por vez. Não existe divisão de
  quartos: cada espaço alugado é cadastrado como um imóvel.
- **RN-07** Imóvel sem inquilino ativo aparece como **vago**.
- **RN-08** Um imóvel só pode ser excluído se nunca teve inquilino. Caso contrário, pode
  apenas ser editado. *(decisão de projeto — protege o histórico)*

## Inquilinos
- **RN-09** Ao cadastrar um inquilino, informa-se: imóvel (vago), nome, valor do aluguel,
  dia de vencimento (1 a 31) e data de entrada. Telefone, e-mail, CPF e observações são
  opcionais.
- **RN-10** Inquilino **ativo** = sem data de saída. Ao registrar a data de saída, o inquilino
  passa a inativo, o imóvel fica vago e o histórico é mantido, inclusive meses em aberto.
- **RN-11** O inquilino não muda de imóvel. Para isso, registra-se a saída e cadastra-se
  novamente no outro imóvel. A data de entrada também não é editável depois do cadastro;
  se foi digitada errado, exclui-se e cadastra-se de novo (RN-13). *(decisão de projeto —
  evita recalcular meses já gerados)*
- **RN-12** Alterar o valor do aluguel ou o dia de vencimento vale apenas para os meses que
  ainda **não foram gerados**. Meses já gerados mantêm os valores da época.
- **RN-13** Um inquilino só pode ser excluído se nenhum mês dele estiver como pago. Ao
  excluir, os meses aguardando são removidos juntos. Com algum mês pago, só é possível
  registrar a saída. *(decisão de projeto — para corrigir cadastro feito por engano)*

## Pagamentos (registros mensais)
- **RN-14** Cada inquilino tem **um registro por mês de referência** (ex.: 10/2026), com:
  valor, data de vencimento, status e data de pagamento.
- **RN-15** Status salvos: `AGUARDANDO` ou `PAGO`. Não há outros.
- **RN-16** **Atrasado** é calculado, nunca salvo: status `AGUARDANDO` e data de vencimento
  anterior a hoje.
- **RN-17** **Geração automática:** sempre que o proprietário acessa o sistema (painel,
  lista ou detalhe de inquilino), o sistema cria os meses que faltam para cada
  inquilino, do primeiro mês até o mês atual. A operação é idempotente: nunca duplica.
- **RN-18** O primeiro mês é o do primeiro vencimento **igual ou posterior** à data de entrada.
  Ex.: entrada em 20/10 com vencimento dia 10 → primeiro vencimento 10/11. *(decisão de projeto)*
- **RN-19** Os meses gerados vão até o mês atual, mesmo que o vencimento deste mês ainda não
  tenha chegado. Para inquilino com saída registrada, vão até o último vencimento igual ou
  anterior à data de saída.
- **RN-20** Dia de vencimento que não existe no mês (29, 30, 31) vira o último dia daquele mês.
  Ex.: dia 31 em fevereiro → 28/02 (ou 29/02).
- **RN-21** Cadastrar inquilino com data de entrada no passado gera os meses retroativos, para
  o proprietário marcar o que já foi pago.
- **RN-22** Marcar como pago exige a data do pagamento (padrão: hoje) e não aceita data futura.
- **RN-23** Um mês pago pode voltar para aguardando (desfazer engano); a data de pagamento
  é apagada.
- **RN-24** *(adiada para a v2)* Editar o valor de um mês específico enquanto aguardando
  (ex.: desconto combinado).
- **RN-25** "Hoje" é sempre a data no fuso `America/Cuiaba`, nunca a do servidor (UTC).

## Painel
- **RN-26** O painel mostra, para o mês atual: total esperado, total recebido e total
  aguardando; a lista de inquilinos com meses atrasados (de qualquer mês), com quantidade de
  meses e valor devido; os pagamentos do mês ainda a vencer; e os imóveis vagos.
