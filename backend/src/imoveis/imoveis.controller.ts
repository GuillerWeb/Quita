import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  UsuarioAtual,
  type UsuarioLogado,
} from '../auth/usuario-atual.decorator.js';
import { uuidOu404 } from '../comum/uuid.pipe.js';
import { AtualizarImovelDto } from './dto/atualizar-imovel.dto.js';
import { CriarImovelDto } from './dto/criar-imovel.dto.js';
import { ImoveisService } from './imoveis.service.js';

const ID = uuidOu404('Imóvel não encontrado');

@Controller('imoveis')
export class ImoveisController {
  constructor(private readonly imoveis: ImoveisService) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioLogado) {
    return this.imoveis.listar(usuario.id);
  }

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioLogado, @Body() dto: CriarImovelDto) {
    return this.imoveis.criar(usuario.id, dto);
  }

  @Get(':id')
  buscar(@UsuarioAtual() usuario: UsuarioLogado, @Param('id', ID) id: string) {
    return this.imoveis.buscar(usuario.id, id);
  }

  @Patch(':id')
  atualizar(
    @UsuarioAtual() usuario: UsuarioLogado,
    @Param('id', ID) id: string,
    @Body() dto: AtualizarImovelDto,
  ) {
    return this.imoveis.atualizar(usuario.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  excluir(@UsuarioAtual() usuario: UsuarioLogado, @Param('id', ID) id: string) {
    return this.imoveis.excluir(usuario.id, id);
  }
}
