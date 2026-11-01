/**
 * Utilitários de data do domínio (RN-18 a RN-20, RN-25).
 * Funções puras, sem bibliotecas: trabalham com strings `YYYY-MM-DD` (DataISO).
 * Nunca use `new Date()` direto em regra de negócio; use `hoje()`.
 */

export type DataISO = string;

export interface PartesData {
  ano: number;
  mes: number; // 1 a 12
  dia: number;
}

export interface Vencimento {
  /** Dia 1 do mês de referência (`YYYY-MM-01`). */
  competencia: DataISO;
  dataVencimento: DataISO;
}

const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

const doisDigitos = (n: number) => String(n).padStart(2, '0');

export function formatar({ ano, mes, dia }: PartesData): DataISO {
  return `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`;
}

export function partes(data: DataISO): PartesData {
  const m = FORMATO_ISO.exec(data);
  if (!m) throw new Error(`Data inválida: ${data}`);
  return { ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) };
}

/** Verifica se a string é uma data real no formato `YYYY-MM-DD`. */
export function dataValida(data: string): boolean {
  if (!FORMATO_ISO.test(data)) return false;
  const { ano, mes, dia } = partes(data);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= ultimoDiaDoMes(ano, mes);
}

/** Data de hoje no fuso informado (RN-25). `agora` existe só para testes. */
export function hoje(
  tz: string = process.env.APP_TIMEZONE ?? 'America/Cuiaba',
  agora: Date = new Date(),
): DataISO {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(agora);
}

export function ultimoDiaDoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

/** Último dia do mês da data informada. */
export function fimDoMes(data: DataISO): DataISO {
  const { ano, mes } = partes(data);
  return formatar({ ano, mes, dia: ultimoDiaDoMes(ano, mes) });
}

/** Dia 1 do mês da data informada. */
export function inicioDoMes(data: DataISO): DataISO {
  const { ano, mes } = partes(data);
  return formatar({ ano, mes, dia: 1 });
}

/** RN-20: dia de vencimento inexistente no mês vira o último dia do mês. */
export function vencimentoNoMes(
  ano: number,
  mes: number,
  diaVencimento: number,
): DataISO {
  const dia = Math.min(diaVencimento, ultimoDiaDoMes(ano, mes));
  return formatar({ ano, mes, dia });
}

function proximoMes(ano: number, mes: number): { ano: number; mes: number } {
  return mes === 12 ? { ano: ano + 1, mes: 1 } : { ano, mes: mes + 1 };
}

/** RN-18: primeiro vencimento igual ou posterior à data de entrada. */
export function primeiroVencimento(
  dataEntrada: DataISO,
  diaVencimento: number,
): DataISO {
  const { ano, mes } = partes(dataEntrada);
  const noMesmoMes = vencimentoNoMes(ano, mes, diaVencimento);
  if (noMesmoMes >= dataEntrada) return noMesmoMes;
  const seguinte = proximoMes(ano, mes);
  return vencimentoNoMes(seguinte.ano, seguinte.mes, diaVencimento);
}

/**
 * RN-19: vencimentos do primeiro (RN-18) até `limite`, inclusive.
 * O limite é o último dia do mês atual ou a data de saída, o que vier primeiro.
 */
export function vencimentosAte(
  dataEntrada: DataISO,
  diaVencimento: number,
  limite: DataISO,
): Vencimento[] {
  const resultado: Vencimento[] = [];
  let { ano, mes } = partes(primeiroVencimento(dataEntrada, diaVencimento));
  for (;;) {
    const dataVencimento = vencimentoNoMes(ano, mes, diaVencimento);
    if (dataVencimento > limite) break;
    resultado.push({
      competencia: formatar({ ano, mes, dia: 1 }),
      dataVencimento,
    });
    const seguinte = proximoMes(ano, mes);
    ano = seguinte.ano;
    mes = seguinte.mes;
  }
  return resultado;
}

/** Converte `YYYY-MM-DD` para o `Date` do Prisma (`@db.Date`), em UTC meia-noite. */
export function paraDate(data: DataISO): Date {
  return new Date(`${data}T00:00:00.000Z`);
}

/** Converte o `Date` do Prisma (`@db.Date`) para `YYYY-MM-DD`, lendo em UTC. */
export function deDate(data: Date): DataISO {
  return data.toISOString().slice(0, 10);
}

/** Competência no formato da API: `YYYY-MM`. */
export function competenciaApi(data: Date | DataISO): string {
  const iso = typeof data === 'string' ? data : deDate(data);
  return iso.slice(0, 7);
}
