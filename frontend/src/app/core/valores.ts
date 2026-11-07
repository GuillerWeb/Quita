/**
 * Conversões de dinheiro entre o que o usuário digita ("1.200,50") e a API ("1200.50").
 * Tudo com strings e centavos inteiros: nada de float em valores.
 */

const FORMATO_API = /^(\d{1,8})(?:\.(\d{1,2}))?$/;

/** Texto digitado → string da API com 2 casas, ou `null` se inválido/zero. */
export function valorParaApi(texto: string): string | null {
  let limpo = texto.replace(/R\$|\s/g, '');
  if (limpo.includes(',')) {
    // Formato brasileiro: ponto é milhar, vírgula é decimal.
    limpo = limpo.replace(/\./g, '').replace(',', '.');
  }
  const m = FORMATO_API.exec(limpo);
  if (!m) return null;
  const inteiro = String(Number(m[1]));
  const centavos = (m[2] ?? '').padEnd(2, '0');
  const resultado = `${inteiro}.${centavos}`;
  return /[1-9]/.test(resultado) ? resultado : null;
}

/** String da API ("1200.00") → texto para o campo ("1.200,00"). */
export function valorParaCampo(valor: string): string {
  const [inteiro, centavos = '00'] = valor.split('.');
  const milhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${milhar},${centavos.padEnd(2, '0')}`;
}

/** Soma valores da API em centavos (só para exibir totais na tela). */
export function somarValores(valores: string[]): string {
  const centavos = valores.reduce((total, v) => {
    const [inteiro, frac = '0'] = v.split('.');
    return total + Number(inteiro) * 100 + Number(frac.padEnd(2, '0'));
  }, 0);
  return `${Math.floor(centavos / 100)}.${String(centavos % 100).padStart(2, '0')}`;
}
