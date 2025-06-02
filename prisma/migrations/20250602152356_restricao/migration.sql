/*
  Warnings:

  - Added the required column `tipo` to the `Evento` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `categoria` on the `Evento` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "categoriaEvento" AS ENUM ('academico', 'cientifico', 'corporativo', 'curso', 'entretenimento', 'religioso', 'esportivo', 'exibicao', 'networking', 'outro');

-- CreateEnum
CREATE TYPE "tipoEvento" AS ENUM ('online', 'presencial', 'hibrido');

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "tipo" "tipoEvento" NOT NULL,
DROP COLUMN "categoria",
ADD COLUMN     "categoria" "categoriaEvento" NOT NULL;
