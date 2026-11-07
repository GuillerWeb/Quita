-- CreateEnum
CREATE TYPE "InicioCobranca" AS ENUM ('MES_SEGUINTE', 'MES_DA_ENTRADA');

-- AlterTable
ALTER TABLE "Inquilino" ADD COLUMN     "inicioCobranca" "InicioCobranca" NOT NULL DEFAULT 'MES_SEGUINTE';

-- Inquilinos já cadastrados tiveram os meses gerados pela regra antiga (primeiro vencimento
-- igual ou posterior à entrada): mantêm esse comportamento. Os novos usam o padrão.
UPDATE "Inquilino" SET "inicioCobranca" = 'MES_DA_ENTRADA';
