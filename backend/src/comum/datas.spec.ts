import {
  competenciaApi,
  dataValida,
  deDate,
  fimDoMes,
  hoje,
  paraDate,
  primeiroVencimento,
  vencimentoNoMes,
  vencimentosAte,
} from './datas.js';

describe('vencimentoNoMes (RN-20)', () => {
  it('dia 31 em fevereiro de ano comum vira 28/02', () => {
    expect(vencimentoNoMes(2027, 2, 31)).toBe('2027-02-28');
  });

  it('dia 31 em fevereiro de ano bissexto vira 29/02', () => {
    expect(vencimentoNoMes(2028, 2, 31)).toBe('2028-02-29');
  });

  it('dia 30 em fevereiro vira o último dia do mês', () => {
    expect(vencimentoNoMes(2026, 2, 30)).toBe('2026-02-28');
    expect(vencimentoNoMes(2028, 2, 30)).toBe('2028-02-29');
  });

  it('dia 31 em abril vira 30/04', () => {
    expect(vencimentoNoMes(2026, 4, 31)).toBe('2026-04-30');
  });

  it('dia existente não muda', () => {
    expect(vencimentoNoMes(2026, 10, 10)).toBe('2026-10-10');
  });
});

describe('primeiroVencimento (RN-18) — MES_DA_ENTRADA', () => {
  it('entrada antes do dia de vencimento: vence no mesmo mês', () => {
    expect(primeiroVencimento('2026-10-05', 10, 'MES_DA_ENTRADA')).toBe(
      '2026-10-10',
    );
  });

  it('entrada no dia do vencimento: vence no mesmo dia', () => {
    expect(primeiroVencimento('2026-10-10', 10, 'MES_DA_ENTRADA')).toBe(
      '2026-10-10',
    );
  });

  it('entrada depois do dia de vencimento: vence no mês seguinte', () => {
    expect(primeiroVencimento('2026-10-20', 10, 'MES_DA_ENTRADA')).toBe(
      '2026-11-10',
    );
  });

  it('entrada em dezembro depois do vencimento: vence em janeiro do ano seguinte', () => {
    expect(primeiroVencimento('2026-12-15', 5, 'MES_DA_ENTRADA')).toBe(
      '2027-01-05',
    );
  });

  it('dia 31 com entrada no último dia de fevereiro', () => {
    expect(primeiroVencimento('2027-02-28', 31, 'MES_DA_ENTRADA')).toBe(
      '2027-02-28',
    );
  });
});

describe('primeiroVencimento (RN-18) — MES_SEGUINTE, o padrão', () => {
  it('entrada antes do dia de vencimento: vence só no mês seguinte', () => {
    expect(primeiroVencimento('2026-11-03', 7, 'MES_SEGUINTE')).toBe(
      '2026-12-07',
    );
  });

  it('entrada no dia do vencimento: vence no mês seguinte', () => {
    expect(primeiroVencimento('2026-11-07', 7, 'MES_SEGUINTE')).toBe(
      '2026-12-07',
    );
  });

  it('entrada depois do dia de vencimento: vence no mês seguinte', () => {
    expect(primeiroVencimento('2026-11-20', 7, 'MES_SEGUINTE')).toBe(
      '2026-12-07',
    );
  });

  it('entrada em dezembro: vence em janeiro do ano seguinte', () => {
    expect(primeiroVencimento('2026-12-01', 5, 'MES_SEGUINTE')).toBe(
      '2027-01-05',
    );
  });

  it('dia 31 com entrada em janeiro: vence no último dia de fevereiro (RN-20)', () => {
    expect(primeiroVencimento('2027-01-10', 31, 'MES_SEGUINTE')).toBe(
      '2027-02-28',
    );
  });
});

describe('vencimentosAte (RN-19)', () => {
  it('atravessa a virada de ano (nov/2026 a fev/2027)', () => {
    expect(
      vencimentosAte('2026-11-01', 10, 'MES_DA_ENTRADA', '2027-02-28'),
    ).toEqual([
      { competencia: '2026-11-01', dataVencimento: '2026-11-10' },
      { competencia: '2026-12-01', dataVencimento: '2026-12-10' },
      { competencia: '2027-01-01', dataVencimento: '2027-01-10' },
      { competencia: '2027-02-01', dataVencimento: '2027-02-10' },
    ]);
  });

  it('inclui o mês atual mesmo com vencimento ainda por vir', () => {
    const lista = vencimentosAte(
      '2026-08-15',
      20,
      'MES_DA_ENTRADA',
      fimDoMes('2026-11-01'),
    );
    expect(lista.map((v) => v.dataVencimento)).toEqual([
      '2026-08-20',
      '2026-09-20',
      '2026-10-20',
      '2026-11-20',
    ]);
  });

  it('aplica a RN-20 em cada mês com dia 31', () => {
    const lista = vencimentosAte(
      '2027-01-31',
      31,
      'MES_DA_ENTRADA',
      '2027-04-30',
    );
    expect(lista.map((v) => v.dataVencimento)).toEqual([
      '2027-01-31',
      '2027-02-28',
      '2027-03-31',
      '2027-04-30',
    ]);
  });

  it('com saída, para no último vencimento igual ou anterior à saída', () => {
    const lista = vencimentosAte(
      '2026-07-01',
      10,
      'MES_DA_ENTRADA',
      '2026-10-09',
    );
    expect(lista.map((v) => v.competencia)).toEqual([
      '2026-07-01',
      '2026-08-01',
      '2026-09-01',
    ]);
    expect(
      vencimentosAte('2026-07-01', 10, 'MES_DA_ENTRADA', '2026-10-10'),
    ).toHaveLength(4);
  });

  it('primeiro vencimento depois do limite: lista vazia', () => {
    expect(
      vencimentosAte('2026-11-20', 10, 'MES_DA_ENTRADA', '2026-11-30'),
    ).toEqual([]);
  });
});

describe('hoje (RN-25)', () => {
  it('23h30 em Cuiabá (já dia seguinte em UTC) devolve o dia de Cuiabá', () => {
    // 31/10/2026 03:30 UTC = 30/10/2026 23:30 em Cuiabá (UTC-4)
    const agora = new Date('2026-10-31T03:30:00Z');
    expect(hoje('America/Cuiaba', agora)).toBe('2026-10-30');
    expect(hoje('UTC', agora)).toBe('2026-10-31');
  });

  it('usa APP_TIMEZONE por padrão', () => {
    const anterior = process.env.APP_TIMEZONE;
    process.env.APP_TIMEZONE = 'America/Cuiaba';
    expect(hoje(undefined, new Date('2027-01-01T02:00:00Z'))).toBe(
      '2026-12-31',
    );
    process.env.APP_TIMEZONE = anterior;
  });
});

describe('conversões', () => {
  it('ida e volta entre string e Date não muda o dia', () => {
    const d = paraDate('2026-10-01');
    expect(d.toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(deDate(d)).toBe('2026-10-01');
  });

  it('competência no formato da API', () => {
    expect(competenciaApi(paraDate('2026-10-01'))).toBe('2026-10');
  });

  it('valida datas reais', () => {
    expect(dataValida('2026-02-28')).toBe(true);
    expect(dataValida('2026-02-30')).toBe(false);
    expect(dataValida('2026-13-01')).toBe(false);
    expect(dataValida('01/10/2026')).toBe(false);
  });
});
