import { ExecutionContext, HttpException } from '@nestjs/common';
import { JANELA_MS, LimiteTentativasGuard } from './limite-tentativas.guard.js';

function contexto(ip: string, path = '/auth/login'): ExecutionContext {
  const req = { ip, method: 'POST', path };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

describe('LimiteTentativasGuard (RNF-04)', () => {
  afterEach(() => vi.useRealTimers());

  it('permite 5 tentativas por minuto e bloqueia a 6ª com 429', () => {
    const guard = new LimiteTentativasGuard();
    for (let i = 0; i < 5; i++) expect(guard.canActivate(contexto('1.1.1.1'))).toBe(true);
    try {
      guard.canActivate(contexto('1.1.1.1'));
      expect.fail('deveria bloquear');
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(429);
    }
  });

  it('conta separado por IP e por rota', () => {
    const guard = new LimiteTentativasGuard();
    for (let i = 0; i < 5; i++) guard.canActivate(contexto('1.1.1.1'));
    expect(guard.canActivate(contexto('2.2.2.2'))).toBe(true);
    expect(guard.canActivate(contexto('1.1.1.1', '/auth/cadastro'))).toBe(true);
  });

  it('libera de novo depois de um minuto', () => {
    vi.useFakeTimers();
    const guard = new LimiteTentativasGuard();
    for (let i = 0; i < 5; i++) guard.canActivate(contexto('1.1.1.1'));
    vi.advanceTimersByTime(JANELA_MS);
    expect(guard.canActivate(contexto('1.1.1.1'))).toBe(true);
  });
});
