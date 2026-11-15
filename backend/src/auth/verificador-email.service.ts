import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { promises as dns } from 'node:dns';

export const TIMEOUT_DNS_MS = 3_000;

export const MENSAGEM_DOMINIO_INEXISTENTE =
  'O domínio do e-mail não parece existir. Confira se digitou corretamente.';

/**
 * Códigos do DNS que querem dizer "o domínio não recebe e-mail":
 * ENOTFOUND = domínio não existe (NXDOMAIN); ENODATA = existe, mas não tem registro MX.
 * Qualquer outro erro (timeout, servidor fora, rede) é falha nossa, não do usuário.
 */
const CODIGOS_SEM_DOMINIO = new Set(['ENOTFOUND', 'ENODATA']);

const ESGOTOU = Symbol('timeout');

/** D-22: confere, no cadastro, se o domínio do e-mail tem registros MX. */
@Injectable()
export class VerificadorEmailService {
  private readonly logger = new Logger(VerificadorEmailService.name);

  /** Lança 400 se o domínio não existe ou não recebe e-mail; em dúvida, aceita. */
  async garantirDominioComMx(email: string): Promise<void> {
    const dominio = email.slice(email.lastIndexOf('@') + 1);
    if (!(await this.dominioPodeReceber(dominio))) {
      throw new BadRequestException(MENSAGEM_DOMINIO_INEXISTENTE);
    }
  }

  private async dominioPodeReceber(dominio: string): Promise<boolean> {
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const esgotou = new Promise<typeof ESGOTOU>((resolver) => {
      temporizador = setTimeout(() => resolver(ESGOTOU), TIMEOUT_DNS_MS);
    });

    try {
      const resultado = await Promise.race([dns.resolveMx(dominio), esgotou]);
      if (resultado === ESGOTOU) {
        this.logger.warn(
          `DNS sem resposta em ${TIMEOUT_DNS_MS} ms para ${dominio}; cadastro aceito`,
        );
        return true;
      }
      // "Null MX" (RFC 7505): um único registro com exchange vazio = domínio não recebe e-mail.
      return resultado.some((mx) => mx.exchange !== '' && mx.exchange !== '.');
    } catch (erro) {
      const codigo = (erro as { code?: string }).code ?? '';
      if (CODIGOS_SEM_DOMINIO.has(codigo)) return false;
      this.logger.warn(
        `Falha no DNS (${codigo || 'desconhecida'}) para ${dominio}; cadastro aceito`,
      );
      return true;
    } finally {
      clearTimeout(temporizador);
    }
  }
}
