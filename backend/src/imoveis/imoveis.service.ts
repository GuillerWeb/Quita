import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AtualizarImovelDto } from './dto/atualizar-imovel.dto.js';
import { CriarImovelDto } from './dto/criar-imovel.dto.js';

export interface ImovelResposta {
  id: string;
  nome: string;
  endereco: string | null;
  inquilinoAtivo: { id: string; nome: string } | null;
}

const SELECAO_IMOVEL = {
  id: true,
  nome: true,
  endereco: true,
  inquilinos: {
    where: { dataSaida: null },
    select: { id: true, nome: true },
    take: 1,
  },
} as const;

type ImovelSelecionado = {
  id: string;
  nome: string;
  endereco: string | null;
  inquilinos: { id: string; nome: string }[];
};

function paraResposta({
  inquilinos,
  ...imovel
}: ImovelSelecionado): ImovelResposta {
  return { ...imovel, inquilinoAtivo: inquilinos[0] ?? null };
}

@Injectable()
export class ImoveisService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(proprietarioId: string): Promise<ImovelResposta[]> {
    const imoveis = await this.prisma.imovel.findMany({
      where: { proprietarioId },
      orderBy: { nome: 'asc' },
      select: SELECAO_IMOVEL,
    });
    return imoveis.map(paraResposta);
  }

  async buscar(proprietarioId: string, id: string): Promise<ImovelResposta> {
    const imovel = await this.prisma.imovel.findFirst({
      where: { id, proprietarioId },
      select: SELECAO_IMOVEL,
    });
    if (!imovel) throw new NotFoundException('Imóvel não encontrado');
    return paraResposta(imovel);
  }

  async criar(
    proprietarioId: string,
    dto: CriarImovelDto,
  ): Promise<ImovelResposta> {
    const imovel = await this.prisma.imovel.create({
      data: { proprietarioId, nome: dto.nome, endereco: dto.endereco ?? null },
      select: SELECAO_IMOVEL,
    });
    return paraResposta(imovel);
  }

  async atualizar(
    proprietarioId: string,
    id: string,
    dto: AtualizarImovelDto,
  ): Promise<ImovelResposta> {
    await this.buscar(proprietarioId, id);
    const imovel = await this.prisma.imovel.update({
      where: { id, proprietarioId },
      data: { nome: dto.nome, endereco: dto.endereco },
      select: SELECAO_IMOVEL,
    });
    return paraResposta(imovel);
  }

  /** RN-08: só exclui imóvel que nunca teve inquilino. */
  async excluir(proprietarioId: string, id: string): Promise<void> {
    await this.buscar(proprietarioId, id);
    const historico = await this.prisma.inquilino.count({
      where: { imovelId: id, proprietarioId },
    });
    if (historico > 0) {
      throw new ConflictException(
        'Este imóvel tem histórico de inquilinos e não pode ser excluído',
      );
    }
    await this.prisma.imovel.delete({ where: { id, proprietarioId } });
  }
}
