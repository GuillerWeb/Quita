/**
 * Datas de negócio trafegam como `YYYY-MM-DD` (sem hora). No navegador, trabalhamos com
 * `Date` local só nos campos de data (datepicker) e convertemos nas bordas.
 */

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** `Date` local → `YYYY-MM-DD`. */
export function paraIso(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/** `YYYY-MM-DD` → `Date` local (meia-noite), para o datepicker. */
export function deIso(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** `YYYY-MM-DD` → `dd/MM/yyyy`, sem passar por fuso horário. */
export function dataBr(iso: string | null | undefined): string {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** `YYYY-MM-DD` → `dd/MM`. */
export function diaMes(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

/** Competência `YYYY-MM` → `out/2026`. */
export function competenciaCurta(competencia: string): string {
  const [ano, mes] = competencia.split('-').map(Number);
  return `${MESES_CURTOS[mes - 1]}/${ano}`;
}

/** Competência `YYYY-MM` → `Outubro / 2026`. */
export function competenciaLonga(competencia: string): string {
  const [ano, mes] = competencia.split('-').map(Number);
  return `${MESES_LONGOS[mes - 1]} / ${ano}`;
}

/** Competência `YYYY-MM` → `Outubro de 2026`. */
export function mesPorExtenso(competencia: string): string {
  const [ano, mes] = competencia.split('-').map(Number);
  return `${MESES_LONGOS[mes - 1]} de ${ano}`;
}

/** Competência `YYYY-MM` → `out`. */
export function mesCurto(competencia: string): string {
  return MESES_CURTOS[Number(competencia.split('-')[1]) - 1];
}

/** Competência `YYYY-MM` deslocada em meses. */
export function somarMeses(competencia: string, meses: number): string {
  const [ano, mes] = competencia.split('-').map(Number);
  const total = ano * 12 + (mes - 1) + meses;
  return `${Math.floor(total / 12)}-${doisDigitos((total % 12) + 1)}`;
}

/** Hoje no navegador, sem hora. */
export function hojeLocal(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}
