-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('AGUARDANDO', 'PAGO');

-- CreateTable
CREATE TABLE "Proprietario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proprietario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquilino" (
    "id" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "cpf" TEXT,
    "observacoes" TEXT,
    "valorAluguel" DECIMAL(10,2) NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "dataEntrada" DATE NOT NULL,
    "dataSaida" DATE,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquilino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,
    "inquilinoId" TEXT NOT NULL,
    "competencia" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "dataVencimento" DATE NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'AGUARDANDO',
    "dataPagamento" DATE,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proprietario_email_key" ON "Proprietario"("email");

-- CreateIndex
CREATE INDEX "Imovel_proprietarioId_idx" ON "Imovel"("proprietarioId");

-- CreateIndex
CREATE INDEX "Inquilino_proprietarioId_idx" ON "Inquilino"("proprietarioId");

-- CreateIndex
CREATE INDEX "Inquilino_imovelId_idx" ON "Inquilino"("imovelId");

-- CreateIndex
CREATE INDEX "Pagamento_proprietarioId_status_dataVencimento_idx" ON "Pagamento"("proprietarioId", "status", "dataVencimento");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_inquilinoId_competencia_key" ON "Pagamento"("inquilinoId", "competencia");

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquilino" ADD CONSTRAINT "Inquilino_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquilino" ADD CONSTRAINT "Inquilino_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- RN-06: no máximo um inquilino ativo por imóvel (o Prisma não expressa índice parcial)
CREATE UNIQUE INDEX "inquilino_um_ativo_por_imovel"
  ON "Inquilino" ("imovelId") WHERE "dataSaida" IS NULL;
