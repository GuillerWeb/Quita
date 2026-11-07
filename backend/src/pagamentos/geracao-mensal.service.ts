import { Injectable } from '@nestjs/common';
import {
  deDate,
  fimDoMes,
  hoje,
  paraDate,
  vencimentosAte,
} from '../comum/datas.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** Cliente do Prisma, normal ou dentro de uma transação. */
type ClienteDb = Pick<PrismaService, 'inquilino' | 'pagamento'>;

/**
 * Geração automática dos meses de cobrança (RN-17 a RN-21).
 * Chamada ao acessar painel, lista e detalhe de inquilinos e ao criar inquilino.
 * Idempotente: se apoia no @@unique([inquilinoId, competencia]) + skipDuplicates.
 */
@Injectable()
export class GeracaoMensalService {
  constructor(private readonly prisma: PrismaService) {}

  async garantirMeses(
    proprietarioId: string,
    opcoes: { db?: ClienteDb; inquilinoId?: string } = {},
  ): Promise<number> {
    const db = opcoes.db ?? this.prisma;
    const fimDoMesAtual = fimDoMes(hoje());

    // Todos os inquilinos (inclusive inativos): para quem já está em dia, só calcula e
    // não grava nada. Com dezenas de inquilinos o custo é desprezível.
    const inquilinos = await db.inquilino.findMany({
      where: {
        proprietarioId,
        ...(opcoes.inquilinoId ? { id: opcoes.inquilinoId } : {}),
      },
      select: {
        id: true,
        valorAluguel: true,
        diaVencimento: true,
        dataEntrada: true,
        inicioCobranca: true,
        dataSaida: true,
        pagamentos: {
          select: { competencia: true },
          orderBy: { competencia: 'desc' },
          take: 1,
        },
      },
    });

    const novos: Prisma.PagamentoCreateManyInput[] = [];
    for (const inquilino of inquilinos) {
      const saida = inquilino.dataSaida ? deDate(inquilino.dataSaida) : null;
      const limite = saida && saida < fimDoMesAtual ? saida : fimDoMesAtual;
      const ultimaGerada = inquilino.pagamentos[0]
        ? deDate(inquilino.pagamentos[0].competencia)
        : null;

      const faltantes = vencimentosAte(
        deDate(inquilino.dataEntrada),
        inquilino.diaVencimento,
        inquilino.inicioCobranca,
        limite,
      ).filter((v) => !ultimaGerada || v.competencia > ultimaGerada);

      for (const v of faltantes) {
        novos.push({
          proprietarioId,
          inquilinoId: inquilino.id,
          competencia: paraDate(v.competencia),
          dataVencimento: paraDate(v.dataVencimento),
          valor: inquilino.valorAluguel, // RN-12: copia o valor da época
        });
      }
    }

    if (novos.length === 0) return 0;
    const { count } = await db.pagamento.createMany({
      data: novos,
      skipDuplicates: true,
    });
    return count;
  }
}
