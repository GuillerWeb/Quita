import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hoje, paraDate } from '../comum/datas.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PagarDto } from './dto/pagar.dto.js';
import {
  paraPagamentoResposta,
  SELECAO_PAGAMENTO,
  type PagamentoResposta,
} from './situacao.js';

@Injectable()
export class PagamentosService {
  constructor(private readonly prisma: PrismaService) {}

  /** RN-22: exige data de pagamento (padrão hoje), nunca futura. */
  async pagar(
    proprietarioId: string,
    id: string,
    dto: PagarDto,
  ): Promise<PagamentoResposta> {
    const pagamento = await this.buscar(proprietarioId, id);
    if (pagamento.status === 'PAGO') {
      throw new ConflictException('Este mês já está registrado como pago');
    }
    const dia = hoje();
    const dataPagamento = dto?.dataPagamento ?? dia; // corpo pode vir vazio
    if (dataPagamento > dia) {
      throw new BadRequestException('A data de pagamento não pode ser futura');
    }
    const atualizado = await this.prisma.pagamento.update({
      where: { id, proprietarioId },
      data: { status: 'PAGO', dataPagamento: paraDate(dataPagamento) },
      select: SELECAO_PAGAMENTO,
    });
    return paraPagamentoResposta(atualizado, dia);
  }

  /** RN-23: volta para aguardando e apaga a data de pagamento. */
  async desfazer(
    proprietarioId: string,
    id: string,
  ): Promise<PagamentoResposta> {
    const pagamento = await this.buscar(proprietarioId, id);
    if (pagamento.status !== 'PAGO') {
      throw new ConflictException('Este mês não está registrado como pago');
    }
    const atualizado = await this.prisma.pagamento.update({
      where: { id, proprietarioId },
      data: { status: 'AGUARDANDO', dataPagamento: null },
      select: SELECAO_PAGAMENTO,
    });
    return paraPagamentoResposta(atualizado, hoje());
  }

  private async buscar(proprietarioId: string, id: string) {
    const pagamento = await this.prisma.pagamento.findFirst({
      where: { id, proprietarioId },
      select: { status: true },
    });
    if (!pagamento) throw new NotFoundException('Pagamento não encontrado');
    return pagamento;
  }
}
