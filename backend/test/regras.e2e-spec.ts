import { INestApplication } from '@nestjs/common';
import { hoje } from '../src/comum/datas.js';
import {
  cadastrarConta,
  criarApp,
  removerContas,
  respostas,
  somarMeses,
  type Conta,
} from './utilitarios.js';

interface Pagamento {
  id: string;
  competencia: string;
  status: string;
  situacao: string;
  dataPagamento: string | null;
}

const dia = hoje();
const inicioDoMesAtual = dia.slice(0, 8) + '01';
const mes = (deslocamento: number) =>
  somarMeses(inicioDoMesAtual, deslocamento).slice(0, 7);

describe('Regras de negócio (e2e)', () => {
  let app: INestApplication;
  let conta: Conta;

  const criarImovel = async (nome: string): Promise<string> => {
    const res = await conta.api.post('/imoveis', { nome });
    expect(res.status).toBe(201);
    return res.body.id;
  };

  const criarInquilino = (imovelId: string, extra: object = {}) =>
    conta.api.post('/inquilinos', {
      imovelId,
      nome: 'Inquilino de Teste',
      valorAluguel: '1200.00',
      diaVencimento: 1,
      dataEntrada: somarMeses(inicioDoMesAtual, -3),
      ...extra,
    });

  beforeAll(async () => {
    app = await criarApp();
    conta = await cadastrarConta(app);
  });

  afterAll(async () => {
    await removerContas(app, [conta.email]);
    await app.close();
  });

  it('RN-06: segundo inquilino ativo no mesmo imóvel → 409', async () => {
    const imovel = await criarImovel('Casa RN-06');
    expect((await criarInquilino(imovel)).status).toBe(201);
    const segundo = await criarInquilino(imovel, { nome: 'Segundo' });
    expect(segundo.status).toBe(409);
    expect(segundo.body.message).toBe('Este imóvel já tem um inquilino ativo');
  });

  it('RN-21: entrada há 3 meses gera os meses certos, até o mês atual', async () => {
    const imovel = await criarImovel('Casa RN-21');
    // Entrada no dia 1 de 3 meses atrás, vencimento dia 1 → 4 meses.
    const res = await criarInquilino(imovel);
    expect(res.status).toBe(201);
    expect(res.body.pagamentos.map((p: Pagamento) => p.competencia)).toEqual([
      mes(0),
      mes(-1),
      mes(-2),
      mes(-3),
    ]);
    expect(res.body.pagamentos[3]).toMatchObject({
      valor: '1200.00',
      dataVencimento: somarMeses(inicioDoMesAtual, -3),
      status: 'AGUARDANDO',
      situacao: 'ATRASADO',
    });

    // Entrada no dia 15 de 3 meses atrás com vencimento dia 10 → começa no mês seguinte (RN-18).
    const outro = await criarImovel('Casa RN-18');
    const res2 = await criarInquilino(outro, {
      diaVencimento: 10,
      dataEntrada: somarMeses(inicioDoMesAtual, -3).slice(0, 8) + '15',
    });
    expect(res2.body.pagamentos.map((p: Pagamento) => p.competencia)).toEqual([
      mes(0),
      mes(-1),
      mes(-2),
    ]);
  });

  it('RN-17: GET /inquilinos/:id duas vezes não duplica meses', async () => {
    const imovel = await criarImovel('Casa RN-17');
    const { id } = (await criarInquilino(imovel)).body;
    const primeira = await conta.api.get(`/inquilinos/${id}`);
    const segunda = await conta.api.get(`/inquilinos/${id}`);
    await conta.api.get('/inquilinos');
    await conta.api.get('/painel');
    const terceira = await conta.api.get(`/inquilinos/${id}`);
    expect(primeira.body.pagamentos).toHaveLength(4);
    expect(segunda.body.pagamentos).toHaveLength(4);
    expect(terceira.body.pagamentos).toHaveLength(4);
    expect(terceira.body.resumo).toEqual({
      mesesAtrasados: expect.any(Number),
      valorDevido: expect.any(String),
    });
  });

  it('RN-22/23: pagar (com data, sem data futura) e desfazer', async () => {
    const imovel = await criarImovel('Casa RN-22');
    const inquilino = (await criarInquilino(imovel)).body;
    const maisAntigo: Pagamento = inquilino.pagamentos[3];

    const futuro = await conta.api.patch(`/pagamentos/${maisAntigo.id}/pagar`, {
      dataPagamento: somarMeses(inicioDoMesAtual, 1),
    });
    expect(futuro.status).toBe(400);
    expect(futuro.body.message).toBe('A data de pagamento não pode ser futura');

    const pago = await conta.api.patch(`/pagamentos/${maisAntigo.id}/pagar`, {
      dataPagamento: somarMeses(inicioDoMesAtual, -3),
    });
    expect(pago.status).toBe(200);
    expect(pago.body).toMatchObject({
      status: 'PAGO',
      situacao: 'PAGO',
      dataPagamento: somarMeses(inicioDoMesAtual, -3),
    });
    expect(
      (await conta.api.patch(`/pagamentos/${maisAntigo.id}/pagar`, {})).status,
    ).toBe(409);

    const semData = await conta.api.patch(
      `/pagamentos/${inquilino.pagamentos[2].id}/pagar`,
    );
    expect(semData.status).toBe(200);
    expect(semData.body.dataPagamento).toBe(dia);

    const desfeito = await conta.api.patch(
      `/pagamentos/${maisAntigo.id}/desfazer`,
    );
    expect(desfeito.status).toBe(200);
    expect(desfeito.body).toMatchObject({
      status: 'AGUARDANDO',
      situacao: 'ATRASADO',
      dataPagamento: null,
    });
  });

  it('painel mostra o atrasado com quantidade de meses e valor devido', async () => {
    const imovel = await criarImovel('Casa Painel');
    const inquilino = (await criarInquilino(imovel, { nome: 'Devedor' })).body;
    const painel = (await conta.api.get('/painel')).body;
    const atrasado = painel.atrasados.find(
      (a: { inquilinoId: string }) => a.inquilinoId === inquilino.id,
    );
    // Vencimento dia 1: os 3 meses anteriores estão atrasados; o atual também,
    // exceto se hoje for dia 1.
    const meses = dia.endsWith('-01') ? 3 : 4;
    expect(atrasado).toMatchObject({
      nome: 'Devedor',
      imovel: 'Casa Painel',
      meses,
      valorDevido: (1200 * meses).toFixed(2),
    });
    expect(atrasado.pagamentos[0].competencia).toBe(mes(-3));
    expect(painel.competencia).toBe(mes(0));
    expect(painel.hoje).toBe(dia);
  });

  it('RN-10: saída remove meses futuros em aberto, libera o imóvel e mantém o histórico', async () => {
    const imovel = await criarImovel('Casa RN-10');
    // Vencimento dia 28: o mês atual vence depois da saída (dia 1 deste mês).
    const inquilino = (await criarInquilino(imovel, { diaVencimento: 28 }))
      .body;
    expect(inquilino.pagamentos).toHaveLength(4);

    const antes = await conta.api.post(`/inquilinos/${inquilino.id}/saida`, {
      dataSaida: somarMeses(inicioDoMesAtual, -4),
    });
    expect(antes.status).toBe(400);
    expect(antes.body.message).toBe(
      'A data de saída não pode ser anterior à entrada',
    );

    const saida = await conta.api.post(`/inquilinos/${inquilino.id}/saida`, {
      dataSaida: inicioDoMesAtual,
    });
    expect(saida.status).toBe(200);
    expect(saida.body.ativo).toBe(false);
    expect(saida.body.dataSaida).toBe(inicioDoMesAtual);
    expect(saida.body.pagamentos.map((p: Pagamento) => p.competencia)).toEqual([
      mes(-1),
      mes(-2),
      mes(-3),
    ]);

    // Saída de novo → 409; detalhe continua acessível sem gerar meses novos.
    expect(
      (
        await conta.api.post(`/inquilinos/${inquilino.id}/saida`, {
          dataSaida: dia,
        })
      ).status,
    ).toBe(409);
    expect(
      (await conta.api.get(`/inquilinos/${inquilino.id}`)).body.pagamentos,
    ).toHaveLength(3);

    const imoveis = (await conta.api.get('/imoveis')).body;
    expect(
      imoveis.find((i: { id: string }) => i.id === imovel).inquilinoAtivo,
    ).toBeNull();
    const painel = (await conta.api.get('/painel')).body;
    expect(
      painel.imoveisVagos.some((i: { id: string }) => i.id === imovel),
    ).toBe(true);

    const ativos = (await conta.api.get('/inquilinos')).body;
    const inativos = (await conta.api.get('/inquilinos?ativos=false')).body;
    expect(ativos.some((i: { id: string }) => i.id === inquilino.id)).toBe(
      false,
    );
    expect(inativos.some((i: { id: string }) => i.id === inquilino.id)).toBe(
      true,
    );

    // Imóvel liberado aceita novo inquilino; com histórico, não pode ser excluído (RN-08).
    expect((await criarInquilino(imovel, { dataEntrada: dia })).status).toBe(
      201,
    );
    const excluir = await conta.api.delete(`/imoveis/${imovel}`);
    expect(excluir.status).toBe(409);
  });

  it('RN-13: excluir inquilino com mês pago → 409; sem pagamento → 204', async () => {
    const imovel = await criarImovel('Casa RN-13');
    const comPago = (await criarInquilino(imovel)).body;
    await conta.api.patch(`/pagamentos/${comPago.pagamentos[3].id}/pagar`, {});
    const recusado = await conta.api.delete(`/inquilinos/${comPago.id}`);
    expect(recusado.status).toBe(409);
    expect(recusado.body.message).toBe(
      'Inquilino com pagamentos registrados não pode ser excluído; registre a saída',
    );

    const outroImovel = await criarImovel('Casa RN-13b');
    const semPago = (await criarInquilino(outroImovel)).body;
    expect((await conta.api.delete(`/inquilinos/${semPago.id}`)).status).toBe(
      204,
    );
    expect((await conta.api.get(`/inquilinos/${semPago.id}`)).status).toBe(404);
    // Excluído o cadastro feito por engano, o imóvel fica sem histórico (RN-08).
    expect((await conta.api.delete(`/imoveis/${outroImovel}`)).status).toBe(
      204,
    );
  });

  it('RN-11/12: editar não aceita imóvel nem entrada; valor novo não muda meses gerados', async () => {
    const imovel = await criarImovel('Casa RN-12');
    const inquilino = (await criarInquilino(imovel)).body;
    const proibido = await conta.api.patch(`/inquilinos/${inquilino.id}`, {
      dataEntrada: dia,
    });
    expect(proibido.status).toBe(400);
    expect(proibido.body.message).toContain(
      'O campo dataEntrada não é permitido',
    );

    const editado = await conta.api.patch(`/inquilinos/${inquilino.id}`, {
      valorAluguel: '1500.00',
      cpf: '123.456.789-09',
    });
    expect(editado.status).toBe(200);
    expect(editado.body.valorAluguel).toBe('1500.00');
    expect(editado.body.cpf).toBe('12345678909');
    const detalhe = (await conta.api.get(`/inquilinos/${inquilino.id}`)).body;
    expect(
      detalhe.pagamentos.every((p: { valor: string }) => p.valor === '1200.00'),
    ).toBe(true);
  });

  it('nenhuma resposta contém senhaHash', () => {
    for (const corpo of respostas) expect(corpo).not.toContain('senhaHash');
  });
});
