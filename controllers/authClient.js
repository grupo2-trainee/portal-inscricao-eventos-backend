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

// REFRESH TOKEN CLIENTE
const refreshTokenClient = async(req, res) =>{
    const { token } = req.body
    if(!token){
        res.status(403).json({erro: 'Token é obrigatório.'})
    }

    const refreshToken = await prisma.refreshTokenCliente.findUnique({where: { token }})
    if(!refreshToken){
        res.status(403).json({erro: "Usuário não autenticado."})
    }

    jwt.verify(token, JWT_SECRET, (err) => {
        if(err){
            res.status(403).json({erro: 'Autenticação inválida.'})
        }

        res.status(200).json({sucesso: "Token validado."})
    })
}

// LOGOUT CLIENTE
const logoutClient = async (req, res)=>{
    const { token } = req.body
    
    await prisma.refreshTokenCliente.deleteMany({where: { token }})

    res.json({sucesso: "Usuário deslogado com sucesso."})
}

export default{
    cadClient,
    logClient,
    refreshTokenClient,
    logoutClient
}


