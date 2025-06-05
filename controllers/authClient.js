import { PrismaClient } from '../generated/prisma/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const prisma = new PrismaClient()
const JWT_SECRET = process.JWT_SECRET || 'includeJr'

// CADASTRAR USUÁRIO CLIENTE
const cadClient = async(req, res) => {
    const { nome, email, senha } = req.body
    if(senha.length < 8){
        res.status(400).json({erro: 'Erro, senha deve ter no mínimo 8 caracteres.'})
    }
    if(nome.length < 4){
        res.status(400).json({erro: 'Erro, nome deve ter no mínimo 4 caracteres.'})
    }
    const senhaCript = await bcrypt.hash(senha, 10)

     const cadastradoCliente = await prisma.cliente.findMany({
        where: {email},
    })

    const cadastradoAdmin = await prisma.administrador.findMany({
        where: {email},
    })

    if(cadastradoCliente || cadastradoAdmin){
        res.status(400).json({erro: 'Erro, esse email já foi cadastrado, por favor use outro.'})
    }
    try{
        const novoUsuario = await prisma.cliente.create({
            data:{nome, email, senha: senhaCript}
        })
        res.status(201).json({sucesso: "Usuário criado com sucesso."})
    }catch(error){
        res.status(500).json({erro: 'Erro ao criar novo usuário cliente.', detalhes: error})
    }
}

// INSCREVE O CLIENTE EM EVENTOS
const inscEventClient = async (req, res) => {
    const {idEvento, refreshToken} = req.body
    if(!idEvento || !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    let idCliente
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idCliente = decodedToken.id

        const evento = await prisma.evento.findUnique({
            where: {
                id: idEvento
            }
        })

        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado.' })
        }

        const cliente = await prisma.cliente.findUnique({
            where: { id: idCliente }
        })

        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' })
        }

        const inscrito = await prisma.InscricaoEvento.findFirst({
            where: {
                idEvento,
                idCliente
            }
        })

        if(inscrito){
            return res.status(404).json({ erro: 'Cliente já inscrito no evento.' })
        }

        const inscricao = await prisma.InscricaoEvento.create({
            data: {
                idEvento,
                idCliente
            }
        })

        await prisma.evento.update({
            where: { id: idEvento },
            data: {
                quantidadeInscritos: {
                    increment: 1
                }
            }
        })


        return res.status(201).json({ sucesso: 'Inscrição realizada com sucesso.' })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao realizar inscrição.', detalhes: error.message })
    }
    
}

// DESINSCREVE O CLIENTE DE EVENTOS
const desinscEventClient = async (req, res) => {
    const {idEvento, refreshToken} = req.body
    if(!idEvento || !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const evento = await prisma.evento.findUnique({
            where: {
                id: idEvento,
            }
        })

        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado.' })
        }

        const cliente = await prisma.cliente.findUnique({
            where: { id: idCliente }
        })

        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' })
        }

        const idInscricao = await prisma.InscricaoEvento.findFirst({
            where:{
                idEvento,
                idCliente
            }
        })

        if(!idInscricao){
            return res.status(404).json({ erro: 'Cliente não inscrito no evento.' })
        }

        const inscricao = await prisma.InscricaoEvento.delete({
            where: {
                id: idInscricao.id
            }
        })

        await prisma.evento.update({
            where: { id: idEvento },
            data: {
                quantidadeInscritos: {
                    decrement: 1
                }
            }
        })

        const atividades = await prisma.atividade.findMany({
            where:{
                idEvento
            },
            select:{
                id: true
            }
        })

        const idsAtividades = atividades.map(a => a.id)


        await prisma.InscricaoAtividade.deleteMany({
            where:{
                idCliente,
                idAtividade: {in: idsAtividades}
            }
        })

        return res.status(200).json({ sucesso: 'Desinscrição realizada com sucesso.' })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao realizar desinscrição.', detalhes: error })
    }
}

// INSCREVE O CLIENTE EM ATIVIDADES
const inscAtvClient = async (req, res) => {
    const {idAtividade, refreshToken} = req.body
    if(!idAtividade || !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const atividade = await prisma.atividade.findUnique({
            where: {
                id: idAtividade,
            }
        })

        if (!atividade) {
            return res.status(404).json({ erro: 'Atividade não encontrada.' })
        }

        const inscrito = await prisma.InscricaoAtividade.findFirst({
            where: {
                idAtividade,
                idCliente
            }
        })

        if(inscrito){
            return res.status(404).json({ erro: 'Cliente já inscrito na atividade.' })
        }

        if (atividade.quantidadeInscritos >= atividade.maximoInscritos) {
            return res.status(400).json({ erro: 'Número máximo de inscrições atingido.' })
        }

        await prisma.atividade.update({
            where: { id: idAtividade },
            data: {
                quantidadeInscritos: {
                    increment: 1
                }
            }
        })

        const cliente = await prisma.cliente.findUnique({
            where: { id: idCliente }
        })

        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' })
        }

        const idInscricao = await prisma.InscricaoEvento.findFirst({
            where:{
                idEvento: atividade.idEvento,
                idCliente
            }
        })

        if(!idInscricao){
            return res.status(404).json({ erro: 'Cliente não inscrito no evento.' })
        }

        const conflitos = await prisma.inscricaoAtividade.findMany({
            where: { idCliente },
            include: {atividade: true}
        })

        const conflito = conflitos.find(a => {
            return (
                new Date(atividade.dataInicio) < new Date(a.atividade.dataFim) &&
                new Date(atividade.dataFim) > new Date(a.atividade.dataInicio)
            )
        })

        if (conflito) {
            return res.status(400).json({ erro: 'Horário conflitante.'})
        }

        const inscricaoAtividade = await prisma.InscricaoAtividade.create({
            data: {
                idAtividade,
                idCliente
            }
        })

        return res.status(201).json({ sucesso: 'Inscrição na atividade realizada com sucesso.' })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao realizar inscrição na atividade.', detalhes: error.message })
    }
}

