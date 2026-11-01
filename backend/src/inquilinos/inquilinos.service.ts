import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { deDate, hoje, paraDate, type DataISO } from '../comum/datas.js';
import { Prisma } from '../generated/prisma/client.js';
import { GeracaoMensalService } from '../pagamentos/geracao-mensal.service.js';
import {
  filtroAtrasado,
  paraPagamentoResposta,
  SELECAO_PAGAMENTO,
  type PagamentoResposta,
} from '../pagamentos/situacao.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AtualizarInquilinoDto } from './dto/atualizar-inquilino.dto.js';
import { CriarInquilinoDto } from './dto/criar-inquilino.dto.js';
import { SaidaDto } from './dto/saida.dto.js';

const NAO_ENCONTRADO = 'Inquilino não encontrado';
const IMOVEL_OCUPADO = 'Este imóvel já tem um inquilino ativo';

const SELECAO_INQUILINO = {
  id: true,
  nome: true,
  telefone: true,
  email: true,
  cpf: true,
  observacoes: true,
  valorAluguel: true,
  diaVencimento: true,
  dataEntrada: true,
  dataSaida: true,
  imovel: { select: { id: true, nome: true } },
} as const;

type InquilinoDoBanco = Prisma.InquilinoGetPayload<{
  select: typeof SELECAO_INQUILINO;
}>;

export interface InquilinoResposta {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  observacoes: string | null;
  valorAluguel: string;
  diaVencimento: number;
  dataEntrada: DataISO;
  dataSaida: DataISO | null;
  ativo: boolean;
  imovel: { id: string; nome: string };
}

export interface InquilinoListaResposta extends InquilinoResposta {
  mesesAtrasados: number;
}

export interface InquilinoDetalheResposta extends InquilinoResposta {
  pagamentos: PagamentoResposta[];
  resumo: { mesesAtrasados: number; valorDevido: string };
}

function paraResposta(i: InquilinoDoBanco): InquilinoResposta {
  return {
    ...i,
    valorAluguel: i.valorAluguel.toFixed(2),
    dataEntrada: deDate(i.dataEntrada),
    dataSaida: i.dataSaida ? deDate(i.dataSaida) : null,
    ativo: i.dataSaida === null,
  };
}

function ehViolacaoDeUnicidade(erro: unknown): boolean {
  return (erro as { code?: string }).code === 'P2002';
}

