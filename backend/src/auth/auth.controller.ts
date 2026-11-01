import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { CadastroDto } from './dto/cadastro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Publico } from './publico.decorator.js';
import { UsuarioAtual, type UsuarioLogado } from './usuario-atual.decorator.js';

// RNF-04: 5 tentativas por minuto por IP em cadastro e login.
const LIMITE_AUTH = { default: { limit: 5, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Publico()
  @UseGuards(ThrottlerGuard)
  @Throttle(LIMITE_AUTH)
  @Post('cadastro')
  cadastrar(@Body() dto: CadastroDto) {
    return this.auth.cadastrar(dto);
  }

  @Publico()
  @UseGuards(ThrottlerGuard)
  @Throttle(LIMITE_AUTH)
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
