import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CadastroDto } from './dto/cadastro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { LimiteTentativasGuard } from './limite-tentativas.guard.js';
import { Publico } from './publico.decorator.js';
import { UsuarioAtual, type UsuarioLogado } from './usuario-atual.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Publico()
  @UseGuards(LimiteTentativasGuard) // RNF-04: 5 tentativas/minuto por IP
  @Post('cadastro')
  cadastrar(@Body() dto: CadastroDto) {
    return this.auth.cadastrar(dto);
  }

  @Publico()
  @UseGuards(LimiteTentativasGuard) // RNF-04: 5 tentativas/minuto por IP
  @Post('login')
  @HttpCode(HttpStatus.OK)
  entrar(@Body() dto: LoginDto) {
    return this.auth.entrar(dto);
  }

  @Get('eu')
  eu(@UsuarioAtual() usuario: UsuarioLogado) {
    return this.auth.eu(usuario.id);
  }
}
