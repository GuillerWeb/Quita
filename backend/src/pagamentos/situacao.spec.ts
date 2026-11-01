import { paraDate } from '../comum/datas.js';
import { Prisma } from '../generated/prisma/client.js';
import { calcularSituacao, paraPagamentoResposta } from './situacao.js';

describe('calcularSituacao (RN-16)', () => {
  const venc = paraDate('2026-10-10');

  it('pago é sempre PAGO, mesmo vencido', () => {
    expect(
      calcularSituacao({ status: 'PAGO', dataVencimento: venc }, '2026-12-01'),
    ).toBe('PAGO');
  });

  it('aguardando com vencimento anterior a hoje é ATRASADO', () => {
    expect(
      calcularSituacao(
        { status: 'AGUARDANDO', dataVencimento: venc },
        '2026-10-11',
      ),
    ).toBe('ATRASADO');
  });

  it('aguardando que vence hoje ainda não está atrasado', () => {
    expect(
      calcularSituacao(
        { status: 'AGUARDANDO', dataVencimento: venc },
        '2026-10-10',
      ),
    ).toBe('AGUARDANDO');
  });
});

describe('paraPagamentoResposta', () => {
  it('formata competência, valor e datas como strings', () => {
    expect(
      paraPagamentoResposta(
        {
          id: 'g1',
          inquilinoId: 'q1',
          competencia: paraDate('2026-10-01'),
          valor: new Prisma.Decimal('1200'),
          dataVencimento: paraDate('2026-10-10'),
          status: 'PAGO',
          dataPagamento: paraDate('2026-10-09'),
        },
        '2026-11-01',
      ),
    ).toEqual({
      id: 'g1',
      inquilinoId: 'q1',
      competencia: '2026-10',
      valor: '1200.00',
      dataVencimento: '2026-10-10',
      status: 'PAGO',
      situacao: 'PAGO',
      dataPagamento: '2026-10-09',
    });
  });
});
