import { TestBed } from '@angular/core/testing';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AdaptadorDataBr } from './adaptador-data';
import {
  competenciaCurta,
  competenciaLonga,
  dataBr,
  deIso,
  paraIso,
  primeiroVencimento,
  somarMeses,
} from './datas';

describe('datas', () => {
  it('converte Date local para YYYY-MM-DD e volta sem mudar o dia', () => {
    const data = new Date(2026, 1, 28, 23, 59);
    expect(paraIso(data)).toBe('2026-02-28');
    expect(paraIso(deIso('2026-12-31'))).toBe('2026-12-31');
  });

  it('formata datas e competências em português', () => {
    expect(dataBr('2026-10-05')).toBe('05/10/2026');
    expect(dataBr(null)).toBe('');
    expect(competenciaCurta('2026-10')).toBe('out/2026');
    expect(competenciaLonga('2026-03')).toBe('Março / 2026');
  });

  it('soma meses atravessando o ano', () => {
    expect(somarMeses('2026-11', 3)).toBe('2027-02');
    expect(somarMeses('2026-01', -1)).toBe('2025-12');
  });
});

describe('AdaptadorDataBr', () => {
  let adaptador: AdaptadorDataBr;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdaptadorDataBr, { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
    });
    adaptador = TestBed.inject(AdaptadorDataBr);
  });

  it('lê dd/MM/aaaa (e não MM/dd)', () => {
    const data = adaptador.parse('10/11/2026');
    expect(data && paraIso(data)).toBe('2026-11-10');
  });

  it('recusa data inexistente', () => {
    const data = adaptador.parse('31/02/2026');
    expect(data && adaptador.isValid(data)).toBe(false);
  });

  it('exibe dd/MM/aaaa', () => {
    expect(
      adaptador.format(new Date(2026, 0, 5), { year: 'numeric', month: 'numeric', day: 'numeric' }),
    ).toBe('05/01/2026');
  });
});

describe('primeiroVencimento (prévia do formulário, RN-18)', () => {
  const d = (ano: number, mes: number, dia: number) => new Date(ano, mes - 1, dia);

  it('MES_SEGUINTE: sempre o dia de vencimento do mês seguinte', () => {
    expect(primeiroVencimento(d(2026, 11, 3), 7, 'MES_SEGUINTE')).toBe('2026-12-07');
    expect(primeiroVencimento(d(2026, 11, 20), 7, 'MES_SEGUINTE')).toBe('2026-12-07');
    expect(primeiroVencimento(d(2026, 12, 1), 5, 'MES_SEGUINTE')).toBe('2027-01-05');
    expect(primeiroVencimento(d(2027, 1, 10), 31, 'MES_SEGUINTE')).toBe('2027-02-28');
  });

  it('MES_DA_ENTRADA: no mesmo mês se o dia ainda não passou', () => {
    expect(primeiroVencimento(d(2026, 11, 3), 7, 'MES_DA_ENTRADA')).toBe('2026-11-07');
    expect(primeiroVencimento(d(2026, 11, 7), 7, 'MES_DA_ENTRADA')).toBe('2026-11-07');
    expect(primeiroVencimento(d(2026, 11, 20), 7, 'MES_DA_ENTRADA')).toBe('2026-12-07');
  });
});
