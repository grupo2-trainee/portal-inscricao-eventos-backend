/*
  Warnings:

  - You are about to drop the `RefreshTokenAdmin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshTokenCliente` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RefreshTokenAdmin" DROP CONSTRAINT "RefreshTokenAdmin_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "RefreshTokenCliente" DROP CONSTRAINT "RefreshTokenCliente_idUsuario_fkey";

-- DropTable
DROP TABLE "RefreshTokenAdmin";

-- DropTable
DROP TABLE "RefreshTokenCliente";
