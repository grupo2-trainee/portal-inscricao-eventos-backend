import { PrismaClient } from '../generated/prisma/index.js'
const prisma = new PrismaClient()

const cadEvent = async(req,res)=>{
    const { nome, dataInicio,dataFim, local, descrição} = req.body

    try{
        const novoEvento = await prisma.Evento.create({
            data: { nome, data, local, descrição }
        })
    }
}