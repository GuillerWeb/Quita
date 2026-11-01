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

/** RN-04 / RNF-01: a conta B não enxerga nem altera nada da conta A. */
describe('Isolamento entre proprietários (e2e)', () => {
  let app: INestApplication;
  let a: Conta;
  let b: Conta;
  let imovelA: string;
  let imovelVagoA: string;
  let inquilinoA: string;
  let pagamentoA: string;
  let pagamentoPagoA: string;

  beforeAll(async () => {
    app = await criarApp();
    a = await cadastrarConta(app);
    b = await cadastrarConta(app);

    imovelA = (await a.api.post('/imoveis', { nome: 'Casa da A' })).body.id;
    imovelVagoA = (await a.api.post('/imoveis', { nome: 'Kitnet da A' })).body
      .id;
    const inquilino = await a.api.post('/inquilinos', {
      imovelId: imovelA,
      nome: 'Inquilino da A',
      valorAluguel: '1000.00',
      diaVencimento: 5,
      dataEntrada: somarMeses(hoje().slice(0, 8) + '01', -2),
    });
    expect(inquilino.status).toBe(201);
    inquilinoA = inquilino.body.id;
    pagamentoA = inquilino.body.pagamentos[0].id;
    pagamentoPagoA = inquilino.body.pagamentos[1].id;
    const pago = await a.api.patch(`/pagamentos/${pagamentoPagoA}/pagar`, {});
    expect(pago.status).toBe(200);
  });

  afterAll(async () => {
    await removerContas(app, [a.email, b.email]);
    await app.close();
  });

  it('imóvel da A: GET, PATCH e DELETE pela B → 404', async () => {
    const url = `/imoveis/${imovelVagoA}`;
    expect((await b.api.get(url)).status).toBe(404);
    expect((await b.api.patch(url, { nome: 'Invadido' })).status).toBe(404);
    expect((await b.api.delete(url)).status).toBe(404);
    expect((await b.api.get(`/imoveis/${imovelA}`)).status).toBe(404);
  });

  it('inquilino da A: GET, PATCH, DELETE e saída pela B → 404', async () => {
    const url = `/inquilinos/${inquilinoA}`;
    expect((await b.api.get(url)).status).toBe(404);
    expect((await b.api.patch(url, { nome: 'Invadido' })).status).toBe(404);
    expect((await b.api.delete(url)).status).toBe(404);
    expect(
      (await b.api.post(`${url}/saida`, { dataSaida: hoje() })).status,
    ).toBe(404);
  });

  it('pagamento da A: pagar e desfazer pela B → 404', async () => {
    expect(
      (await b.api.patch(`/pagamentos/${pagamentoA}/pagar`, {})).status,
    ).toBe(404);
    expect(
      (await b.api.patch(`/pagamentos/${pagamentoPagoA}/desfazer`)).status,
    ).toBe(404);
  });

  it('B não cadastra inquilino em imóvel da A → 404', async () => {
    const res = await b.api.post('/inquilinos', {
      imovelId: imovelVagoA,
      nome: 'Intruso',
      valorAluguel: '500.00',
      diaVencimento: 10,
      dataEntrada: hoje(),
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Imóvel não encontrado');
  });

  it('listagens e painel da B não trazem nada da A', async () => {
    expect((await b.api.get('/imoveis')).body).toEqual([]);
    for (const filtro of ['true', 'false', 'todos']) {
      expect((await b.api.get(`/inquilinos?ativos=${filtro}`)).body).toEqual(
        [],
      );
    }
    const painel = (await b.api.get('/painel')).body;
    expect(painel.totais).toEqual({
      esperado: '0.00',
      recebido: '0.00',
      aguardando: '0.00',
    });
    expect(painel.atrasados).toEqual([]);
    expect(painel.aVencer).toEqual([]);
    expect(painel.imoveisVagos).toEqual([]);
  });

  it('os dados da A continuam intactos depois das tentativas da B', async () => {
    const imovel = await a.api.get(`/imoveis/${imovelVagoA}`);
    expect(imovel.status).toBe(200);
    expect(imovel.body.nome).toBe('Kitnet da A');

    const inquilino = await a.api.get(`/inquilinos/${inquilinoA}`);
    expect(inquilino.body.nome).toBe('Inquilino da A');
    expect(inquilino.body.ativo).toBe(true);
    const pago = inquilino.body.pagamentos.find(
      (p: { id: string }) => p.id === pagamentoPagoA,
    );
    expect(pago.status).toBe('PAGO');
    const aberto = inquilino.body.pagamentos.find(
      (p: { id: string }) => p.id === pagamentoA,
    );
    expect(aberto.status).toBe('AGUARDANDO');
  });

  it('id malformado também responde 404', async () => {
    expect((await b.api.get('/imoveis/nao-e-uuid')).status).toBe(404);
  });

  it('nenhuma resposta contém senhaHash', () => {
    for (const corpo of respostas) expect(corpo).not.toContain('senhaHash');
  });
});