// DESINSCREVE O CLIENTE EM ATIVIDADES
const desinscAtvClient = async (req, res) => {
    const {idAtividade, refreshToken} = req.body
    if(!idAtividade || !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const atividade = await prisma.atividade.findUnique({
            where: {
                id: idAtividade,
            }
        })

        if (!atividade) {
            return res.status(404).json({ erro: 'Atividade não encontrada.' })
        }

        const cliente = await prisma.cliente.findUnique({
            where: { id: idCliente }
        })

        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' })
        }

        const idInscricao = await prisma.InscricaoAtividade.findFirst({
            where:{
                idAtividade,
                idCliente
            }
        })

        if(!idInscricao){
            return res.status(404).json({ erro: 'Cliente não inscrito na atividade.' })
        }

        const inscricaoAtividade = await prisma.InscricaoAtividade.delete({
            where: {
                id: idInscricao.id
            }
        })

        await prisma.atividade.update({
            where: { id: idAtividade },
            data: {
                quantidadeInscritos: {
                    decrement: 1
                }
            }
        })


        return res.status(200).json({ sucesso: 'Desinscrição na atividade realizada com sucesso.' })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao realizar desinscrição na atividade.', detalhes: error.message })
    }
}

// EDITA PERFIL DO CLIENTE
const editProfileClient = async (req, res) => {
    const { nome, email, senha, refreshToken } = req.body
    if (!refreshToken) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const cliente = await prisma.cliente.findUnique({
            where: { 
                id: idCliente
            }
        })

        if (!cliente || cliente.id !== idCliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' })
        }

        const updatedData = {}
        if (nome) updatedData.nome = nome
        if (email) updatedData.email = email
        if (senha) updatedData.senha = await bcrypt.hash(senha, 10)

        const updatedCliente = await prisma.cliente.update({
            where: { id: idCliente },
            data: updatedData
        })

        return res.status(200).json({ sucesso: 'Perfil atualizado com sucesso.'})
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao atualizar perfil.', detalhes: error.message })
    }
}

// VER PERFIL DO CLIENTE
const viewProfileClient = async (req, res) => {
    const { refreshToken } = req.body
    if ( !refreshToken) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const cliente = await prisma.cliente.findUnique({
            where: { id: idCliente }
        })

        if (!cliente || cliente.id !== idCliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' })
        }

        cliente.senha = ""

        return res.status(200).json({ sucesso: 'Perfil encontrado.', cliente })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao visualizar perfil.', detalhes: error.message })
    }
}

// VER ATIVIADES INSCRITAS DO CLIENTE
const viewinscAtvClient = async (req, res) => {
    const { refreshToken } = req.body
    if (!refreshToken) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const inscricoesAtividades = await prisma.InscricaoAtividade.findMany({
            where: { idCliente },
            include: {
                atividade: true
            }
        })

        if (inscricoesAtividades.length === 0) {
            return res.status(404).json({ erro: 'Nenhuma inscrição encontrada.' })
        }

        return res.status(200).json({ sucesso: 'Inscrições encontradas.', inscricoesAtividades })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao visualizar inscrições.', detalhes: error.message })
    }
}

// VER EVENTOS INSCRITOS DO CLIENTE
const viewInscEventClient = async (req, res) => {
    const { refreshToken } = req.body
    if (!refreshToken) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const inscricoesEventos = await prisma.InscricaoEvento.findMany({
            where: { idCliente },
            include: {
                evento: true
            }
        })

        if (inscricoesEventos.length === 0) {
            return res.status(404).json({ erro: 'Nenhuma inscrição encontrada.' })
        }

        return res.status(200).json({ sucesso: 'Inscrições encontradas.', inscricoesEventos })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao visualizar inscrições.', detalhes: error.message })
    }
}


export default{
    viewInscEventClient,
    viewinscAtvClient,
    viewProfileClient,
    editProfileClient,
    inscAtvClient,
    desinscAtvClient,
    desinscEventClient,
    inscEventClient,
    cadClient,
}