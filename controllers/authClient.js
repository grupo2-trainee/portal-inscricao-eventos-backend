import { PrismaClient } from '../generated/prisma/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const prisma = new PrismaClient()
const JWT_SECRET = process.JWT_SECRET || 'includeJr'

const cadClient = async(req, res) => {
    const { nome, email, senha } = req.body
    if(nome.length < 4){
        return res.status(400).json({erro: 'Nome deve ter no mínimo 4 caracteres.'})
    }else if(senha.length < 8){
        return res.status(400).json({erro: 'Senha deve ter no mínimo 8 caracteres.'})
    }
    const senhaCript = await bcrypt.hash(senha, 10)
    try{
        const novoUsuario = await prisma.Cliente.create({
            data:{nome, email,senha:senhaCript}
        })
        res.status(201).json({sucesso: "Usuário Cliente criado com sucesso."})
    }catch(error){
        res.status(400).json({erro: 'Erro ao criar novo usuário Cliente.', detalhes: error})
    }
}

const logClient = async(req, res) => {
    const { email, senha } = req.body
    if(!email || !senha){
        return res.status(400).json({erro: 'Email e senha são obrigatórios.'})
    }else if(senha.length < 8){
        return res.status(400).json({erro: 'Senha deve ter no mínimo 8 caracteres.'})
    }
    try{
        const usuario = await prisma.Cliente.findUnique({
            where: { email }
        })
        if(!usuario){
            return res.status(404).json({erro: 'Usuário não encontrado.'})
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha)
        if(!senhaValida){
            return res.status(401).json({erro: 'Senha inválida.'})
        }
        const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({sucesso: "Login realizado com sucesso.", token, id: usuario.id})
    }catch(error){
        res.status(400).json({erro: 'Erro ao realizar login.', detalhes: error})
    }

}

export default{
    cadClient,
    logClient
}


