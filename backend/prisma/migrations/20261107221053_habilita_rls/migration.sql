-- Habilita Row Level Security em todas as tabelas do schema public (Security Advisor do
-- Supabase: "RLS Disabled in Public"). Sem políticas de propósito: a Data API do Supabase
-- (roles anon/authenticated) fica sem acesso nenhum. O backend acessa pelo Prisma com o
-- usuário postgres, dono das tabelas, que não é afetado pelo RLS (não usamos FORCE).
ALTER TABLE "Proprietario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Imovel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inquilino" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pagamento" ENABLE ROW LEVEL SECURITY;
-- IF EXISTS: a shadow database do `prisma migrate dev` não tem a tabela _prisma_migrations.
ALTER TABLE IF EXISTS "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
