/*
  Warnings:

  - Added the required column `localizacao` to the `Atividade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoria` to the `Evento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cidade` to the `Evento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Atividade" DROP CONSTRAINT "Atividade_idEvento_fkey";

-- DropForeignKey
ALTER TABLE "Evento" DROP CONSTRAINT "Evento_idAdmin_fkey";

-- DropForeignKey
ALTER TABLE "InscricaoAtividade" DROP CONSTRAINT "InscricaoAtividade_idAtividade_fkey";

-- DropForeignKey
ALTER TABLE "InscricaoAtividade" DROP CONSTRAINT "InscricaoAtividade_idCliente_fkey";

-- DropForeignKey
ALTER TABLE "InscricaoEvento" DROP CONSTRAINT "InscricaoEvento_idCliente_fkey";

-- DropForeignKey
ALTER TABLE "InscricaoEvento" DROP CONSTRAINT "InscricaoEvento_idEvento_fkey";

-- AlterTable
ALTER TABLE "Atividade" ADD COLUMN     "localizacao" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "categoria" TEXT NOT NULL,
ADD COLUMN     "cidade" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RefreshTokenAdmin" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "RefreshTokenAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshTokenCliente" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "RefreshTokenCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenAdmin_token_key" ON "RefreshTokenAdmin"("token");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenCliente_token_key" ON "RefreshTokenCliente"("token");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_idAdmin_fkey" FOREIGN KEY ("idAdmin") REFERENCES "Administrador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscricaoEvento" ADD CONSTRAINT "InscricaoEvento_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscricaoEvento" ADD CONSTRAINT "InscricaoEvento_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscricaoAtividade" ADD CONSTRAINT "InscricaoAtividade_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscricaoAtividade" ADD CONSTRAINT "InscricaoAtividade_idAtividade_fkey" FOREIGN KEY ("idAtividade") REFERENCES "Atividade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshTokenAdmin" ADD CONSTRAINT "RefreshTokenAdmin_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Administrador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshTokenCliente" ADD CONSTRAINT "RefreshTokenCliente_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
