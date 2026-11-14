import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
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

/**
 * A conexão é aberta sob demanda, na primeira consulta (não no início da aplicação):
 * na Vercel a função sobe mesmo se o banco estiver inacessível, e o erro aparece no log
 * da requisição que precisou dele.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    // A aplicação usa o pooler do Supabase (DATABASE_URL); migrations usam DIRECT_URL.
    // Timeouts curtos: se o banco não responder, falha com erro claro em vez de travar.
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 10_000,
        query_timeout: 15_000,
      }),
    });
    new Logger(PrismaService.name).log(
      `Banco: ${destino(process.env.DATABASE_URL)}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
