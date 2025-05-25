import { PrismaClient } from '../generated/prisma/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const prisma = new PrismaClient()
const JWT_SECRET = process.JWT_SECRET || 'includeJr'

const cadAdmin = async(req, res) => {
    const { nome, email, senha } = req.body
    if(senha.length < 8){
        res.status(400).json({erro: 'Erro, senha deve ter no mínimo 8 caracteres.'})
    }
    if(nome.length < 4){
        res.status(400).json({erro: 'Erro, nome deve ter no mínimo 4 caracteres.'})
    }
    const senhaCript = await bcrypt.hash(senha, 10)
    try{
        const novoUsuario = await prisma.administrador.create({
            data:{nome, email, senha: senhaCript}
        })
        res.status(201).json({sucesso: 'Usuário criado com sucesso.'})
    }catch(error){
        res.status(500).json({erro: 'Erro ao criar novo usuário administrador.', detalhes: error})
    }
}

const logAdmin = async(req, res) =>{
    const { email, senha } = req.body
    if(!email || !senha){
        res.status(400).json({erro: 'Email e senha são obrigatórios.'})
    }
    if(senha.length < 8){
        res.status(400).json({erro: 'Erro, senha deve ter no mínimo 8 caracteres.'})
    }

    try{
        const usuario = await prisma.administrador.findUnique({where: {email}})
        if(!usuario){
            res.status(404).json({erro: 'Usuário não encontrado.'})
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha)
        if(!senhaValida){
            res.status(400).json({erro: 'Senha inválida.'})
        }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({sucesso: 'Login realizado com sucesso.', token, id: usuario.id})
    }
    catch(error){
        res.status(500).json({erro: 'Erro ao realizar login.', detalhes: error})
    }
}

export default{
    cadAdmin,
    logAdmin
}