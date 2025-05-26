/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `RefreshTokenAdmin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `RefreshTokenCliente` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenAdmin_token_key" ON "RefreshTokenAdmin"("token");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenCliente_token_key" ON "RefreshTokenCliente"("token");
