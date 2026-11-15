import { BadRequestException } from '@nestjs/common';
import { promises as dns } from 'node:dns';
import {
  MENSAGEM_DOMINIO_INEXISTENTE,
  TIMEOUT_DNS_MS,
  VerificadorEmailService,
} from './verificador-email.service.js';

/** Erro no formato que o resolvedor do Node devolve. */
function erroDns(code: string): Error {
  return Object.assign(new Error(`queryMx ${code}`), { code });
}

describe('VerificadorEmailService (D-22)', () => {
  const verificador = new VerificadorEmailService();
  const recusa = new BadRequestException(MENSAGEM_DOMINIO_INEXISTENTE);
  let resolveMx: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resolveMx = vi.spyOn(dns, 'resolveMx');
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('domínio com MX → aceita e consulta só o domínio', async () => {
    resolveMx.mockResolvedValue([{ exchange: 'mx.gmail.com', priority: 5 }]);
    await expect(
      verificador.garantirDominioComMx('ana@gmail.com'),
    ).resolves.toBeUndefined();
    expect(resolveMx).toHaveBeenCalledWith('gmail.com');
  });

  it('domínio inexistente (ENOTFOUND) → 400', async () => {
    resolveMx.mockRejectedValue(erroDns('ENOTFOUND'));
    await expect(
      verificador.garantirDominioComMx('ana@gmial.con'),
    ).rejects.toThrow(recusa);
  });

  it('domínio sem registro MX (ENODATA) → 400', async () => {
    resolveMx.mockRejectedValue(erroDns('ENODATA'));
    await expect(
      verificador.garantirDominioComMx('ana@gmial.com'),
    ).rejects.toThrow(recusa);
  });

  it('lista de MX vazia → 400', async () => {
    resolveMx.mockResolvedValue([]);
    await expect(
      verificador.garantirDominioComMx('ana@vazio.com'),
    ).rejects.toThrow(recusa);
  });

  it('"Null MX" (exchange vazio, RFC 7505) → 400', async () => {
    resolveMx.mockResolvedValue([{ exchange: '', priority: 0 }]);
    await expect(
      verificador.garantirDominioComMx('ana@example.com'),
    ).rejects.toThrow(recusa);
  });

  it.each(['ETIMEOUT', 'ECONNREFUSED', 'ESERVFAIL', 'EREFUSED', 'ECONNRESET'])(
    'erro de rede/servidor DNS (%s) → aceita',
    async (codigo) => {
      resolveMx.mockRejectedValue(erroDns(codigo));
      await expect(
        verificador.garantirDominioComMx('ana@empresa.com.br'),
      ).resolves.toBeUndefined();
    },
  );

  it('erro sem código → aceita', async () => {
    resolveMx.mockRejectedValue(new Error('falha inesperada'));
    await expect(
      verificador.garantirDominioComMx('ana@empresa.com.br'),
    ).resolves.toBeUndefined();
  });

  it('DNS sem resposta em 3 segundos → aceita', async () => {
    vi.useFakeTimers();
    resolveMx.mockReturnValue(new Promise(() => {})); // nunca responde
    const verificacao = verificador.garantirDominioComMx('ana@lento.com');
    await vi.advanceTimersByTimeAsync(TIMEOUT_DNS_MS);
    await expect(verificacao).resolves.toBeUndefined();
  });

  it('resposta antes dos 3 segundos ainda vale (não aceita por engano)', async () => {
    vi.useFakeTimers();
    resolveMx.mockImplementation(
      () =>
        new Promise((_, rejeitar) =>
          setTimeout(() => rejeitar(erroDns('ENOTFOUND')), TIMEOUT_DNS_MS - 1),
        ),
    );
    const verificacao = verificador.garantirDominioComMx('ana@nao-existe.com');
    const esperado = expect(verificacao).rejects.toThrow(recusa);
    await vi.advanceTimersByTimeAsync(TIMEOUT_DNS_MS);
    await esperado;
  });
});
