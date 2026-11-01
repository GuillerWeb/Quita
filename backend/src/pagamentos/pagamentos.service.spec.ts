import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { deDate, paraDate } from '../comum/datas.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PagamentosService } from './pagamentos.service.js';

function criarServico(status: 'AGUARDANDO' | 'PAGO' | null) {
  const prisma = {
    pagamento: {
      findFirst: vi.fn().mockResolvedValue(status ? { status } : null),
      update: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'g1',
          inquilinoId: 'q1',
          competencia: paraDate('2026-10-01'),
          valor: new Prisma.Decimal('1200'),
          dataVencimento: paraDate('2026-10-10'),
          ...data,
        }),
      ),
    },
  };
  return {
    servico: new PagamentosService(prisma as unknown as PrismaService),
    prisma,
  };
}

describe('PagamentosService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-01T19:00:00Z'));
    process.env.APP_TIMEZONE = 'America/Cuiaba';
  });

  afterEach(() => vi.useRealTimers());

  it('RN-22: sem data, paga com a data de hoje', async () => {
    const { servico, prisma } = criarServico('AGUARDANDO');
    const resposta = await servico.pagar('p1', 'g1', {});
    const { where, data } = prisma.pagamento.update.mock.calls[0][0];
    expect(where).toEqual({ id: 'g1', proprietarioId: 'p1' });
    expect(deDate(data.dataPagamento)).toBe('2026-11-01');
    expect(resposta.situacao).toBe('PAGO');
  });

  it('RN-22: data futura → 400', async () => {
    const { servico } = criarServico('AGUARDANDO');
    await expect(
      servico.pagar('p1', 'g1', { dataPagamento: '2026-11-02' }),
    ).rejects.toThrow(
      new BadRequestException('A data de pagamento não pode ser futura'),
    );
  });

  it('já pago → 409', async () => {
    const { servico } = criarServico('PAGO');
    await expect(servico.pagar('p1', 'g1', {})).rejects.toThrow(
      ConflictException,
    );
  });

  it('pagamento de outro proprietário → 404', async () => {
    const { servico } = criarServico(null);
    await expect(servico.pagar('p2', 'g1', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('RN-23: desfazer volta para aguardando e apaga a data', async () => {
    const { servico, prisma } = criarServico('PAGO');
    const resposta = await servico.desfazer('p1', 'g1');
    expect(prisma.pagamento.update.mock.calls[0][0].data).toEqual({
      status: 'AGUARDANDO',
      dataPagamento: null,
    });
    expect(resposta.situacao).toBe('ATRASADO');
    expect(resposta.dataPagamento).toBeNull();
  });
});