@Injectable()
export class InquilinosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geracao: GeracaoMensalService,
  ) {}

  async listar(
    proprietarioId: string,
    ativos: 'true' | 'false' | 'todos' = 'true',
  ): Promise<InquilinoListaResposta[]> {
    await this.geracao.garantirMeses(proprietarioId);
    const filtroAtivo =
      ativos === 'todos'
        ? {}
        : { dataSaida: ativos === 'true' ? null : { not: null } };

    const inquilinos = await this.prisma.inquilino.findMany({
      where: { proprietarioId, ...filtroAtivo },
      orderBy: { nome: 'asc' },
      select: {
        ...SELECAO_INQUILINO,
        _count: {
          select: {
            pagamentos: { where: filtroAtrasado(paraDate(hoje())) },
          },
        },
      },
    });
    return inquilinos.map(({ _count, ...i }) => ({
      ...paraResposta(i),
      mesesAtrasados: _count.pagamentos,
    }));
  }

  async detalhe(
    proprietarioId: string,
    id: string,
  ): Promise<InquilinoDetalheResposta> {
    await this.garantirExiste(proprietarioId, id);
    await this.geracao.garantirMeses(proprietarioId, { inquilinoId: id });
    return this.montarDetalhe(proprietarioId, id);
  }

  /** RN-09 e RN-21: cria o inquilino e gera os meses retroativos na mesma transação. */
  async criar(
    proprietarioId: string,
    dto: CriarInquilinoDto,
  ): Promise<InquilinoDetalheResposta> {
    const imovel = await this.prisma.imovel.findFirst({
      where: { id: dto.imovelId, proprietarioId },
      select: { id: true },
    });
    if (!imovel) throw new NotFoundException('Imóvel não encontrado');

    const ocupado = await this.prisma.inquilino.count({
      where: { imovelId: imovel.id, proprietarioId, dataSaida: null },
    });
    if (ocupado > 0) throw new ConflictException(IMOVEL_OCUPADO);

    try {
      const id = await this.prisma.$transaction(async (tx) => {
        const inquilino = await tx.inquilino.create({
          data: {
            proprietarioId,
            imovelId: imovel.id,
            nome: dto.nome,
            telefone: dto.telefone ?? null,
            email: dto.email ?? null,
            cpf: dto.cpf ?? null,
            observacoes: dto.observacoes ?? null,
            valorAluguel: dto.valorAluguel,
            diaVencimento: dto.diaVencimento,
            dataEntrada: paraDate(dto.dataEntrada),
          },
          select: { id: true },
        });
        await this.geracao.garantirMeses(proprietarioId, {
          db: tx,
          inquilinoId: inquilino.id,
        });
        return inquilino.id;
      });
      return this.montarDetalhe(proprietarioId, id);
    } catch (erro) {
      // Índice parcial inquilino_um_ativo_por_imovel (corrida entre dois cadastros).
      if (ehViolacaoDeUnicidade(erro))
        throw new ConflictException(IMOVEL_OCUPADO);
      throw erro;
    }
  }

  async atualizar(
    proprietarioId: string,
    id: string,
    dto: AtualizarInquilinoDto,
  ): Promise<InquilinoResposta> {
    await this.garantirExiste(proprietarioId, id);
    const inquilino = await this.prisma.inquilino.update({
      where: { id, proprietarioId },
      data: {
        nome: dto.nome,
        telefone: dto.telefone,
        email: dto.email,
        cpf: dto.cpf,
        observacoes: dto.observacoes,
        valorAluguel: dto.valorAluguel,
        diaVencimento: dto.diaVencimento,
      },
      select: SELECAO_INQUILINO,
    });
    return paraResposta(inquilino);
  }

  /** RN-10: inativa o inquilino, libera o imóvel e mantém o histórico. */
  async registrarSaida(
    proprietarioId: string,
    id: string,
    dto: SaidaDto,
  ): Promise<InquilinoDetalheResposta> {
    const inquilino = await this.prisma.inquilino.findFirst({
      where: { id, proprietarioId },
      select: { dataEntrada: true, dataSaida: true },
    });
    if (!inquilino) throw new NotFoundException(NAO_ENCONTRADO);
    if (inquilino.dataSaida) {
      throw new ConflictException('Este inquilino já tem saída registrada');
    }
    if (dto.dataSaida < deDate(inquilino.dataEntrada)) {
      throw new BadRequestException(
        'A data de saída não pode ser anterior à entrada',
      );
    }

    const dataSaida = paraDate(dto.dataSaida);
    await this.prisma.$transaction(async (tx) => {
      // Gera o que faltar antes de gravar a saída, para nenhum mês devido sumir (RN-19).
      await this.geracao.garantirMeses(proprietarioId, {
        db: tx,
        inquilinoId: id,
      });
      await tx.inquilino.update({
        where: { id, proprietarioId },
        data: { dataSaida },
      });
      await tx.pagamento.deleteMany({
        where: {
          inquilinoId: id,
          proprietarioId,
          status: 'AGUARDANDO',
          dataVencimento: { gt: dataSaida },
        },
      });
    });
    return this.montarDetalhe(proprietarioId, id);
  }

  /** RN-13: só exclui se nenhum mês estiver pago; os meses aguardando vão junto. */
  async excluir(proprietarioId: string, id: string): Promise<void> {
    await this.garantirExiste(proprietarioId, id);
    const pagos = await this.prisma.pagamento.count({
      where: { inquilinoId: id, proprietarioId, status: 'PAGO' },
    });
    if (pagos > 0) {
      throw new ConflictException(
        'Inquilino com pagamentos registrados não pode ser excluído; registre a saída',
      );
    }
    await this.prisma.$transaction([
      this.prisma.pagamento.deleteMany({
        where: { inquilinoId: id, proprietarioId },
      }),
      this.prisma.inquilino.delete({ where: { id, proprietarioId } }),
    ]);
  }

  private async garantirExiste(
    proprietarioId: string,
    id: string,
  ): Promise<void> {
    const existe = await this.prisma.inquilino.findFirst({
      where: { id, proprietarioId },
      select: { id: true },
    });
    if (!existe) throw new NotFoundException(NAO_ENCONTRADO);
  }

  private async montarDetalhe(
    proprietarioId: string,
    id: string,
  ): Promise<InquilinoDetalheResposta> {
    const inquilino = await this.prisma.inquilino.findFirst({
      where: { id, proprietarioId },
      select: {
        ...SELECAO_INQUILINO,
        pagamentos: {
          select: SELECAO_PAGAMENTO,
          orderBy: { competencia: 'desc' },
        },
      },
    });
    if (!inquilino) throw new NotFoundException(NAO_ENCONTRADO);

    const dia = hoje();
    const { pagamentos, ...dados } = inquilino;
    const lista = pagamentos.map((p) => paraPagamentoResposta(p, dia));
    const atrasados = pagamentos.filter(
      (_p, i) => lista[i].situacao === 'ATRASADO',
    );
    const valorDevido = atrasados.reduce(
      (total, p) => total.plus(p.valor),
      new Prisma.Decimal(0),
    );
    return {
      ...paraResposta(dados),
      pagamentos: lista,
      resumo: {
        mesesAtrasados: atrasados.length,
        valorDevido: valorDevido.toFixed(2),
      },
    };
  }
}
