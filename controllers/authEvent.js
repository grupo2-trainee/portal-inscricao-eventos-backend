import { PrismaClient } from '../generated/prisma/index.js'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'
const prisma = new PrismaClient()

const cadEvent = async(req,res)=>{
    const { nome, dataInicio,dataFim, descricao, cidade, categoria, refreshToken} = req.body

    if(nome.length < 4){
        res.status(400).json({erro: 'Nome do evento deve ter no mínimo 4 caracteres.'})
    }
    if(dataInicio > dataFim){
        res.status(400).json({erro: 'Data de início deve ser anterior ou na mesma data da data de fim.'})
    }
    if(!cidade || !categoria || !dataInicio || !dataFim || !descricao){
        res.status(400).json({erro: 'Todos os campos são obrigatórios '})
    }
    if(!refreshToken){
        res.status(403).json({erro: 'Usuário não autenticado.'})
    }
    const decodedToken = jwt.decode(refreshToken)
    try{
        const novoEvento = await prisma.Evento.create({
            data: {
                idAdmin: decodedToken.id,
                nome,
                descricao,
                dataInicio,
                dataFim,
                quantidadeInscritos: 0,
                categoria,
                cidade
            }
        })
        res.status(200).json({sucesso: "Evento criado com sucesso.", evento: novoEvento})
    }catch(erro){
        res.status(500).json({erro: 'Erro ao criar evento.', detalhes: erro})
    }
}

export default {
    cadEvent
}