import { Prisma } from '../generated/prisma/client.js';
import { deDate, paraDate, type InicioCobranca } from '../comum/datas.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { GeracaoMensalService } from './geracao-mensal.service.js';

interface InquilinoFalso {
  id: string;
  valorAluguel: Prisma.Decimal;
  diaVencimento: number;
  dataEntrada: Date;
  inicioCobranca: InicioCobranca;
  dataSaida: Date | null;
  pagamentos: { competencia: Date }[];
}

function criarServico(inquilinos: InquilinoFalso[]) {
  const prisma = {
    inquilino: { findMany: vi.fn().mockResolvedValue(inquilinos) },
    pagamento: {
      createMany: vi
        .fn()
        .mockImplementation(({ data }: { data: unknown[] }) =>
          Promise.resolve({ count: data.length }),
        ),
    },
  };
  return {
    servico: new GeracaoMensalService(prisma as unknown as PrismaService),
    prisma,
  };
}

function inquilino(parcial: Partial<InquilinoFalso>): InquilinoFalso {
  return {
    id: 'q1',
    valorAluguel: new Prisma.Decimal('1200.00'),
    diaVencimento: 10,
    dataEntrada: paraDate('2026-08-01'),
    inicioCobranca: 'MES_DA_ENTRADA',
    dataSaida: null,
    pagamentos: [],
    ...parcial,
  };
}

type Gerado = { competencia: Date; dataVencimento: Date; valor: unknown };

const competencias = (dados: Gerado[]) =>
  dados.map((d) => deDate(d.competencia));

describe('GeracaoMensalService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 01/11/2026 15:00 em Cuiabá
    vi.setSystemTime(new Date('2026-11-01T19:00:00Z'));
    process.env.APP_TIMEZONE = 'America/Cuiaba';
  });

  afterEach(() => vi.useRealTimers());

  it('RN-21: gera os meses retroativos até o mês atual, inclusive', async () => {
    const { servico, prisma } = criarServico([inquilino({})]);
    const criados = await servico.garantirMeses('p1');

    const dados = prisma.pagamento.createMany.mock.calls[0][0].data as Gerado[];
    expect(criados).toBe(4);
    expect(competencias(dados)).toEqual([
      '2026-08-01',
      '2026-09-01',
      '2026-10-01',
      '2026-11-01',
    ]);
    expect(deDate(dados[3].dataVencimento)).toBe('2026-11-10');
    expect(prisma.pagamento.createMany.mock.calls[0][0].skipDuplicates).toBe(
      true,
    );
  });

  it('filtra pelo proprietário e copia valor e proprietarioId (RN-12)', async () => {
    const { servico, prisma } = criarServico([inquilino({})]);
    await servico.garantirMeses('p1');
    expect(prisma.inquilino.findMany.mock.calls[0][0].where).toEqual({
      proprietarioId: 'p1',
    });
    const dados = prisma.pagamento.createMany.mock.calls[0][0].data;
    expect(dados[0]).toMatchObject({ proprietarioId: 'p1', inquilinoId: 'q1' });
    expect(dados[0].valor.toFixed(2)).toBe('1200.00');
  });

  it('idempotente: com o mês atual já gerado, não cria nada', async () => {
    const { servico, prisma } = criarServico([
      inquilino({ pagamentos: [{ competencia: paraDate('2026-11-01') }] }),
    ]);
    expect(await servico.garantirMeses('p1')).toBe(0);
    expect(prisma.pagamento.createMany).not.toHaveBeenCalled();
  });

  it('gera só os meses depois do último gerado', async () => {
    const { servico, prisma } = criarServico([
      inquilino({ pagamentos: [{ competencia: paraDate('2026-09-01') }] }),
    ]);
    await servico.garantirMeses('p1');
    expect(
      competencias(prisma.pagamento.createMany.mock.calls[0][0].data),
    ).toEqual(['2026-10-01', '2026-11-01']);
  });

  it('RN-19: com saída, para no último vencimento até a data de saída', async () => {
    const { servico, prisma } = criarServico([
      inquilino({ dataSaida: paraDate('2026-10-05') }),
    ]);
    await servico.garantirMeses('p1');
    expect(
      competencias(prisma.pagamento.createMany.mock.calls[0][0].data),
    ).toEqual(['2026-08-01', '2026-09-01']);
  });

  it('RN-18: MES_SEGUINTE começa no mês seguinte mesmo com o vencimento ainda por vir', async () => {
    const { servico, prisma } = criarServico([
      inquilino({
        dataEntrada: paraDate('2026-09-03'),
        diaVencimento: 7,
        inicioCobranca: 'MES_SEGUINTE',
      }),
    ]);
    await servico.garantirMeses('p1');
    expect(
      competencias(prisma.pagamento.createMany.mock.calls[0][0].data),
    ).toEqual(['2026-10-01', '2026-11-01']);
  });

  it('RN-18: MES_DA_ENTRADA, entrada depois do vencimento do mês começa no mês seguinte', async () => {
    const { servico, prisma } = criarServico([
      inquilino({ dataEntrada: paraDate('2026-10-20') }),
    ]);
    await servico.garantirMeses('p1');
    expect(
      competencias(prisma.pagamento.createMany.mock.calls[0][0].data),
    ).toEqual(['2026-11-01']);
  });
});
