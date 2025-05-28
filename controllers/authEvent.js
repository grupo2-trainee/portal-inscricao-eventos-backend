import { PrismaClient } from '../generated/prisma/index.js'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'
const prisma = new PrismaClient()

// CADASTRAR EVENTO
const cadEvent = async(req,res)=>{
    const { nome, descricao, dataInicio, dataFim, categoria, cidade, refreshToken} = req.body

    if(nome.length < 4){
        return res.status(400).json({erro: 'Nome do evento deve ter no mínimo 4 caracteres.'})
    }

    if(dataInicio > dataFim){
        return res.status(400).json({erro: 'Data de início deve ser anterior ou na mesma data da data de fim.'})
    }

    if(!cidade || !categoria || !dataInicio || !dataFim || !descricao){
        return res.status(400).json({erro: 'Todos os campos são obrigatórios '})
    }

    if(!refreshToken){
        return res.status(403).json({erro: 'Usuário não autenticado.'})
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    const quantidadeInscritos = 0

    try{
        const novoEvento = await prisma.evento.create({
            data: {
                nome,
                descricao,
                dataInicio,
                dataFim,
                quantidadeInscritos,
                categoria,
                cidade,
                administrador: {
                    connect:{ id: idAdmin }
                }
            }
        })

        return res.status(200).json({sucesso: "Evento criado com sucesso.", evento: novoEvento})

    }catch(erro){
        return res.status(500).json({erro: 'Erro ao criar evento.', detalhes: erro})
    }
}

// REMOVER EVENTO
const remEvent = async(req, res)=>{
    const {id, refreshToken} = req.body

    if(!id, !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    try {
        const evento = await prisma.evento.findUnique({
            where: { 
                id,
                idAdmin
             }
        })

        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado.' })
        }

        await prisma.evento.delete({
            where: { id, idAdmin}
        })

        return res.status(200).json({ sucesso: 'Evento removido com sucesso.' })
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao remover evento.', detalhes: erro })
    }
    
}

// EDITAR EVENTO
const ediEvent = async (req, res) => {
    const { id, nome, descricao, dataInicio, dataFim, categoria, cidade, refreshToken } = req.body

    if(!id) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }

    if(nome && nome.length < 4){
        return res.status(400).json({erro: 'Nome do evento deve ter no mínimo 4 caracteres.'})
    }

    if(dataInicio > dataFim){
        return res.status(400).json({erro: 'Data de início deve ser anterior ou na mesma data da data de fim.'})
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    const dataEdit = {}
    if(nome != null) dataEdit.nome = nome
    if(descricao != null) dataEdit.descricao = descricao
    if(dataInicio != null) dataEdit.dataInicio = dataInicio
    if(dataFim != null) dataEdit.dataFim = dataFim
    if(categoria != null) dataEdit.categoria = categoria
    if(cidade != null) dataEdit.cidade = cidade

    try {
        const evento = await prisma.evento.findUnique({ where: { id } })
        if (!evento || evento.idAdmin != idAdmin) {
            return res.status(404).json({ erro: 'Evento não encontrado.' })
        }

        const eventoAtualizado = await prisma.evento.update({
            where: { id },
            data: dataEdit
        })

        return res.status(200).json({ sucesso: 'Evento editado com sucesso.'})
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao editar evento.', detalhes: erro.message })
    }
}

//LISTAR EVENTOS
const listEvent = async (req, res) => {
    const { categoria, refreshToken } = req.body
    const listaCategorias = categoria ? categoria.split(',') : [];

    if(!refreshToken){
        return res.status(403).json({erro: 'Usuário não autenticado.'})
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    const filtro = {
        idAdmin,
        ...listaCategorias.length > 0 &&{
            categoria: {
                in: listaCategorias
            }
        }
    }

    const eventos = await prisma.evento.findMany({
        where: filtro,
        orderBy: {dataInicio: 'asc'}
    })

    return res.status(200).json({"Lista de eventos": eventos})
}

// EXPORTAÇÕES
export default {
    ediEvent,
    remEvent,
    cadEvent,
    listEvent
}