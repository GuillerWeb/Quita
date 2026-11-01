import { Injectable } from '@nestjs/common';
import { hoje, inicioDoMes, paraDate, type DataISO } from '../comum/datas.js';
import { Prisma } from '../generated/prisma/client.js';
import { GeracaoMensalService } from '../pagamentos/geracao-mensal.service.js';
import {
  filtroAtrasado,
  paraPagamentoResposta,
  SELECAO_PAGAMENTO,
  type PagamentoResposta,
} from '../pagamentos/situacao.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PagamentoDoPainel extends PagamentoResposta {
  nome: string;
  imovel: string;
}

export interface AtrasadoDoPainel {
  inquilinoId: string;
  nome: string;
  imovel: string;
  meses: number;
  valorDevido: string;
  pagamentos: PagamentoResposta[];
}

export interface PainelResposta {
  competencia: string;
  hoje: DataISO;
  totais: { esperado: string; recebido: string; aguardando: string };
  atrasados: AtrasadoDoPainel[];
  aVencer: PagamentoDoPainel[];
  imoveisVagos: { id: string; nome: string }[];
}

const SELECAO_COM_INQUILINO = {
  ...SELECAO_PAGAMENTO,
  inquilino: { select: { nome: true, imovel: { select: { nome: true } } } },
} as const;

const zero = () => new Prisma.Decimal(0);

/** RN-26: situação do mês atual, atrasados de qualquer mês, a vencer e vagos. */
@Injectable()
export class PainelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geracao: GeracaoMensalService,
  ) {}

  async resumo(proprietarioId: string): Promise<PainelResposta> {
    await this.geracao.garantirMeses(proprietarioId);
    const dia = hoje();
    const competencia = paraDate(inicioDoMes(dia));

    const [doMes, atrasados, imoveisVagos] = await Promise.all([
      this.prisma.pagamento.findMany({
        where: { proprietarioId, competencia },
        orderBy: { dataVencimento: 'asc' },
        select: SELECAO_COM_INQUILINO,
      }),
      this.prisma.pagamento.findMany({
        where: { proprietarioId, ...filtroAtrasado(paraDate(dia)) },
        orderBy: { dataVencimento: 'asc' },
        select: SELECAO_COM_INQUILINO,
      }),
      this.prisma.imovel.findMany({
        where: { proprietarioId, inquilinos: { none: { dataSaida: null } } },
        orderBy: { nome: 'asc' },
        select: { id: true, nome: true },
      }),
    ]);

    // Totais só da competência atual (somas em Decimal, regra 4).
    const totais = { esperado: zero(), recebido: zero(), aguardando: zero() };
    for (const p of doMes) {
      totais.esperado = totais.esperado.plus(p.valor);
      if (p.status === 'PAGO') totais.recebido = totais.recebido.plus(p.valor);
      else totais.aguardando = totais.aguardando.plus(p.valor);
    }

    // Agrupa por inquilino, na ordem da dívida mais antiga.
    const porInquilino = new Map<
      string,
      AtrasadoDoPainel & { total: Prisma.Decimal }
    >();
    for (const p of atrasados) {
      const grupo = porInquilino.get(p.inquilinoId) ?? {
        inquilinoId: p.inquilinoId,
        nome: p.inquilino.nome,
        imovel: p.inquilino.imovel.nome,
        meses: 0,
        valorDevido: '0.00',
        pagamentos: [],
        total: zero(),
      };
      grupo.meses += 1;
      grupo.total = grupo.total.plus(p.valor);
      grupo.pagamentos.push(paraPagamentoResposta(p, dia));
      porInquilino.set(p.inquilinoId, grupo);
    }

    const aVencer = doMes
      .filter((p) => p.status === 'AGUARDANDO')
      .map((p) => ({
        ...paraPagamentoResposta(p, dia),
        nome: p.inquilino.nome,
        imovel: p.inquilino.imovel.nome,
      }))
      .filter((p) => p.situacao === 'AGUARDANDO');

    return {
      competencia: inicioDoMes(dia).slice(0, 7),
      hoje: dia,
      totais: {
        esperado: totais.esperado.toFixed(2),
        recebido: totais.recebido.toFixed(2),
        aguardando: totais.aguardando.toFixed(2),
      },
      atrasados: [...porInquilino.values()].map(({ total, ...grupo }) => ({
        ...grupo,
        valorDevido: total.toFixed(2),
      })),
      aVencer,
      imoveisVagos,
    };
  }
}
