import { paraDate } from '../comum/datas.js';
import { Prisma } from '../generated/prisma/client.js';
import { GeracaoMensalService } from '../pagamentos/geracao-mensal.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PainelService } from './painel.service.js';

function pagamento(
  id: string,
  inquilinoId: string,
  competencia: string,
  vencimento: string,
  status: 'AGUARDANDO' | 'PAGO',
  valor = '1200.00',
) {
  return {
    id,
    inquilinoId,
    competencia: paraDate(competencia),
    valor: new Prisma.Decimal(valor),
    dataVencimento: paraDate(vencimento),
    status,
    dataPagamento: status === 'PAGO' ? paraDate(vencimento) : null,
    inquilino: { nome: `Inquilino ${inquilinoId}`, imovel: { nome: 'Casa' } },
  };
}

describe('PainelService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-15T19:00:00Z')); // 15/11/2026 em Cuiabá
    process.env.APP_TIMEZONE = 'America/Cuiaba';
  });

  afterEach(() => vi.useRealTimers());

  it('calcula totais do mês, agrupa atrasados e lista a vencer', async () => {
    const doMes = [
      pagamento('a', 'q1', '2026-11-01', '2026-11-10', 'AGUARDANDO'),
      pagamento('b', 'q2', '2026-11-01', '2026-11-05', 'PAGO', '800.50'),
      pagamento('c', 'q3', '2026-11-01', '2026-11-20', 'AGUARDANDO', '999.99'),
    ];
    const atrasados = [
      pagamento('x', 'q1', '2026-10-01', '2026-10-10', 'AGUARDANDO'),
      pagamento('a', 'q1', '2026-11-01', '2026-11-10', 'AGUARDANDO'),
    ];
    const findMany = vi
      .fn()
      .mockResolvedValueOnce(doMes)
      .mockResolvedValueOnce(atrasados);
    const prisma = {
      pagamento: { findMany },
      imovel: {
        findMany: vi.fn().mockResolvedValue([{ id: 'i9', nome: 'Kitnet' }]),
      },
    };
    const geracao = { garantirMeses: vi.fn().mockResolvedValue(0) };
    const servico = new PainelService(
      prisma as unknown as PrismaService,
      geracao as unknown as GeracaoMensalService,
    );

    const painel = await servico.resumo('p1');

    expect(geracao.garantirMeses).toHaveBeenCalledWith('p1');
    expect(findMany.mock.calls[0][0].where.proprietarioId).toBe('p1');
    expect(findMany.mock.calls[1][0].where.proprietarioId).toBe('p1');
    expect(painel.competencia).toBe('2026-11');
    expect(painel.hoje).toBe('2026-11-15');
    expect(painel.totais).toEqual({
      esperado: '3000.49',
      recebido: '800.50',
      aguardando: '2199.99',
    });
    expect(painel.atrasados).toHaveLength(1);
    expect(painel.atrasados[0]).toMatchObject({
      inquilinoId: 'q1',
      meses: 2,
      valorDevido: '2400.00',
    });
    expect(painel.atrasados[0].pagamentos.map((p) => p.competencia)).toEqual([
      '2026-10',
      '2026-11',
    ]);
    expect(painel.aVencer.map((p) => p.id)).toEqual(['c']);
    expect(painel.imoveisVagos).toEqual([{ id: 'i9', nome: 'Kitnet' }]);
  });
});
