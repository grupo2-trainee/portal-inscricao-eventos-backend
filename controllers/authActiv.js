import { PrismaClient } from '../generated/prisma/index.js'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'
const prisma = new PrismaClient()

const cadActiv = async(res, req) =>{
    const {nome, dataInicio, dataFim, descricao, localizacao} = req.body

    if(!nome || !dataFim || !dataInicio || !descricao || !localizacao){
        res.status(400).json({erro:"O preenchimento de todos os campos é obrigatório!"})
    }

    try{
        const novaatividade = prisma.atividade.create({
        data:{
            nome,
            dataFim,
            dataInicio,
            descricao,
            localizacao
            }
        })
    res.status(201).json({sucesso:"Atividade cadastrada com sucesso."})
    }catch(erro){
        res.status(500).json({erro:"Não foi possível cadastrar a nova atividade!"})
    }
}

const remActiv = async(req, res)=>{
    const {id, refreshToken} = req.body

    if(!id, !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    let idEvento
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idEvento = decodedToken.id

    } catch (erro) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    try {
        const Atividade = await prisma.atividade.findUnique({
            where: { 
                id,
                idEvento
             }
        })

        if (!Atividade) {
            return res.status(404).json({ erro: 'Atividade não encontrado.' })
        }

        await prisma.evento.delete({
            where: { id, idEvento}
        })

        return res.status(200).json({ sucesso: 'Atividade removida com sucesso.' })
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao remover Atividade.', detalhes: erro })
    }
    
}


export{
    cadActiv,
    remActiv
}