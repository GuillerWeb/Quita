import { deDate, type DataISO } from '../comum/datas.js';
import type { Prisma } from '../generated/prisma/client.js';

export type Situacao = 'PAGO' | 'AGUARDANDO' | 'ATRASADO';

/** RN-16: "atrasado" é calculado aqui, e só aqui; nunca é salvo. */
export function calcularSituacao(
  pagamento: { status: 'AGUARDANDO' | 'PAGO'; dataVencimento: Date },
  hoje: DataISO,
): Situacao {
  if (pagamento.status === 'PAGO') return 'PAGO';
  return deDate(pagamento.dataVencimento) < hoje ? 'ATRASADO' : 'AGUARDANDO';
}

/** Filtro Prisma equivalente a `calcularSituacao(...) === 'ATRASADO'`. */
export function filtroAtrasado(hojeDate: Date) {
  return {
    status: 'AGUARDANDO' as const,
    dataVencimento: { lt: hojeDate },
  };
}

export interface PagamentoResposta {
  id: string;
  inquilinoId: string;
  competencia: string;
  valor: string;
  dataVencimento: DataISO;
  status: 'AGUARDANDO' | 'PAGO';
  situacao: Situacao;
  dataPagamento: DataISO | null;
}

export interface PagamentoDoBanco {
  id: string;
  inquilinoId: string;
  competencia: Date;
  valor: Prisma.Decimal;
  dataVencimento: Date;
  status: 'AGUARDANDO' | 'PAGO';
  dataPagamento: Date | null;
}

/** Formato de pagamento na API (B7). */
export function paraPagamentoResposta(
  p: PagamentoDoBanco,
  hoje: DataISO,
): PagamentoResposta {
  return {
    id: p.id,
    inquilinoId: p.inquilinoId,
    competencia: deDate(p.competencia).slice(0, 7),
    valor: p.valor.toFixed(2),
    dataVencimento: deDate(p.dataVencimento),
    status: p.status,
    situacao: calcularSituacao(p, hoje),
    dataPagamento: p.dataPagamento ? deDate(p.dataPagamento) : null,
  };
}

export const SELECAO_PAGAMENTO = {
  id: true,
  inquilinoId: true,
  competencia: true,
  valor: true,
  dataVencimento: true,
  status: true,
  dataPagamento: true,
} as const;
