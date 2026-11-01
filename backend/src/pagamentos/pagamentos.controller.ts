import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  UsuarioAtual,
  type UsuarioLogado,
} from '../auth/usuario-atual.decorator.js';
import { uuidOu404 } from '../comum/uuid.pipe.js';
import { PagarDto } from './dto/pagar.dto.js';
import { PagamentosService } from './pagamentos.service.js';

const ID = uuidOu404('Pagamento não encontrado');

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentos: PagamentosService) {}

  @Patch(':id/pagar')
  pagar(
    @UsuarioAtual() usuario: UsuarioLogado,
    @Param('id', ID) id: string,
    @Body() dto: PagarDto,
  ) {
    return this.pagamentos.pagar(usuario.id, id, dto);
  }

  @Patch(':id/desfazer')
  desfazer(
    @UsuarioAtual() usuario: UsuarioLogado,
    @Param('id', ID) id: string,
  ) {
    return this.pagamentos.desfazer(usuario.id, id);
  }
}
