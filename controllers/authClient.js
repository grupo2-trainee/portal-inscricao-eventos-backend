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
    try{
        const novoUsuario = await prisma.cliente.create({
            data:{nome, email, senha: senhaCript}
        })
        res.status(201).json({sucesso: "Usuário criado com sucesso."})
    }catch(error){
        res.status(500).json({erro: 'Erro ao criar novo usuário cliente.', detalhes: error})
    }
}

// LOGIN USUÁRIO CLIENTE
const logClient = async(req, res) => {
    const { email, senha } = req.body
    if(!email || !senha){
        res.status(400).json({erro: 'Email e senha são obrigatórios.'})
    }
    if(senha.length < 8){
        res.status(400).json({erro: 'Erro, senha deve ter no mínimo 8 caracteres.'})
    }

    try{
        const usuario = await prisma.Cliente.findUnique({where: { email }})
        if(!usuario){
            res.status(404).json({erro: 'Usuário não encontrado.'})
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha)
        if(!senhaValida){
            res.status(401).json({erro: 'Senha inválida.'})
        }

        const accessToken = jwt.sign({ id: usuario.id, type: "CLIENT" }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: usuario.id, type: "CLIENT" }, JWT_SECRET, { expiresIn: '7d' });

        await prisma.refreshTokenCliente.create({
            data: {
                token: refreshToken,
                idUsuario: usuario.id
            }
        })

        res.status(200).json({sucesso: "Login realizado com sucesso.", accessToken: accessToken, refreshToken: refreshToken})
    }catch(error){
        res.status(500).json({erro: 'Erro ao realizar login.', detalhes: error})
    }

}

// INSCREVE O CLIENTE EM EVENTOS
const inscEventClient = async (req, res) => {
    const {idEvento, idCliente, refreshToken} = req.body
    if(!idEvento || !idCliente || !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const evento = await prisma.evento.findUnique({
            where: {
                id: idEvento,
                idCliente
            }
        })

        if (!evento.quantidadeInscritos >= evento.maximoInscritos) {
            return res.status(400).json({ erro: 'Número máximo de inscrições atingido.' })
        }

        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado.' })
        }

        const cliente = await prisma.cliente.findUnique({
            where: { id: idCliente }
        })

        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' })
        }

        const inscricao = await prisma.inscricao.create({
            data: {
                idEvento,
                idCliente
            }
        })

        return res.status(201).json({ sucesso: 'Inscrição realizada com sucesso.', inscricao })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao realizar inscrição.', detalhes: error.message })
    }
    
}

// DESINSCREVE O CLIENTE DE EVENTOS
const desinscEventClient = async (req, res) => {
    const {idEvento, idCliente, refreshToken} = req.body
    if(!idEvento || !idCliente || !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const evento = await prisma.evento.findUnique({
            where: {
                id: idEvento,
                idCliente
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

        const inscricao = await prisma.inscricao.delete({
            where: {
                idEvento_idCliente: {
                    idEvento,
                    idCliente
                }
            }
        })

        return res.status(200).json({ sucesso: 'Desinscrição realizada com sucesso.', inscricao })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao realizar desinscrição.', detalhes: error.message })
    }
}

// INSCREVE O CLIENTE EM ATIVIDADES
const inscAtvClient = async (req, res) => {
    const {idAtividade, idCliente, refreshToken} = req.body
    if(!idAtividade || !idCliente || !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const atividade = await prisma.atividade.findUnique({
            where: {
                id: idAtividade,
                idCliente
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

        const inscricaoAtividade = await prisma.inscricaoAtividade.create({
            data: {
                idAtividade,
                idCliente
            }
        })

        return res.status(201).json({ sucesso: 'Inscrição na atividade realizada com sucesso.', inscricaoAtividade })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao realizar inscrição na atividade.', detalhes: error.message })
    }
}

// DESINSCREVE O CLIENTE EM ATIVIDADES
const desinscAtvClient = async (req, res) => {
    const {idAtividade, idCliente, refreshToken} = req.body
    if(!idAtividade || !idCliente || !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const atividade = await prisma.atividade.findUnique({
            where: {
                id: idAtividade,
                idCliente
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

        const inscricaoAtividade = await prisma.inscricaoAtividade.delete({
            where: {
                idAtividade_idCliente: {
                    idAtividade,
                    idCliente
                }
            }
        })

        return res.status(200).json({ sucesso: 'Desinscrição na atividade realizada com sucesso.', inscricaoAtividade })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao realizar desinscrição na atividade.', detalhes: error.message })
    }
}

// EDITA PERFIL DO CLIENTE
const editProfileClient = async (req, res) => {
    const { id, nome, email, senha, refreshToken } = req.body
    if (!id || !refreshToken) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idAdmin = decodedToken.id

        const cliente = await prisma.cliente.findUnique({
            where: { id }
        })

        if (!cliente || cliente.id !== idAdmin) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' })
        }

        const updatedData = {}
        if (nome) updatedData.nome = nome
        if (email) updatedData.email = email
        if (senha) updatedData.senha = await bcrypt.hash(senha, 10)

        const updatedCliente = await prisma.cliente.update({
            where: { id },
            data: updatedData
        })

        return res.status(200).json({ sucesso: 'Perfil atualizado com sucesso.', cliente: updatedCliente })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao atualizar perfil.', detalhes: error.message })
    }
}

// VER PERFIL DO CLIENTE
const viewProfileClient = async (req, res) => {
    const { id, refreshToken } = req.body
    if (!id || !refreshToken) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const cliente = await prisma.cliente.findUnique({
            where: { id }
        })

        if (!cliente || cliente.id !== idCliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' })
        }

        return res.status(200).json({ sucesso: 'Perfil encontrado.', cliente })
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao visualizar perfil.', detalhes: error.message })
    }
}

// VER ATIVIADES INSCRITAS DO CLIENTE
const viewinscAtvClient = async (req, res) => {
    const { idCliente, refreshToken } = req.body
    if (!idCliente || !refreshToken) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const inscricoesAtividades = await prisma.inscricaoAtividade.findMany({
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
    const { idCliente, refreshToken } = req.body
    if (!idCliente || !refreshToken) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idCliente = decodedToken.id

        const inscricoesEventos = await prisma.inscricao.findMany({
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
    logClient
}