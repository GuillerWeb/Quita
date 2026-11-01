import { NotFoundException, ParseUUIDPipe } from '@nestjs/common';

/**
 * Valida `:id` como UUID. Id malformado é tratado como registro inexistente (404),
 * com a mesma mensagem do recurso, para não diferenciar "inválido" de "de outra conta".
 */
export const uuidOu404 = (mensagem: string) =>
  new ParseUUIDPipe({
    exceptionFactory: () => new NotFoundException(mensagem),
  });
