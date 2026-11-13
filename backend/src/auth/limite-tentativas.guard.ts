import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

/** RNF-04: 5 tentativas por minuto, por IP, em cada rota de auth. */
export const LIMITE_TENTATIVAS = 5;
export const JANELA_MS = 60_000;

/**
 * Limitador simples em memória (substitui o @nestjs/throttler, que é CommonJS e não
 * carrega na Vercel junto do Nest 12, que é só ESM — ver D-20). Na Vercel cada instância
 * da função tem a própria memória: o limite vale por instância, como já era antes.
 */
@Injectable()
export class LimiteTentativasGuard implements CanActivate {
  private readonly tentativas = new Map<string, number[]>();

  canActivate(contexto: ExecutionContext): boolean {
    const req = contexto.switchToHttp().getRequest<Request>();
    const chave = `${req.ip ?? 'desconhecido'}|${req.method} ${req.path}`;
    const agora = Date.now();

    const recentes = (this.tentativas.get(chave) ?? []).filter(
      (t) => agora - t < JANELA_MS,
    );
    if (recentes.length >= LIMITE_TENTATIVAS) {
      this.tentativas.set(chave, recentes);
      throw new HttpException(
        'Muitas tentativas. Aguarde um minuto e tente novamente.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    recentes.push(agora);
    this.tentativas.set(chave, recentes);
    this.limparAntigas(agora);
    return true;
  }

  /** Evita que o mapa cresça sem limite com IPs que não voltam mais. */
  private limparAntigas(agora: number): void {
    if (this.tentativas.size < 1000) return;
    for (const [chave, lista] of this.tentativas) {
      if (lista.every((t) => agora - t >= JANELA_MS)) this.tentativas.delete(chave);
    }
  }
}
