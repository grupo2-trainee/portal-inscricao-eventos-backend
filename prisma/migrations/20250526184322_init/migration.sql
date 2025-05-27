-- CreateTable
CREATE TABLE "RefreshTokenCliente" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "RefreshTokenCliente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RefreshTokenCliente" ADD CONSTRAINT "RefreshTokenCliente_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
