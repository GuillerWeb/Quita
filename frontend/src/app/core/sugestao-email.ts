/**
 * D-22: sugestão de correção para erros de digitação no domínio do e-mail
 * ("ana@gmial.com" → "ana@gmail.com"). Só sugere; nunca bloqueia o envio.
 */

/** Domínios para os quais sugerimos correção. */
export const DOMINIOS_COMUNS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com.br',
  'icloud.com',
] as const;

/**
 * Domínios reais, parecidos com os comuns, que NÃO devem ganhar sugestão
 * (ex.: "email.com" e "ymail.com" estão a uma letra de "gmail.com").
 */
const DOMINIOS_VALIDOS_PARECIDOS = new Set([
  'hotmail.com.br',
  'outlook.com.br',
  'live.com',
  'msn.com',
  'yahoo.com',
  'ymail.com',
  'rocketmail.com',
  'mail.com',
  'email.com',
  'gmx.com',
  'me.com',
  'mac.com',
]);

/** Distância de edição com transposição (Damerau–Levenshtein, versão "optimal string alignment"). */
export function distancia(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + custo);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Devolve o e-mail corrigido, ou `null` se não houver o que sugerir. */
export function sugerirEmail(email: string): string | null {
  const texto = email.trim();
  const arroba = texto.lastIndexOf('@');
  if (arroba < 1 || arroba === texto.length - 1) return null;

  const usuario = texto.slice(0, arroba);
  const dominio = texto.slice(arroba + 1).toLowerCase();
  if ((DOMINIOS_COMUNS as readonly string[]).includes(dominio)) return null;
  if (DOMINIOS_VALIDOS_PARECIDOS.has(dominio)) return null;

  // 1) Nome certo, final errado: "gmail.con", "gmail.com.br", "icloud" → domínio comum.
  const nome = dominio.split('.')[0];
  const mesmoNome = DOMINIOS_COMUNS.find((comum) => comum.split('.')[0] === nome);
  if (mesmoNome) return `${usuario}@${mesmoNome}`;

  // 2) Erro de digitação no domínio inteiro: "gmial.com", "hotmal.com", "yaho.com.br".
  const limite = dominio.length >= 8 ? 2 : 1;
  let melhor: { dominio: string; distancia: number } | null = null;
  for (const comum of DOMINIOS_COMUNS) {
    const dist = distancia(dominio, comum);
    if (dist <= limite && (!melhor || dist < melhor.distancia)) {
      melhor = { dominio: comum, distancia: dist };
    }
  }
  return melhor ? `${usuario}@${melhor.dominio}` : null;
}
