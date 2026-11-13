import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

/** Host e porta da URL, sem usuário e senha, para aparecer nos logs. */
function destino(url: string | undefined): string {
  if (!url) return 'DATABASE_URL não definida';
  try {
    const u = new URL(url);
    return `${u.hostname}:${u.port || '5432'}`;
  } catch {
    return 'DATABASE_URL inválida (não é uma URL)';
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // A aplicação usa o pooler do Supabase (DATABASE_URL); migrations usam DIRECT_URL.
    // Timeout curto: se o banco não responder, falha com erro claro em vez de travar.
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 10_000,
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    const alvo = destino(process.env.DATABASE_URL);
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      this.logger.log(`Banco conectado (${alvo})`);
    } catch (erro) {
      this.logger.error(
        `Falha ao conectar no banco (${alvo}): ${(erro as Error).message}`,
      );
      throw erro;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
