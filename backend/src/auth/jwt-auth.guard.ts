import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ROTA_PUBLICA } from './publico.decorator.js';

/** Guard global: toda rota exige JWT, exceto as marcadas com @Publico(). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(ctx: ExecutionContext) {
    const publica = this.reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (publica) return true;
    return super.canActivate(ctx);
  }

  handleRequest<T>(erro: unknown, usuario: T): T {
    if (erro || !usuario) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }
    return usuario;
  }
}
