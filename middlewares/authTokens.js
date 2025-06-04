import { PrismaClient } from '../generated/prisma/index.js'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'
const prisma = new PrismaClient()

// AUTENTICAÇÃO DE LOGIN ADMIN
const authTokenAdmin = async (req, res, next) => {
    const { refreshToken } = req.body
    if(!refreshToken){
        return res.status(403).json({erro: "Usuário sem token."})
    }

    let idAdmin
    let type
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id
        type = decodedToken.type
    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    if(!type || type != "ADMIN"){
        return res.status(403).json({erro: "Usuário não possui permissão."})
    }

    const idUsuario = await prisma.administrador.findUnique({where: { id: idAdmin }})
    if(!idUsuario){
        return res.status(403).json({erro: "Usuário não autenticado."})
    }

    return next()
}

// AUTENTICAÇÃO DE LOGIN CLIENTE
const authTokenClient = async (req, res, next) => {
    const { refreshToken } = req.body
    if(!refreshToken){
        return res.status(403).json({erro: "Usuário sem token."})
    }

    let idCliente
    let type
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idCliente = decodedToken.id
        type = decodedToken.type
    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    if(!type || type != "CLIENT"){
        return res.status(403).json({erro: "Usuário não possui permissão."})
    }

    const idUsuario = await prisma.cliente.findUnique({where: { id: idCliente }})
    if(!idUsuario){
        return res.status(403).json({erro: "Usuário não autenticado."})
    }

    return next()
};

export default{
    authTokenAdmin,
    authTokenClient
}