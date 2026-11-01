import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// CLI (migrations) usa a conexão direta; a aplicação usa o pooler (ver PrismaService).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? '',
  },
});
