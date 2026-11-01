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
  Query,
} from '@nestjs/common';
import {
  UsuarioAtual,
  type UsuarioLogado,
} from '../auth/usuario-atual.decorator.js';
import { uuidOu404 } from '../comum/uuid.pipe.js';
import { AtualizarInquilinoDto } from './dto/atualizar-inquilino.dto.js';
import { CriarInquilinoDto } from './dto/criar-inquilino.dto.js';
import { ListarInquilinosDto } from './dto/listar-inquilinos.dto.js';
import { SaidaDto } from './dto/saida.dto.js';
import { InquilinosService } from './inquilinos.service.js';

const ID = uuidOu404('Inquilino não encontrado');

@Controller('inquilinos')
export class InquilinosController {
  constructor(private readonly inquilinos: InquilinosService) {}

  @Get()
  listar(
    @UsuarioAtual() usuario: UsuarioLogado,
    @Query() filtro: ListarInquilinosDto,
  ) {
    return this.inquilinos.listar(usuario.id, filtro.ativos);
  }

  @Post()
  criar(
    @UsuarioAtual() usuario: UsuarioLogado,
    @Body() dto: CriarInquilinoDto,
  ) {
    return this.inquilinos.criar(usuario.id, dto);
  }

  @Get(':id')
  detalhe(@UsuarioAtual() usuario: UsuarioLogado, @Param('id', ID) id: string) {
    return this.inquilinos.detalhe(usuario.id, id);
  }

  @Patch(':id')
  atualizar(
    @UsuarioAtual() usuario: UsuarioLogado,
    @Param('id', ID) id: string,
    @Body() dto: AtualizarInquilinoDto,
  ) {
    return this.inquilinos.atualizar(usuario.id, id, dto);
  }

  @Post(':id/saida')
  @HttpCode(HttpStatus.OK)
  registrarSaida(
    @UsuarioAtual() usuario: UsuarioLogado,
    @Param('id', ID) id: string,
    @Body() dto: SaidaDto,
  ) {
    return this.inquilinos.registrarSaida(usuario.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  excluir(@UsuarioAtual() usuario: UsuarioLogado, @Param('id', ID) id: string) {
    return this.inquilinos.excluir(usuario.id, id);
  }
}
