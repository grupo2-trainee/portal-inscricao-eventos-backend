import { PrismaClient } from '../generated/prisma/index.js'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'
const prisma = new PrismaClient()

// CADASTRAR ATIVIDADE
const cadActiv = async(req, res) =>{
    const { idEvento, nome, descricao, dataInicio, dataFim, localizacao, refreshToken } = req.body

    if(!nome || !dataFim || !dataInicio || !descricao || !localizacao ||!idEvento){
        return res.status(400).json({erro:"O preenchimento de todos os campos é obrigatório!"})
    }

    if(nome.length < 4){
        return res.status(400).json({erro: 'Nome do evento deve ter no mínimo 4 caracteres.'})
    }

    if(dataInicio > dataFim){
        return res.status(400).json({erro: 'Data de início deve ser anterior ou na mesma data da data de fim.'})
    }

    if(!refreshToken){
        return res.status(403).json({erro:"Usuário não autenticado."})
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    try{
        const evento = await prisma.evento.findUnique({
            where: { 
                id: idEvento,
                idAdmin
             }
        })

        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado.' })
        }

        const quantidadeInscritos = 0

        const novaAtividade = await prisma.Atividade.create({
        data:{
            nome,
            descricao,
            dataInicio,
            dataFim,
            quantidadeInscritos,
            localizacao,
            evento: {
                connect: {id: idEvento}
            }
            }
        })

        return res.status(201).json({sucesso:"Atividade cadastrada com sucesso."})

    } catch(erro){
        return res.status(500).json({erro:"Não foi possível cadastrar a nova atividade!", detalhes: erro.message })
    }
}

// REMOVER ATIVIDADE
const remActiv = async(req, res)=>{
    const {id, idEvento, refreshToken} = req.body

    if(!id || !refreshToken || !idEvento){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (erro) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    try {

        const evento  = await prisma.evento.findUnique({
            where: {
                id: idEvento,
                idAdmin
            }
        })

        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado.' })
        }

        const atividade = await prisma.atividade.findUnique({
            where: { 
                id,
                idEvento
             }
        })

        if (!atividade) {
            return res.status(404).json({ erro: 'Atividade não encontrado.' })
        }

        await prisma.atividade.delete({
            where: { id, idEvento}
        })

        return res.status(200).json({ sucesso: 'Atividade removida com sucesso.' })
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao remover Atividade.', detalhes: erro })
    }
    
}

// EXPORTAÇÕES
export default{
    cadActiv,
    remActiv
}