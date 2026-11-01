import { Controller, Get } from '@nestjs/common';
import {
  UsuarioAtual,
  type UsuarioLogado,
} from '../auth/usuario-atual.decorator.js';
import { PainelService } from './painel.service.js';

@Controller('painel')
export class PainelController {
  constructor(private readonly painel: PainelService) {}

  @Get()
  resumo(@UsuarioAtual() usuario: UsuarioLogado) {
    return this.painel.resumo(usuario.id);
  }
}
