# Requisitos — v1

Prioridade: **E** = essencial · **v2** = adiado para depois do lançamento (modo rápido).
As regras citadas estão em `regras-de-negocio.md`.

## Requisitos funcionais

### Conta
| ID | Requisito | Prior. | Regras |
|---|---|---|---|
| RF-01 | Criar conta com nome, e-mail e senha | E | RN-02, RN-03 |
| RF-02 | Entrar com e-mail e senha e permanecer logado por 7 dias | E | — |
| RF-03 | Sair da conta | E | — |
| RF-04 | Editar nome e trocar senha (informando a atual) | v2 | RN-03 |

### Imóveis
| ID | Requisito | Prior. | Regras |
|---|---|---|---|
| RF-05 | Cadastrar e editar imóvel | E | RN-05 |
| RF-06 | Listar imóveis mostrando inquilino ativo ou "vago" | E | RN-06, RN-07 |
| RF-07 | Excluir imóvel que nunca teve inquilino | E | RN-08 |

### Inquilinos
| ID | Requisito | Prior. | Regras |
|---|---|---|---|
| RF-08 | Cadastrar inquilino em imóvel vago | E | RN-06, RN-09, RN-21 |
| RF-09 | Editar dados do inquilino | E | RN-11, RN-12 |
| RF-10 | Listar inquilinos (ativos por padrão, com opção de ver inativos) | E | RN-10 |
| RF-11 | Ver detalhe do inquilino com histórico mês a mês | E | RN-14 |
| RF-12 | Registrar saída do inquilino | E | RN-10 |
| RF-13 | Excluir inquilino cadastrado por engano | E | RN-13 |

### Pagamentos
| ID | Requisito | Prior. | Regras |
|---|---|---|---|
| RF-14 | Gerar automaticamente os meses até o mês atual | E | RN-17 a RN-21 |
| RF-15 | Marcar mês como pago, com data | E | RN-22 |
| RF-16 | Desfazer pagamento | E | RN-23 |
| RF-17 | Mostrar situação calculada: pago, aguardando, atrasado | E | RN-16 |
| RF-18 | Listar pagamentos por mês, filtrando por situação | v2 | — |
| RF-19 | Editar valor de um mês aguardando | v2 | RN-24 |

### Painel
| ID | Requisito | Prior. | Regras |
|---|---|---|---|
| RF-20 | Painel inicial com totais do mês e lista de atrasados | E | RN-26 |
| RF-21 | Marcar como pago direto do painel | E | RN-22 |
| RF-22 | Mostrar imóveis vagos e pagamentos a vencer no painel | E | RN-26 |

## Requisitos não funcionais
| ID | Requisito |
|---|---|
| RNF-01 | **Isolamento:** nenhum proprietário acessa dados de outro. Coberto por testes e2e que tentam ler, editar e excluir registros de outra conta e esperam 404. |
| RNF-02 | Senhas com bcrypt; `senhaHash` nunca sai da API. |
| RNF-03 | Somente HTTPS em produção; segredos apenas em variáveis de ambiente. |
| RNF-04 | Limite de tentativas no login. |
| RNF-05 | Responsivo: usável em celular a partir de 360px de largura. |
| RNF-06 | Painel carrega em até 2 s com 50 inquilinos (meta, plano gratuito). |
| RNF-07 | Valores monetários com 2 casas decimais exatas (`Decimal`), formatados em pt-BR. |
| RNF-08 | Datas de negócio no fuso `America/Cuiaba`. |
| RNF-09 | **LGPD:** só os dados necessários (CPF opcional); o proprietário pode excluir os dados do inquilino conforme RN-13. |
| RNF-10 | Testes unitários na lógica de geração mensal e de datas (dia 31, fevereiro, entrada no meio do mês, saída). |

## Critérios de aceite da v1
1. Crio conta, entro e vejo o painel vazio.
2. Cadastro 2 imóveis e 1 inquilino com entrada há 3 meses → aparecem 3 ou 4 meses no histórico.
3. Marco os meses antigos como pagos; o mês vencido e não pago aparece como atrasado no painel.
4. Registro a saída do inquilino → o imóvel aparece vago e o histórico continua lá.
5. Com uma segunda conta, não vejo nada da primeira, nem acessando URLs/IDs diretamente.
6. Tudo isso funcionando no endereço público da Vercel.
