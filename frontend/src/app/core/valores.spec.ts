import { somarValores, valorParaApi, valorParaCampo } from './valores';

describe('valorParaApi', () => {
  it('aceita formato brasileiro e o da API', () => {
    expect(valorParaApi('1.200,50')).toBe('1200.50');
    expect(valorParaApi('R$ 1.200,5')).toBe('1200.50');
    expect(valorParaApi('1200')).toBe('1200.00');
    expect(valorParaApi('1200.5')).toBe('1200.50');
    expect(valorParaApi('850,00')).toBe('850.00');
  });

  it('recusa zero, negativos, texto e mais de 2 casas', () => {
    expect(valorParaApi('0,00')).toBeNull();
    expect(valorParaApi('-10')).toBeNull();
    expect(valorParaApi('abc')).toBeNull();
    expect(valorParaApi('10,123')).toBeNull();
    expect(valorParaApi('')).toBeNull();
  });
});

describe('valorParaCampo', () => {
  it('formata com milhar e vírgula', () => {
    expect(valorParaCampo('1200.00')).toBe('1.200,00');
    expect(valorParaCampo('850.5')).toBe('850,50');
    expect(valorParaCampo('1234567.89')).toBe('1.234.567,89');
  });
});

describe('somarValores', () => {
  it('soma em centavos sem erro de arredondamento', () => {
    expect(somarValores(['0.10', '0.20'])).toBe('0.30');
    expect(somarValores(['1200.00', '1850.50', '999.99'])).toBe('4050.49');
    expect(somarValores([])).toBe('0.00');
  });
});
