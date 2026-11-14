import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configurarApp } from './configurar-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configurarApp(app);
  await app.listen(process.env.PORT ?? 3000);
}
// Sem await no topo do módulo: na Vercel, o módulo precisa terminar de carregar para a
// função receber requisições; com top-level await ele esperava o listen() e travava.
bootstrap().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
