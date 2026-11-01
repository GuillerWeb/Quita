import { INestApplication, ValidationPipe } from '@nestjs/common';

/** Configuração comum à aplicação real (main.ts) e aos testes e2e. */
export function configurarApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({ origin: process.env.FRONTEND_URL });
}
