import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

/** Junta as mensagens de validação, traduzindo as que o class-validator gera sozinho. */
function mensagensDeValidacao(erros: ValidationError[]): string[] {
  return erros.flatMap((erro) => {
    const proprias = Object.entries(erro.constraints ?? {}).map(
      ([regra, mensagem]) =>
        regra === 'whitelistValidation'
          ? `O campo ${erro.property} não é permitido`
          : mensagem,
    );
    return [...proprias, ...mensagensDeValidacao(erro.children ?? [])];
  });
}

/** Configuração comum à aplicação real (main.ts) e aos testes e2e. */
export function configurarApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (erros) =>
        new BadRequestException(mensagensDeValidacao(erros)),
    }),
  );
  app.enableCors({ origin: process.env.FRONTEND_URL });
  // Na Vercel a API fica atrás de proxy: o IP real (usado no limite de login) vem do X-Forwarded-For.
  (app as NestExpressApplication).set('trust proxy', 1);
}
