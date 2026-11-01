import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UsuarioLogado {
  id: string;
  email: string;
}

/** Proprietário logado, sempre vindo do JWT (regra 1 do CLAUDE.md). */
export const UsuarioAtual = createParamDecorator(
  (_dados: unknown, ctx: ExecutionContext): UsuarioLogado =>
    ctx.switchToHttp().getRequest<{ user: UsuarioLogado }>().user,
);
